'use client';

import type { User } from 'firebase/auth';
import type { Chatroom, Message as MessageType } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { getAnonymousDisplayName } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '@/components/chat/message';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ChatInterfaceProps {
  chatroom: Chatroom;
  user: User;
}

export default function ChatInterface({ chatroom, user }: ChatInterfaceProps) {
  const firestore = useFirestore();
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'chatrooms', chatroom.id, 'messages'),
            orderBy('createdAt', 'asc')
          )
        : null,
    [firestore, chatroom.id]
  );
  const { data: messages } = useCollection<MessageType>(messagesQuery);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        'div[data-radix-scroll-area-viewport]'
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !firestore) return;

    const messageData = {
      text: newMessage,
      senderId: user.uid,
      senderDisplayName: getAnonymousDisplayName(user.uid),
      createdAt: Timestamp.now(),
      isReported: false, // Default value
      chatroomId: chatroom.id, // For security rules
    };

    const colRef = collection(firestore, 'chatrooms', chatroom.id, 'messages');
    addDocumentNonBlocking(colRef, messageData);

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4 container mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-xl font-bold">{chatroom.name}</h2>
      </div>
      <ScrollArea className="flex-1 border rounded-lg p-4 bg-background" ref={scrollAreaRef}>
        <div className="flex flex-col gap-4">
          {messages && messages.map((msg) => (
            <Message key={msg.id} message={msg} currentUser={user} chatroomId={chatroom.id} />
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

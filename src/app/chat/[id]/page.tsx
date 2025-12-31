'use client';

import { useRouter, useParams } from 'next/navigation';
import { doc } from 'firebase/firestore';

import Header from '@/components/header';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { Chatroom } from '@/lib/types';
import ChatInterface from '@/components/chat/chat-interface';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ChatPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const chatroomId = params.id as string;

  const chatroomRef = useMemoFirebase(
    () => (firestore && chatroomId ? doc(firestore, 'chatrooms', chatroomId) : null),
    [firestore, chatroomId]
  );
  const { data: chatroom, isLoading: chatroomLoading } = useDoc<Chatroom>(chatroomRef);
  
  useEffect(() => {
    // Redirect to login if user auth check is done and there's no user.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const isLoading = isUserLoading || chatroomLoading;

  if (isLoading) {
    return (
        <div className="flex h-screen flex-col">
            <Header/>
            <div className="flex-1 flex flex-col p-4">
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="flex-1 border rounded-lg p-4 space-y-4">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-12 w-1/2 ml-auto" />
                    <Skeleton className="h-8 w-2/3" />
                </div>
                <div className="mt-4">
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        </div>
    );
  }

  // After loading, if user is present but chatroom is not, it means not found.
  if (user && !chatroom) {
     return (
        <div className="flex h-screen flex-col">
            <Header/>
            <main className="flex-1 container mx-auto p-4 md:p-6 flex items-center justify-center">
              <Card className="w-full max-w-lg text-center">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <WifiOff className="h-8 w-8 text-destructive"/>
                    Chatroom Not Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">This chatroom might have expired or never existed.</p>
                  <Button asChild>
                    <Link href="/">
                      <ArrowLeft className="mr-2" />
                      Back to Nearby Chatrooms
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </main>
        </div>
    )
  }
  
  // This state should ideally not be reached if the useEffect redirect works,
  // but it's a safe fallback. Also covers the brief moment before redirect.
  if (!user) {
    return (
       <div className="flex h-screen flex-col items-center justify-center">
           <p>Redirecting to login...</p>
       </div>
   )
 }

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <ChatInterface chatroom={chatroom} user={user} />
      </main>
    </div>
  );
}

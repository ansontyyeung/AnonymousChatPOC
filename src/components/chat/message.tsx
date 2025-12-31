'use client';
import type { User } from 'firebase/auth';
import type { Message as MessageType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User as UserIcon, MoreHorizontal, Flag } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { ReportDialog } from './report-dialog';


interface MessageProps {
    message: MessageType;
    currentUser: User;
    chatroomId: string;
}

export function Message({ message, currentUser, chatroomId }: MessageProps) {
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const isCurrentUser = message.senderId === currentUser.uid;

    const handleReport = () => {
        setIsReportDialogOpen(true);
    }
    
    return (
        <>
            <div className={cn('flex items-end gap-2', isCurrentUser ? 'justify-end' : 'justify-start')}>
                {!isCurrentUser && (
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-secondary">
                            <UserIcon size={16} />
                        </AvatarFallback>
                    </Avatar>
                )}
                <div
                    className={cn(
                        'max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 break-words',
                        isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                >
                    {!isCurrentUser && (
                        <p className="text-xs font-bold mb-1">{message.senderDisplayName}</p>
                    )}
                    <p className="text-sm">{message.text}</p>
                </div>
                {!isCurrentUser && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1 text-muted-foreground hover:text-foreground">
                                <MoreHorizontal size={16} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={handleReport} className="cursor-pointer">
                                <Flag className="mr-2 h-4 w-4" />
                                <span>Report Message</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
            <ReportDialog 
                isOpen={isReportDialogOpen}
                onOpenChange={setIsReportDialogOpen}
                message={message}
                reporterId={currentUser.uid}
                chatroomId={chatroomId}
            />
        </>
    );
}

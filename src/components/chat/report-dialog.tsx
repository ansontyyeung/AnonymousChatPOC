'use client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';
import type { Message } from '@/lib/types';
import { reportInappropriateContent } from '@/ai/flows/report-inappropriate-content';
import { useToast } from "@/hooks/use-toast";


interface ReportDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    message: Message;
    reporterId: string;
    chatroomId: string;
}

export function ReportDialog({ isOpen, onOpenChange, message, reporterId, chatroomId }: ReportDialogProps) {
    const [isReporting, setIsReporting] = useState(false);
    const { toast } = useToast();

    const handleReport = async () => {
        setIsReporting(true);
        try {
            const result = await reportInappropriateContent({
                message: message.text,
                reporterId: reporterId,
                reportedUserId: message.senderId,
                chatRoomId: chatroomId,
            });

            if (result.isToxic) {
                 toast({
                    title: "Report Submitted",
                    description: "Thank you for your report. Our team will review this content. Reason: " + result.reason,
                });
            } else {
                 toast({
                    title: "Report Submitted",
                    description: "Thank you for your report. Our team will review this content.",
                });
            }
        } catch (error) {
            console.error("Failed to report content:", error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Could not submit report. Please try again.",
            });
        } finally {
            setIsReporting(false);
            onOpenChange(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to report this message?</AlertDialogTitle>
                    <AlertDialogDescription>
                        <p className="mb-4">
                            You are about to report the following message as inappropriate:
                        </p>
                        <blockquote className="border-l-4 pl-4 italic text-muted-foreground">
                            "{message.text}"
                        </blockquote>
                        <p className="mt-4">
                            This action cannot be undone. Misuse of the report function may result in penalties.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isReporting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReport} disabled={isReporting}>
                        {isReporting ? 'Reporting...' : 'Confirm Report'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

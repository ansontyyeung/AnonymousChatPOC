'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import CreateChatroomForm from '@/components/chatrooms/create-form';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CreateChatroomPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full flex-col">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6 flex items-center justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6 flex items-center justify-center">
        <div className="w-full max-w-lg relative">
          <Button asChild variant="ghost" size="icon" className="absolute -top-12 left-0">
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
          <Card className="w-full">
              <CardHeader>
                  <CardTitle>Create a new Chatroom</CardTitle>
                  <CardDescription>
                      Your current location will be used as the center of the chatroom.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <CreateChatroomForm />
              </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

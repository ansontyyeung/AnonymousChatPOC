'use client';

import { useRouter } from 'next/navigation';
import { Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = () => {
    setIsSigningIn(true);
    // Use non-blocking sign-in. The onAuthStateChanged listener will handle the redirect.
    initiateAnonymousSignIn(auth);
  };

  if (isUserLoading || user) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="w-full max-w-sm p-8 space-y-4">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline">RadiusTalk</CardTitle>
          <CardDescription>Chat with people in your vicinity.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleSignIn}
            disabled={isSigningIn}
          >
            <Fingerprint className="mr-2 h-4 w-4" />
            {isSigningIn ? 'Connecting...' : 'Enter Anonymously'}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

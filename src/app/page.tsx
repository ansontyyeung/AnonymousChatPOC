'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, query } from 'firebase/firestore';
import { Plus, WifiOff } from 'lucide-react';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import Header from '@/components/header';
import { useGeolocation } from '@/lib/hooks/use-geolocation';
import type { Chatroom } from '@/lib/types';
import { calculateDistance } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();

  const chatroomsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'chatrooms')) : null),
    [firestore]
  );
  const { data: allChatrooms, isLoading: loadingChatrooms } = useCollection<Chatroom>(chatroomsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const nearbyChatrooms = useMemo(() => {
    if (!latitude || !longitude || !allChatrooms || allChatrooms.length === 0) return [];
    
    return allChatrooms
      .map(room => {
        // GeoPoint properties are accessed directly.
        const distance = calculateDistance(latitude, longitude, room.center.latitude, room.center.longitude);
        return { ...room, distance };
      })
      .filter((room): room is Chatroom & { distance: number } => room !== null && room.distance <= room.radius)
      .sort((a, b) => a.distance - b.distance);
  }, [allChatrooms, latitude, longitude]);

  if (isUserLoading || (!user && !isUserLoading)) {
    return (
        <div className="flex h-screen w-full flex-col">
            <Header />
            <main className="flex-1 p-4 md:p-6 container mx-auto">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                        <CardContent><Skeleton className="h-4 w-1/2" /></CardContent>
                        <CardFooter><Skeleton className="h-10 w-24" /></CardFooter>
                    </Card>
                    ))}
                </div>
            </main>
        </div>
    );
  }

  const isLoading = geoLoading || loadingChatrooms;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-6 container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Nearby Chatrooms</h1>
        
        {geoError && (
          <Card className="mb-4 bg-destructive/10 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">Location Error</CardTitle>
              <CardDescription className="text-destructive/80">
                {geoError}. Please enable location services in your browser settings to find chatrooms.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent><Skeleton className="h-4 w-1/2" /></CardContent>
                <CardFooter><Skeleton className="h-10 w-24" /></CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          !geoError && (
            nearbyChatrooms.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {nearbyChatrooms.map(room => (
                  <Card key={room.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle>{room.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardDescription>
                        {room.distance < 1000 
                          ? `${Math.round(room.distance)}m away`
                          : `${(room.distance / 1000).toFixed(1)}km away`
                        }
                      </CardDescription>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/chat/${room.id}`}>Join Chat</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 rounded-lg border-2 border-dashed">
                <WifiOff className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Chatrooms Found</h3>
                <p className="mt-1 text-sm text-muted-foreground">There are no active chatrooms in your vicinity.</p>
                <p className="text-sm text-muted-foreground">Why not start one?</p>
              </div>
            )
          )
        )}
      </main>
      <Button asChild className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg" size="icon">
        <Link href="/create">
          <Plus className="h-8 w-8" />
          <span className="sr-only">Create Chatroom</span>
        </Link>
      </Button>
    </div>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Timestamp, GeoPoint, collection } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useGeolocation } from '@/lib/hooks/use-geolocation';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.').max(50, 'Name must be at most 50 characters.'),
  radius: z.array(z.number()).length(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateChatroomForm() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { latitude, longitude, error: geoError } = useGeolocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      radius: [5000],
    },
  });

  async function onSubmit(values: FormValues) {
    if (!user || !latitude || !longitude || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not get user, location, or database service. Please try again.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const chatroomData = {
        name: values.name,
        radius: values.radius[0],
        center: new GeoPoint(latitude, longitude),
        createdAt: Timestamp.now(),
        creatorId: user.uid,
      };

      const chatroomsCollection = collection(firestore, 'chatrooms');
      // The non-blocking function returns the promise, so we can await it here.
      const docRef = await addDocumentNonBlocking(chatroomsCollection, chatroomData);
      
      toast({
        title: 'Success!',
        description: 'Chatroom created. Redirecting...',
      });

      if (docRef) {
        router.push(`/chat/${docRef.id}`);
      } else {
        // Fallback in case the non-blocking function has an issue, though it should throw an error.
        router.push('/');
      }

    } catch (error) {
      console.error('Error creating chatroom:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create chatroom. Please check your connection and try again.',
      });
      setIsSubmitting(false);
    }
  }

  if (geoError) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Location Error</AlertTitle>
        <AlertDescription>
          Could not access your location. Please enable location services to create a chatroom.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chatroom Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Downtown Coffee Lovers" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="radius"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Radius: {(field.value[0] / 1000).toFixed(1)} km</FormLabel>
              <FormControl>
                <Slider
                  min={500}
                  max={20000}
                  step={500}
                  onValueChange={(value) => field.onChange(value)}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting || !latitude || !longitude}>
          {isSubmitting ? 'Creating...' : 'Create Chatroom'}
        </Button>
      </form>
    </Form>
  );
}

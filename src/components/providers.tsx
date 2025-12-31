'use client';

import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            {children}
            <Toaster />
        </FirebaseClientProvider>
    )
}

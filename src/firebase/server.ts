import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeServerFirebase() {
  if (!getApps().length) {
    const firebaseApp = initializeApp({
        credential: credential.applicationDefault()
    });

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firestore: getFirestore(firebaseApp)
  };
}

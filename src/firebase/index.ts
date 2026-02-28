'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

/**
 * Initializes Firebase and returns the core SDK instances.
 * This function is idempotent and safe to call multiple times.
 */
export function initializeFirebase() {
  const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    database: getDatabase(firebaseApp),
    storage: getStorage(firebaseApp)
  };
}

/**
 * Helper to get SDKs directly if needed outside of the provider.
 * Note: Prefer using the hooks (useAuth, useFirestore) within components.
 */
export function getSdks() {
  return initializeFirebase();
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
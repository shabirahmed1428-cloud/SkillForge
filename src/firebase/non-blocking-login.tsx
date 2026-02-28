'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import { Firestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Database, ref, set } from 'firebase/database';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(() => {});
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password).catch(() => {});
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password).catch(() => {});
}

/** 
 * Initiate Google sign-in (non-blocking). 
 * Now optionally takes firestore and database to provision a profile for new social users.
 */
export function initiateGoogleSignIn(authInstance: Auth, firestore?: Firestore, database?: Database): void {
  const provider = new GoogleAuthProvider();
  
  // Use signInWithPopup directly as per non-blocking requirements
  signInWithPopup(authInstance, provider).then((result) => {
    const user = result.user;
    
    // Provision profile if it doesn't exist (idempotent)
    if (firestore && database) {
      const userRef = doc(firestore, 'users', user.uid);
      
      // Check if document exists before setting defaults
      getDoc(userRef).then((docSnap) => {
        if (!docSnap.exists()) {
          const profileData = {
            id: user.uid,
            name: user.displayName || 'Google User',
            email: user.email,
            role: 'student', // Default role for social login
            photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
            createdAt: serverTimestamp(),
            isBanned: false,
            storageUsedMB: 0,
            storageLimitMB: 500,
            subscriptionPlanId: 'free'
          };

          // Firestore Profile
          setDoc(userRef, profileData, { merge: true });
          
          // Realtime Database Link
          set(ref(database, "users/" + user.uid), { email: user.email });
        }
      });
    }
  }).catch((error) => {
    // Suppress common popup cancellation errors to prevent runtime crashes.
    if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
      return;
    }
    // Note: Other errors are handled centrally via onAuthStateChanged if they affect the session,
    // or you can add specific error reporting here if needed.
  });
}

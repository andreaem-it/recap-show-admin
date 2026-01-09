/**
 * Sistema di autenticazione per RecapShow Admin
 * Usa Firebase Authentication
 */

import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Verifica le credenziali dell'utente con Firebase Auth
 */
export async function login(email: string, password: string): Promise<boolean> {
  if (!auth) {
    throw new Error('Firebase Auth non configurato');
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return !!userCredential.user;
  } catch (error: any) {
    console.error('Errore autenticazione:', error);
    throw error;
  }
}

/**
 * Verifica se l'utente è autenticato
 */
export function isAuthenticated(): boolean {
  return !!auth?.currentUser;
}

/**
 * Logout dell'utente
 */
export async function logout(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Ottiene l'email dell'utente corrente
 */
export function getCurrentUsername(): string | null {
  return auth?.currentUser?.email || null;
}

/**
 * Ottiene l'utente corrente completo
 */
export function getCurrentUser(): User | null {
  return auth?.currentUser || null;
}

/**
 * Listener per cambiamenti dello stato di autenticazione
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    return () => {};
  }
  
  return onAuthStateChanged(auth, callback);
}


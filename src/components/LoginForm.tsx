'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await onLogin(username, password);
      if (success) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Errore login:', err);
      if (err.code === 'auth/invalid-credential') {
        setError('Email o password non valide');
      } else if (err.code === 'auth/user-not-found') {
        setError('Utente non trovato');
      } else if (err.code === 'auth/wrong-password') {
        setError('Password errata');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Errore durante il login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-dark-surface p-8 rounded-lg shadow-lg">
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-dark-text mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-4 py-2 bg-dark-surfaceSecondary border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-dark-primary"
          placeholder="Inserisci email"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-dark-text mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 bg-dark-surfaceSecondary border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-dark-primary"
          placeholder="Inserisci password"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-dark-error/20 border border-dark-error rounded-md text-dark-error text-sm">
          {error === 'Firebase: Error (auth/invalid-credential)' || error.includes('invalid-credential')
            ? 'Email o password non valide'
            : error.includes('auth/')
            ? 'Errore di autenticazione'
            : error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-dark-primary text-white rounded-md hover:bg-dark-primary/90 focus:outline-none focus:ring-2 focus:ring-dark-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Accesso in corso...' : 'Accedi'}
      </button>
    </form>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, onAuthChange } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener per cambiamenti dello stato di autenticazione
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-dark-textSecondary">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-dark-text mb-2">RecapShow Admin</h1>
          <p className="text-dark-textSecondary">Dashboard amministrativa</p>
        </div>
        <LoginForm onLogin={login} />
      </div>
    </div>
  );
}


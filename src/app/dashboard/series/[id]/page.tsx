'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { onAuthChange } from '@/lib/auth';
import { getSeriesDetails, TVSeries } from '@/lib/api';
import SeriesDetailForm from '@/components/SeriesDetailForm';
import Link from 'next/link';

export default function SeriesDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [series, setSeries] = useState<TVSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user) {
        router.push('/');
      } else if (id) {
        loadSeries();
      }
    });

    return () => unsubscribe();
  }, [id, router]);

  const loadSeries = async () => {
    console.log('[PAGE] === LOAD SERIES ===');
    console.log('[PAGE] Series ID:', id);
    try {
      setLoading(true);
      setError('');
      console.log('[PAGE] Chiamata getSeriesDetails...');
      const data = await getSeriesDetails(id);
      console.log('[PAGE] Dati caricati:', {
        id: data.id,
        title: data.title,
        seasonsCount: data.seasons?.length,
      });
      setSeries(data);
      console.log('[PAGE] === FINE LOAD SERIES (SUCCESSO) ===');
    } catch (err: any) {
      console.error('[PAGE] === ERRORE NEL CARICAMENTO ===');
      console.error('[PAGE] Tipo errore:', err?.constructor?.name);
      console.error('[PAGE] Messaggio errore:', err?.message);
      console.error('[PAGE] Stack trace:', err?.stack);
      setError(err.message || 'Errore nel caricamento della serie');
      console.log('[PAGE] === FINE LOAD SERIES (ERRORE) ===');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-background flex items-center justify-center">
        <div className="text-dark-textSecondary">Caricamento...</div>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="min-h-screen bg-dark-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Link
              href="/dashboard"
              className="text-dark-primary hover:underline"
            >
              ← Torna alla lista
            </Link>
          </div>
          <div className="p-4 bg-dark-error/20 border border-dark-error rounded-md text-dark-error">
            {error || 'Serie non trovata'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-dark-primary hover:underline"
          >
            ← Torna alla lista
          </Link>
        </div>
        <SeriesDetailForm series={series} onSave={loadSeries} />
      </div>
    </div>
  );
}


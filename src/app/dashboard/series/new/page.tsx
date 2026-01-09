'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/auth';
import SeriesDetailForm from '@/components/SeriesDetailForm';
import Link from 'next/link';

export default function NewSeriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user) {
        router.push('/');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Serie vuota di default
  const emptySeries = {
    id: '',
    title: '',
    startYear: new Date().getFullYear(),
    endYear: null,
    status: 'ongoing' as const,
    totalSeasons: 0,
    totalEpisodes: 0,
    originalNetwork: '',
    countries: [],
    tags: [],
    availability: [],
    description: '',
    imageUrl: '',
    category: 'Drama' as const,
    seasons: [],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-background flex items-center justify-center">
        <div className="text-dark-textSecondary">Caricamento...</div>
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
        <SeriesDetailForm series={emptySeries} />
      </div>
    </div>
  );
}


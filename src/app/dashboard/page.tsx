'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { logout, getCurrentUsername, onAuthChange } from '@/lib/auth';
import { getSeriesList, SeriesListItem, SeriesCategory } from '@/lib/api';
import SeriesList from '@/components/SeriesList';
import ImportNewSeriesModal from '@/components/ImportNewSeriesModal';
import Link from 'next/link';

const CATEGORIES: SeriesCategory[] = ['Drama', 'Fantasy', 'Crime', 'Comedy', 'Thriller', 'Sci-Fi', 'Action'];

export default function DashboardPage() {
  const router = useRouter();
  const [series, setSeries] = useState<SeriesListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SeriesCategory | 'Tutte'>('Tutte');
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    // Listener per autenticazione
    const unsubscribe = onAuthChange((user) => {
      if (!user) {
        router.push('/');
      } else {
        // Carica le serie solo se autenticato
        loadSeries();
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadSeries = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getSeriesList();
      setSeries(data);
    } catch (err: any) {
      setError(err.message || 'Errore nel caricamento delle serie');
      console.error('Errore:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Filtra le serie in base a ricerca e categoria
  const filteredSeries = useMemo(() => {
    return series.filter((serie) => {
      const matchesSearch = serie.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Tutte' || serie.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [series, searchQuery, selectedCategory]);

  // Calcola le statistiche totali
  const stats = useMemo(() => {
    const totalSeries = series.length;
    const totalSeasons = series.reduce((sum, serie) => sum + (serie.totalSeasons || 0), 0);
    const totalEpisodes = series.reduce((sum, serie) => sum + (serie.totalEpisodes || 0), 0);
    return { totalSeries, totalSeasons, totalEpisodes };
  }, [series]);

  return (
    <div className="min-h-screen bg-dark-background">
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-dark-text">RecapShow Admin</h1>
              <p className="text-sm text-dark-textSecondary">
                Benvenuto, {getCurrentUsername()}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard/reports"
                className="px-4 py-2 bg-dark-primary text-white rounded-md hover:bg-dark-primary/90 text-sm font-semibold"
              >
                Segnalazioni
              </Link>
              {/* Statistiche */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-dark-textSecondary">Serie</span>
                  <span className="font-semibold text-dark-text">{stats.totalSeries}</span>
                </div>
                <div className="h-4 w-px bg-dark-border"></div>
                <div className="flex items-center gap-2">
                  <span className="text-dark-textSecondary">Stagioni</span>
                  <span className="font-semibold text-dark-text">{stats.totalSeasons}</span>
                </div>
                <div className="h-4 w-px bg-dark-border"></div>
                <div className="flex items-center gap-2">
                  <span className="text-dark-textSecondary">Episodi</span>
                  <span className="font-semibold text-dark-text">{stats.totalEpisodes}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-dark-error text-white rounded-md hover:bg-dark-error/90"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-dark-text">Gestione Serie TV</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-dark-surfaceSecondary border border-dark-border text-dark-text rounded-md hover:bg-dark-surfaceSecondary/80 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Importa JSON
            </button>
            <Link
              href="/dashboard/series/new"
              className="px-4 py-2 bg-dark-primary text-white rounded-md hover:bg-dark-primary/90"
            >
              + Nuova Serie
            </Link>
          </div>
        </div>

        {/* Filtri di ricerca */}
        <div className="mb-6 flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-dark-text mb-2">
              Cerca per titolo
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Inserisci il titolo della serie..."
              className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-dark-primary"
            />
          </div>
          <div className="w-48">
            <label htmlFor="category" className="block text-sm font-medium text-dark-text mb-2">
              Categoria
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as SeriesCategory | 'Tutte')}
              className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-dark-primary"
            >
              <option value="Tutte">Tutte</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          {(searchQuery || selectedCategory !== 'Tutte') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Tutte');
              }}
              className="px-4 py-2 bg-dark-surfaceSecondary border border-dark-border rounded-md text-dark-text hover:bg-dark-surfaceSecondary/80"
            >
              Reset
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-dark-error/20 border border-dark-error rounded-md text-dark-error">
            {error}
            <button
              onClick={loadSeries}
              className="ml-4 text-dark-error underline"
            >
              Riprova
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-dark-textSecondary">Caricamento serie...</div>
          </div>
        ) : (
          <SeriesList series={filteredSeries} onRefresh={loadSeries} />
        )}

        {/* Modal Import Nuova Serie */}
        <ImportNewSeriesModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={(seriesId) => {
            loadSeries();
            // Il modal reindirizza già alla pagina di modifica
          }}
        />
      </main>
    </div>
  );
}


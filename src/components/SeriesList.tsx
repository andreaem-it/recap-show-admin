'use client';

import Link from 'next/link';
import { SeriesListItem } from '@/lib/api';

interface SeriesListProps {
  series: SeriesListItem[];
  onRefresh: () => void;
}

export default function SeriesList({ series, onRefresh }: SeriesListProps) {
  if (series.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-textSecondary mb-4">Nessuna serie trovata</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-dark-primary text-white rounded-md hover:bg-dark-primary/90"
        >
          Ricarica
        </button>
      </div>
    );
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-surfaceSecondary border-b border-dark-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                Immagine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                Titolo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                Anni
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                Stato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                Stagioni
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                Episodi
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {series.map((serie) => (
              <tr
                key={serie.id}
                className="hover:bg-dark-surfaceSecondary/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {serie.imageUrl ? (
                    <div className="w-16 h-24 bg-dark-surfaceSecondary rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={serie.imageUrl}
                        alt={serie.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-24 bg-dark-surfaceSecondary rounded flex items-center justify-center">
                      <span className="text-xs text-dark-textSecondary">N/A</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-dark-text">{serie.title}</div>
                  <div className="text-xs text-dark-textSecondary mt-1 line-clamp-2 max-w-md">
                    {serie.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs bg-dark-surfaceSecondary rounded text-dark-textSecondary">
                    {serie.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-textSecondary">
                  {serie.startYear}{serie.endYear ? `-${serie.endYear}` : serie.status === 'ongoing' ? '-' : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      serie.status === 'ended'
                        ? 'bg-dark-success/20 text-dark-success'
                        : 'bg-dark-warning/20 text-dark-warning'
                    }`}
                  >
                    {serie.status === 'ended' ? 'Conclusa' : 'In corso'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-textSecondary">
                  {serie.totalSeasons}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-textSecondary">
                  {serie.totalEpisodes}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/dashboard/series/${serie.id}`}
                    className="text-dark-primary hover:text-dark-primary/80"
                  >
                    Modifica
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-dark-surfaceSecondary border-t border-dark-border">
        <p className="text-sm text-dark-textSecondary">
          Totale: <span className="font-medium text-dark-text">{series.length}</span> serie
        </p>
      </div>
    </div>
  );
}


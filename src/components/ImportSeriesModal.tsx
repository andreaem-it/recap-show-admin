'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { importSeriesFromJSON, readJSONFile } from '@/lib/exportImport';

interface ImportSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportSeriesModal({ isOpen, onClose, onSuccess }: ImportSeriesModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [importedSeriesId, setImportedSeriesId] = useState<string | null>(null);
  const [updateIfExists, setUpdateIfExists] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('Il file deve essere un file JSON (.json)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      setImportedSeriesId(null);

      // Leggi il file
      const jsonData = await readJSONFile(file);

      // Importa la serie
      const result = await importSeriesFromJSON(jsonData, { updateIfExists });

      if (result.success && result.seriesId) {
        setSuccess(true);
        setImportedSeriesId(result.seriesId);
        
        if (onSuccess) {
          onSuccess();
        }
        
        // Chiudi il modal dopo 2 secondi e reindirizza
        setTimeout(() => {
          router.push(`/dashboard/series/${result.seriesId}`);
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Errore nell\'importazione');
      }
    } catch (err: any) {
      console.error('Errore nell\'importazione:', err);
      setError(err.message || 'Errore nell\'importazione del file');
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('Il file deve essere un file JSON (.json)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      setImportedSeriesId(null);

      const jsonData = await readJSONFile(file);
      const result = await importSeriesFromJSON(jsonData, { updateIfExists });

      if (result.success && result.seriesId) {
        setSuccess(true);
        setImportedSeriesId(result.seriesId);
        
        if (onSuccess) {
          onSuccess();
        }
        
        setTimeout(() => {
          router.push(`/dashboard/series/${result.seriesId}`);
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Errore nell\'importazione');
      }
    } catch (err: any) {
      console.error('Errore nell\'importazione:', err);
      setError(err.message || 'Errore nell\'importazione del file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-dark-surface border border-dark-border rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-dark-text mb-4">Importa Serie JSON</h2>

        {error && (
          <div className="mb-4 p-4 bg-dark-error/20 border border-dark-error rounded-md text-dark-error text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-dark-success/20 border border-dark-success rounded-md text-dark-success text-sm">
            Serie importata con successo! Reindirizzamento...
          </div>
        )}

        <div
          className="border-2 border-dashed border-dark-border rounded-lg p-8 text-center mb-4"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
            disabled={loading}
          />
          <label
            htmlFor="file-input"
            className="cursor-pointer block"
          >
            <div className="mb-2">
              <svg className="w-12 h-12 mx-auto text-dark-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-dark-text mb-2">
              {loading ? 'Caricamento...' : 'Clicca o trascina qui il file JSON'}
            </div>
            <div className="text-sm text-dark-textSecondary">
              Formato supportato: .json
            </div>
          </label>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 text-dark-text cursor-pointer">
            <input
              type="checkbox"
              checked={updateIfExists}
              onChange={(e) => setUpdateIfExists(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">
              Aggiorna serie esistente se l'ID corrisponde
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-dark-surfaceSecondary border border-dark-border text-dark-text rounded-md hover:bg-dark-surfaceSecondary/80 disabled:opacity-50"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}


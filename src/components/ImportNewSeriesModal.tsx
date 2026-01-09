'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateSeriesJSON, parseJSONString, createSeriesFromJSON, extractSeriesPreview } from '@/lib/exportImport';
import { SeriesListItem } from '@/lib/api';

interface ImportNewSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (seriesId: string) => void;
}

export default function ImportNewSeriesModal({ isOpen, onClose, onSuccess }: ImportNewSeriesModalProps) {
  const router = useRouter();
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<SeriesListItem | null>(null);
  const [verified, setVerified] = useState(false);
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  const handleVerify = () => {
    try {
      setError('');
      setVerified(false);
      setPreview(null);

      if (!jsonText.trim()) {
        setError('Incolla il JSON da importare');
        return;
      }

      // Parse JSON
      const jsonData = parseJSONString(jsonText);

      // Valida
      const validation = validateSeriesJSON(jsonData);
      if (!validation.valid) {
        setError(validation.error || 'JSON non valido');
        return;
      }

      // Estrai anteprima
      const seriesPreview = extractSeriesPreview(jsonData);
      if (!seriesPreview) {
        setError('Impossibile estrarre i dati della serie dal JSON');
        return;
      }

      setPreview(seriesPreview);
      setVerified(true);
    } catch (err: any) {
      setError(err.message || 'Errore nella verifica');
      setVerified(false);
    }
  };

  const handleImport = async () => {
    if (!verified) {
      return;
    }

    try {
      setImporting(true);
      setError('');

      const jsonData = parseJSONString(jsonText);
      const result = await createSeriesFromJSON(jsonData);

      if (result.success && result.seriesId) {
        if (onSuccess) {
          onSuccess(result.seriesId);
        }
        // Reindirizza alla pagina di modifica della nuova serie
        router.push(`/dashboard/series/${result.seriesId}`);
        onClose();
        // Reset form
        setJsonText('');
        setVerified(false);
        setPreview(null);
      } else {
        setError(result.error || 'Errore nell\'importazione');
      }
    } catch (err: any) {
      console.error('Errore nell\'importazione:', err);
      setError(err.message || 'Errore nell\'importazione');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setJsonText('');
    setError('');
    setPreview(null);
    setVerified(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
      <div
        className="bg-dark-surface border border-dark-border rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-dark-text mb-4">Importa Nuova Serie da JSON</h2>

        {error && (
          <div className="mb-4 p-4 bg-dark-error/20 border border-dark-error rounded-md text-dark-error text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Textarea per JSON */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Incolla il JSON della serie
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setVerified(false);
                setPreview(null);
              }}
              rows={20}
              className="w-full px-4 py-2 bg-dark-surfaceSecondary border border-dark-border rounded-md text-dark-text font-mono text-sm focus:outline-none focus:ring-2 focus:ring-dark-primary"
              placeholder="Incolla qui il JSON della serie..."
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleVerify}
                disabled={!jsonText.trim() || importing}
                className="px-4 py-2 bg-dark-primary text-white rounded-md hover:bg-dark-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verifica
              </button>
              <button
                onClick={() => {
                  setJsonText('');
                  setVerified(false);
                  setPreview(null);
                  setError('');
                }}
                className="px-4 py-2 bg-dark-surfaceSecondary border border-dark-border text-dark-text rounded-md hover:bg-dark-surfaceSecondary/80"
              >
                Pulisci
              </button>
            </div>
          </div>

          {/* Anteprima serie */}
          <div>
            <h3 className="text-lg font-semibold text-dark-text mb-4">Anteprima Serie</h3>
            
            {!verified ? (
              <div className="bg-dark-surfaceSecondary border border-dark-border rounded-lg p-8 text-center">
                <p className="text-dark-textSecondary">
                  Incolla il JSON e clicca "Verifica" per vedere l'anteprima
                </p>
              </div>
            ) : preview ? (
              <div className="space-y-4">
                <div className="bg-dark-surfaceSecondary border border-dark-border rounded-lg p-4">
                  {/* Immagine */}
                  {preview.imageUrl && (
                    <div className="mb-4">
                      <div className="w-full h-48 bg-dark-surfaceSecondary rounded overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preview.imageUrl}
                          alt={preview.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Informazioni principali */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-lg font-semibold text-dark-text mb-1">{preview.title}</h4>
                      <p className="text-sm text-dark-textSecondary line-clamp-3">{preview.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-dark-textSecondary">Categoria:</span>
                        <span className="ml-2 px-2 py-1 text-xs bg-dark-surface rounded text-dark-text">
                          {preview.category}
                        </span>
                      </div>
                      <div>
                        <span className="text-dark-textSecondary">Anni:</span>
                        <span className="ml-2 text-dark-text">
                          {preview.startYear}{preview.endYear ? `-${preview.endYear}` : preview.status === 'ongoing' ? '-' : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-dark-textSecondary">Stato:</span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs rounded ${
                            preview.status === 'ended'
                              ? 'bg-dark-success/20 text-dark-success'
                              : 'bg-dark-warning/20 text-dark-warning'
                          }`}
                        >
                          {preview.status === 'ended' ? 'Conclusa' : 'In corso'}
                        </span>
                      </div>
                      <div>
                        <span className="text-dark-textSecondary">Stagioni:</span>
                        <span className="ml-2 text-dark-text">{preview.totalSeasons}</span>
                      </div>
                      <div>
                        <span className="text-dark-textSecondary">Episodi:</span>
                        <span className="ml-2 text-dark-text">{preview.totalEpisodes}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pulsante importa */}
                <div className="bg-dark-primary/20 border border-dark-primary rounded-lg p-4">
                  <p className="text-dark-text font-medium mb-4">
                    Pronto per creare la nuova serie
                  </p>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="w-full px-4 py-2 bg-dark-primary text-white rounded-md hover:bg-dark-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing ? 'Creazione in corso...' : 'Crea Serie'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-dark-error/20 border border-dark-error rounded-lg p-8 text-center">
                <p className="text-dark-error font-medium">
                  Errore nell'estrazione dell'anteprima
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleClose}
            disabled={importing}
            className="px-4 py-2 bg-dark-surfaceSecondary border border-dark-border text-dark-text rounded-md hover:bg-dark-surfaceSecondary/80 disabled:opacity-50"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}


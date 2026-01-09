'use client';

import { useState } from 'react';
import { TVSeries } from '@/lib/api';
import { validateSeriesJSON, compareSeries, parseJSONString, importSeriesFromJSON, Change } from '@/lib/exportImport';

interface ImportJSONModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSeries: TVSeries;
  onSuccess?: () => void;
}

export default function ImportJSONModal({ isOpen, onClose, currentSeries, onSuccess }: ImportJSONModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [changes, setChanges] = useState<Change[]>([]);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstConfirm, setFirstConfirm] = useState(false);
  const [secondConfirm, setSecondConfirm] = useState(false);
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  const handleVerify = () => {
    try {
      setError('');
      setVerified(false);
      setChanges([]);
      setFirstConfirm(false);
      setSecondConfirm(false);

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

      // Confronta con la serie corrente
      const detectedChanges = compareSeries(currentSeries, jsonData);
      setChanges(detectedChanges);
      setVerified(true);
    } catch (err: any) {
      setError(err.message || 'Errore nella verifica');
      setVerified(false);
    }
  };

  const handleImport = async () => {
    if (!firstConfirm || !secondConfirm) {
      console.warn('[MODAL] Import bloccato: conferme mancanti', { firstConfirm, secondConfirm });
      return;
    }

    try {
      console.log('[MODAL] === INIZIO HANDLE IMPORT ===');
      console.log('[MODAL] Current Series ID:', currentSeries.id);
      console.log('[MODAL] Current Series Title:', currentSeries.title);
      console.log('[MODAL] JSON Text length:', jsonText.length);
      
      setImporting(true);
      setError('');

      console.log('[MODAL] Parsing JSON...');
      const jsonData = parseJSONString(jsonText);
      console.log('[MODAL] JSON parsato:', {
        title: jsonData.title,
        category: jsonData.category,
        seasonsCount: jsonData.seasons?.length,
      });
      
      console.log('[MODAL] Chiamata importSeriesFromJSON...');
      const result = await importSeriesFromJSON(jsonData, currentSeries.id);
      console.log('[MODAL] Risultato import:', result);

      if (result.success) {
        console.log('[MODAL] Import completato con successo');
        if (onSuccess) {
          console.log('[MODAL] Chiamata callback onSuccess...');
          onSuccess();
        }
        console.log('[MODAL] Chiusura modal...');
        onClose();
        // Reset form
        setJsonText('');
        setVerified(false);
        setChanges([]);
        setFirstConfirm(false);
        setSecondConfirm(false);
        console.log('[MODAL] === FINE HANDLE IMPORT (SUCCESSO) ===');
      } else {
        console.error('[MODAL] Import fallito:', result.error);
        setError(result.error || 'Errore nell\'importazione');
        console.log('[MODAL] === FINE HANDLE IMPORT (ERRORE) ===');
      }
    } catch (err: any) {
      console.error('[MODAL] === ERRORE NELL\'IMPORTAZIONE ===');
      console.error('[MODAL] Tipo errore:', err?.constructor?.name);
      console.error('[MODAL] Messaggio errore:', err?.message);
      console.error('[MODAL] Stack trace:', err?.stack);
      console.error('[MODAL] Errore completo:', err);
      setError(err.message || 'Errore nell\'importazione');
      console.log('[MODAL] === FINE HANDLE IMPORT (ERRORE) ===');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setJsonText('');
    setError('');
    setChanges([]);
    setVerified(false);
    setFirstConfirm(false);
    setSecondConfirm(false);
    onClose();
  };

  const getChangeTypeColor = (type: Change['type']) => {
    switch (type) {
      case 'added':
        return 'text-dark-success';
      case 'removed':
        return 'text-dark-error';
      case 'modified':
        return 'text-dark-warning';
      default:
        return 'text-dark-text';
    }
  };

  const getChangeTypeLabel = (type: Change['type']) => {
    switch (type) {
      case 'added':
        return 'Aggiunto';
      case 'removed':
        return 'Rimosso';
      case 'modified':
        return 'Modificato';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
      <div
        className="bg-dark-surface border border-dark-border rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-dark-text mb-4">Importa JSON</h2>

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
                setChanges([]);
                setFirstConfirm(false);
                setSecondConfirm(false);
              }}
              rows={20}
              className="w-full px-4 py-2 bg-dark-surfaceSecondary border border-dark-border rounded-md text-dark-text font-mono text-sm focus:outline-none focus:ring-2 focus:ring-dark-primary"
              placeholder="Incolla qui il JSON della serie..."
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleVerify}
                disabled={!jsonText.trim() || loading}
                className="px-4 py-2 bg-dark-primary text-white rounded-md hover:bg-dark-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verifica
              </button>
              <button
                onClick={() => {
                  setJsonText('');
                  setVerified(false);
                  setChanges([]);
                  setError('');
                  setFirstConfirm(false);
                  setSecondConfirm(false);
                }}
                className="px-4 py-2 bg-dark-surfaceSecondary border border-dark-border text-dark-text rounded-md hover:bg-dark-surfaceSecondary/80"
              >
                Pulisci
              </button>
            </div>
          </div>

          {/* Card dei cambiamenti */}
          <div>
            <h3 className="text-lg font-semibold text-dark-text mb-4">Modifiche rilevate</h3>
            
            {!verified ? (
              <div className="bg-dark-surfaceSecondary border border-dark-border rounded-lg p-8 text-center">
                <p className="text-dark-textSecondary">
                  Incolla il JSON e clicca "Verifica" per vedere le modifiche
                </p>
              </div>
            ) : changes.length === 0 ? (
              <div className="bg-dark-success/20 border border-dark-success rounded-lg p-8 text-center">
                <p className="text-dark-success font-medium">
                  Nessuna modifica rilevata. Il JSON è identico alla serie corrente.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-dark-surfaceSecondary border border-dark-border rounded-lg p-4">
                  <p className="text-sm text-dark-textSecondary mb-2">
                    Trovate {changes.length} modifica{changes.length !== 1 ? 'he' : ''}:
                  </p>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {changes.map((change, index) => (
                      <div key={index} className="border-b border-dark-border pb-3 last:border-0">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-medium text-dark-text">{change.field}</span>
                          <span className={`text-xs font-semibold ${getChangeTypeColor(change.type)}`}>
                            {getChangeTypeLabel(change.type)}
                          </span>
                        </div>
                        {change.type === 'modified' && (
                          <>
                            <div className="text-xs text-dark-textSecondary mt-1">
                              <span className="font-medium">Prima:</span>{' '}
                              {typeof change.oldValue === 'object' 
                                ? JSON.stringify(change.oldValue).substring(0, 100)
                                : String(change.oldValue).substring(0, 100)}
                            </div>
                            <div className="text-xs text-dark-textSecondary mt-1">
                              <span className="font-medium">Dopo:</span>{' '}
                              {typeof change.newValue === 'object'
                                ? JSON.stringify(change.newValue).substring(0, 100)
                                : String(change.newValue).substring(0, 100)}
                            </div>
                          </>
                        )}
                        {change.type === 'added' && (
                          <div className="text-xs text-dark-success mt-1">
                            {String(change.newValue)}
                          </div>
                        )}
                        {change.type === 'removed' && (
                          <div className="text-xs text-dark-error mt-1">
                            {String(change.oldValue)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doppia conferma */}
                {!firstConfirm ? (
                  <div className="bg-dark-warning/20 border border-dark-warning rounded-lg p-4">
                    <p className="text-dark-text font-medium mb-3">
                      ATTENZIONE: Stai per sovrascrivere i dati della serie corrente
                    </p>
                    <p className="text-sm text-dark-textSecondary mb-4">
                      Sei sicuro di voler procedere con l'importazione?
                    </p>
                    <button
                      onClick={() => setFirstConfirm(true)}
                      className="w-full px-4 py-2 bg-dark-warning text-white rounded-md hover:bg-dark-warning/90"
                    >
                      Sì, voglio procedere
                    </button>
                  </div>
                ) : !secondConfirm ? (
                  <div className="bg-dark-error/20 border border-dark-error rounded-lg p-4">
                    <p className="text-dark-text font-medium mb-3">
                      ULTIMA CONFERMA RICHIESTA
                    </p>
                    <p className="text-sm text-dark-textSecondary mb-4">
                      Questa operazione non può essere annullata. I dati attuali verranno sostituiti con quelli del JSON.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setFirstConfirm(false);
                          setSecondConfirm(false);
                        }}
                        className="flex-1 px-4 py-2 bg-dark-surfaceSecondary border border-dark-border text-dark-text rounded-md hover:bg-dark-surfaceSecondary/80"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={() => setSecondConfirm(true)}
                        className="flex-1 px-4 py-2 bg-dark-error text-white rounded-md hover:bg-dark-error/90"
                      >
                        Confermo, importa
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-dark-primary/20 border border-dark-primary rounded-lg p-4">
                    <p className="text-dark-text font-medium mb-4">
                      Pronto per l'importazione
                    </p>
                    <button
                      onClick={handleImport}
                      disabled={importing}
                      className="w-full px-4 py-2 bg-dark-primary text-white rounded-md hover:bg-dark-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {importing ? 'Importazione in corso...' : 'Avvia Importazione'}
                    </button>
                  </div>
                )}
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


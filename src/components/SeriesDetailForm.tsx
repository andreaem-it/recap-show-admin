'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TVSeries, Season, Episode, updateSeries, createSeries, getSeriesDetails } from '@/lib/api';
import { exportSeriesToJSON } from '@/lib/exportImport';
import ImportJSONModal from './ImportJSONModal';
import SeasonEditor from './SeasonEditor';

interface SeriesDetailFormProps {
  series: TVSeries;
  onSave?: () => void;
}

export default function SeriesDetailForm({ series, onSave }: SeriesDetailFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<TVSeries>(series);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleChange = (field: keyof TVSeries, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSeasonChange = (index: number, season: Season) => {
    const newSeasons = [...formData.seasons];
    newSeasons[index] = season;
    handleChange('seasons', newSeasons);
  };

  const handleAddSeason = () => {
    const newSeason: Season = {
      id: `${formData.id}-s${formData.seasons.length + 1}`,
      seasonNumber: formData.seasons.length + 1,
      title: `Stagione ${formData.seasons.length + 1}`,
      episodes: [],
      recap: '',
      curiosities: [],
      spoilers: [],
    };
    handleChange('seasons', [...formData.seasons, newSeason]);
  };

  const handleRemoveSeason = (index: number) => {
    const newSeasons = formData.seasons.filter((_, i) => i !== index);
    handleChange('seasons', newSeasons);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess(false);
      
      // Verifica se è una nuova serie (id vuoto o non presente)
      const isNewSeries = !formData.id || formData.id.trim() === '';
      
      if (isNewSeries) {
        // Crea nuova serie
        const { id, ...seriesData } = formData;
        const newSeries = await createSeries(seriesData);
        setFormData(newSeries);
        setSuccess(true);
        
        // Reindirizza alla pagina di modifica della nuova serie
        setTimeout(() => {
          router.push(`/dashboard/series/${newSeries.id}`);
        }, 1500);
      } else {
        // Aggiorna serie esistente
        await updateSeries(formData.id, formData);
        setSuccess(true);
        if (onSave) onSave();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error('Errore nel salvataggio:', err);
      setError(err.message || 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <h2 className="text-2xl font-bold text-dark-text mb-6">Modifica Serie: {formData.title}</h2>

      {error && (
        <div className="mb-4 p-4 bg-dark-error/20 border border-dark-error rounded-md text-dark-error">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-dark-success/20 border border-dark-success rounded-md text-dark-success">
          Serie salvata con successo!
        </div>
      )}

      {/* Informazioni Base */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-dark-text mb-4">Informazioni Base</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">ID</label>
            <input
              type="text"
              value={formData.id}
              disabled
              className="w-full px-4 py-2 bg-dark-surfaceSecondary border border-dark-border rounded-md text-dark-textSecondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Titolo</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 bg-dark-surfaceSecondary border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-dark-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Categoria</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-4 py-2 bg-dark-surfaceSecondary border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-dark-primary"
            >
              <option value="Drama">Drama</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Crime">Crime</option>
              <option value="Comedy">Comedy</option>
              <option value="Thriller">Thriller</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Action">Action</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl || ''}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              className="w-full px-4 py-2 bg-dark-surfaceSecondary border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-dark-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Anno Inizio</label>
            <input
              type="number"
              value={formData.startYear}
              onChange={(e) => handleChange('startYear', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-dark-surfaceSecondary border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-dark-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Anno Fine</label>
            <input
              type="number"
              value={formData.endYear || ''}
              onChange={(e) => handleChange('endYear', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 bg-dark-surfaceSecondary border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-dark-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Stato</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-4 py-2 bg-dark-surfaceSecondary border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-dark-primary"
            >
              <option value="ongoing">In corso</option>
              <option value="ended">Conclusa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Network</label>
            <input
              type="text"
              value={formData.originalNetwork}
              onChange={(e) => handleChange('originalNetwork', e.target.value)}
              className="w-full px-4 py-2 bg-dark-surfaceSecondary border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-dark-primary"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-dark-text mb-2">Descrizione</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-dark-surfaceSecondary border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-dark-primary"
          />
        </div>
      </div>

      {/* Stagioni */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-dark-text">Stagioni ({formData.seasons.length})</h3>
          <button
            onClick={handleAddSeason}
            className="px-4 py-2 bg-dark-primary text-white rounded-md hover:bg-dark-primary/90"
          >
            + Aggiungi Stagione
          </button>
        </div>
        {formData.seasons.map((season, index) => (
          <SeasonEditor
            key={season.id}
            season={season}
            onChange={(updatedSeason) => handleSeasonChange(index, updatedSeason)}
            onRemove={() => handleRemoveSeason(index)}
          />
        ))}
      </div>

      {/* Pulsanti Azioni */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-3">
          <button
            onClick={() => exportSeriesToJSON(formData)}
            className="px-6 py-2 bg-dark-surfaceSecondary border border-dark-border text-dark-text rounded-md hover:bg-dark-surfaceSecondary/80 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Esporta JSON
          </button>
          {formData.id && (
            <button
              onClick={() => setShowImportModal(true)}
              className="px-6 py-2 bg-dark-surfaceSecondary border border-dark-border text-dark-text rounded-md hover:bg-dark-surfaceSecondary/80 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Importa JSON
            </button>
          )}
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-dark-primary text-white rounded-md hover:bg-dark-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </div>

      {/* Modal Import JSON */}
      {formData.id && (
        <ImportJSONModal
          isOpen={showImportModal}
          onClose={() => {
            console.log('[FORM] Chiusura modal import');
            setShowImportModal(false);
          }}
          currentSeries={formData}
          onSuccess={async () => {
            console.log('[FORM] === CALLBACK ON SUCCESS ===');
            console.log('[FORM] Ricaricamento dati serie...');
            if (onSave) {
              console.log('[FORM] Chiamata onSave callback...');
              await onSave();
              console.log('[FORM] onSave completato');
            }
            // Ricarica anche i dati locali
            try {
              console.log('[FORM] Ricaricamento formData locale...');
              const updatedSeries = await getSeriesDetails(formData.id);
              console.log('[FORM] Dati aggiornati:', {
                id: updatedSeries.id,
                title: updatedSeries.title,
                seasonsCount: updatedSeries.seasons?.length,
              });
              setFormData(updatedSeries);
              console.log('[FORM] formData aggiornato');
            } catch (err: any) {
              console.error('[FORM] Errore nel ricaricamento formData:', err);
            }
            setShowImportModal(false);
            console.log('[FORM] === FINE CALLBACK ON SUCCESS ===');
          }}
        />
      )}
    </div>
  );
}


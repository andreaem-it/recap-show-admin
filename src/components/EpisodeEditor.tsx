'use client';

import { useState } from 'react';
import { Episode } from '@/lib/api';

interface EpisodeEditorProps {
  episode: Episode;
  onChange: (episode: Episode) => void;
  onRemove: () => void;
}

export default function EpisodeEditor({ episode, onChange, onRemove }: EpisodeEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (field: keyof Episode, value: any) => {
    onChange({ ...episode, [field]: value });
  };

  const handleImportantMinuteAdd = () => {
    const newMinutes = [...(episode.importantMinutes || []), { start: 0, end: 0, description: '' }];
    handleChange('importantMinutes', newMinutes);
  };

  const handleImportantMinuteChange = (index: number, field: 'start' | 'end' | 'description', value: any) => {
    const newMinutes = [...(episode.importantMinutes || [])];
    newMinutes[index] = { ...newMinutes[index], [field]: value };
    handleChange('importantMinutes', newMinutes);
  };

  const handleImportantMinuteRemove = (index: number) => {
    const newMinutes = (episode.importantMinutes || []).filter((_, i) => i !== index);
    handleChange('importantMinutes', newMinutes);
  };

  return (
    <div className="border border-dark-border rounded-md p-3 bg-dark-surface">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-dark-textSecondary">
            E{episode.episodeNumber}
          </span>
          <input
            type="text"
            value={episode.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="flex-1 px-2 py-1 bg-dark-surfaceSecondary border border-dark-border rounded text-dark-text text-sm"
            placeholder="Titolo episodio"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 text-xs bg-dark-surfaceSecondary border border-dark-border rounded text-dark-text"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <button
            onClick={onRemove}
            className="px-2 py-1 text-xs bg-dark-error text-white rounded hover:bg-dark-error/90"
          >
            ×
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-dark-textSecondary mb-1">ID</label>
              <input
                type="text"
                value={episode.id}
                onChange={(e) => handleChange('id', e.target.value)}
                className="w-full px-2 py-1 bg-dark-surfaceSecondary border border-dark-border rounded text-dark-text text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-textSecondary mb-1">Stagione</label>
              <input
                type="number"
                value={episode.seasonNumber}
                onChange={(e) => handleChange('seasonNumber', parseInt(e.target.value))}
                className="w-full px-2 py-1 bg-dark-surfaceSecondary border border-dark-border rounded text-dark-text text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-textSecondary mb-1">Episodio</label>
              <input
                type="number"
                value={episode.episodeNumber}
                onChange={(e) => handleChange('episodeNumber', parseInt(e.target.value))}
                className="w-full px-2 py-1 bg-dark-surfaceSecondary border border-dark-border rounded text-dark-text text-xs"
              />
            </div>
          </div>

          {/* Minuti Importanti */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-dark-textSecondary">
                Minuti Importanti ({episode.importantMinutes?.length || 0})
              </label>
              <button
                onClick={handleImportantMinuteAdd}
                className="px-2 py-1 text-xs bg-dark-primary text-white rounded hover:bg-dark-primary/90"
              >
                + Aggiungi
              </button>
            </div>
            <div className="space-y-2">
              {(episode.importantMinutes || []).map((minute, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={minute.start}
                      onChange={(e) => handleImportantMinuteChange(index, 'start', parseInt(e.target.value))}
                      placeholder="Inizio"
                      className="w-full px-2 py-1 bg-dark-surfaceSecondary border border-dark-border rounded text-dark-text text-xs"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={minute.end}
                      onChange={(e) => handleImportantMinuteChange(index, 'end', parseInt(e.target.value))}
                      placeholder="Fine"
                      className="w-full px-2 py-1 bg-dark-surfaceSecondary border border-dark-border rounded text-dark-text text-xs"
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={minute.description || ''}
                      onChange={(e) => handleImportantMinuteChange(index, 'description', e.target.value)}
                      placeholder="Descrizione"
                      className="w-full px-2 py-1 bg-dark-surfaceSecondary border border-dark-border rounded text-dark-text text-xs"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => handleImportantMinuteRemove(index)}
                      className="w-full px-2 py-1 text-xs bg-dark-error text-white rounded hover:bg-dark-error/90"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


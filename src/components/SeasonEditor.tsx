'use client';

import { useState } from 'react';
import { Season, Episode } from '@/lib/api';
import EpisodeEditor from './EpisodeEditor';

interface SeasonEditorProps {
  season: Season;
  onChange: (season: Season) => void;
  onRemove: () => void;
}

export default function SeasonEditor({ season, onChange, onRemove }: SeasonEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (field: keyof Season, value: any) => {
    onChange({ ...season, [field]: value });
  };

  const handleEpisodeChange = (index: number, episode: Episode) => {
    const newEpisodes = [...season.episodes];
    newEpisodes[index] = episode;
    handleChange('episodes', newEpisodes);
  };

  const handleAddEpisode = () => {
    const newEpisode: Episode = {
      id: `${season.id}-e${season.episodes.length + 1}`,
      seasonNumber: season.seasonNumber,
      episodeNumber: season.episodes.length + 1,
      title: `Episodio ${season.episodes.length + 1}`,
      importantMinutes: [],
    };
    handleChange('episodes', [...season.episodes, newEpisode]);
  };

  const handleRemoveEpisode = (index: number) => {
    const newEpisodes = season.episodes.filter((_, i) => i !== index);
    handleChange('episodes', newEpisodes);
  };

  const handleCuriosityAdd = () => {
    const newCuriosities = [...(season.curiosities || []), ''];
    handleChange('curiosities', newCuriosities);
  };

  const handleCuriosityChange = (index: number, value: string) => {
    const newCuriosities = [...(season.curiosities || [])];
    newCuriosities[index] = value;
    handleChange('curiosities', newCuriosities);
  };

  const handleCuriosityRemove = (index: number) => {
    const newCuriosities = (season.curiosities || []).filter((_, i) => i !== index);
    handleChange('curiosities', newCuriosities);
  };

  const handleSpoilerAdd = () => {
    const newSpoilers = [...(season.spoilers || []), ''];
    handleChange('spoilers', newSpoilers);
  };

  const handleSpoilerChange = (index: number, value: string) => {
    const newSpoilers = [...(season.spoilers || [])];
    newSpoilers[index] = value;
    handleChange('spoilers', newSpoilers);
  };

  const handleSpoilerRemove = (index: number) => {
    const newSpoilers = (season.spoilers || []).filter((_, i) => i !== index);
    handleChange('spoilers', newSpoilers);
  };

  return (
    <div className="mb-4 border border-dark-border rounded-lg p-4 bg-dark-surfaceSecondary">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h4 className="text-lg font-semibold text-dark-text">{season.title}</h4>
          <span className="text-sm text-dark-textSecondary">
            {season.episodes.length} episodi
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-sm bg-dark-surface border border-dark-border rounded-md text-dark-text hover:bg-dark-surfaceSecondary"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <button
            onClick={onRemove}
            className="px-3 py-1 text-sm bg-dark-error text-white rounded-md hover:bg-dark-error/90"
          >
            Rimuovi
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">ID Stagione</label>
              <input
                type="text"
                value={season.id}
                onChange={(e) => handleChange('id', e.target.value)}
                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-md text-dark-text text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">Numero Stagione</label>
              <input
                type="number"
                value={season.seasonNumber}
                onChange={(e) => handleChange('seasonNumber', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-md text-dark-text text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-text mb-2">Titolo</label>
              <input
                type="text"
                value={season.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-md text-dark-text text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-text mb-2">Recap</label>
              <textarea
                value={season.recap || ''}
                onChange={(e) => handleChange('recap', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-md text-dark-text text-sm"
                placeholder="Inserisci il recap completo della stagione..."
              />
            </div>
          </div>

          {/* Episodi */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h5 className="text-md font-semibold text-dark-text">Episodi</h5>
              <button
                onClick={handleAddEpisode}
                className="px-3 py-1 text-sm bg-dark-primary text-white rounded-md hover:bg-dark-primary/90"
              >
                + Aggiungi Episodio
              </button>
            </div>
            <div className="space-y-2">
              {season.episodes.map((episode, index) => (
                <EpisodeEditor
                  key={episode.id}
                  episode={episode}
                  onChange={(updatedEpisode) => handleEpisodeChange(index, updatedEpisode)}
                  onRemove={() => handleRemoveEpisode(index)}
                />
              ))}
            </div>
          </div>

          {/* Curiosità */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h5 className="text-md font-semibold text-dark-text">Curiosità</h5>
              <button
                onClick={handleCuriosityAdd}
                className="px-3 py-1 text-sm bg-dark-primary text-white rounded-md hover:bg-dark-primary/90"
              >
                + Aggiungi
              </button>
            </div>
            <div className="space-y-2">
              {(season.curiosities || []).map((curiosity, index) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    value={curiosity}
                    onChange={(e) => handleCuriosityChange(index, e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-md text-dark-text text-sm"
                    placeholder="Inserisci una curiosità..."
                  />
                  <button
                    onClick={() => handleCuriosityRemove(index)}
                    className="px-3 py-2 bg-dark-error text-white rounded-md hover:bg-dark-error/90"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Spoiler */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h5 className="text-md font-semibold text-dark-text">Spoiler</h5>
              <button
                onClick={handleSpoilerAdd}
                className="px-3 py-1 text-sm bg-dark-primary text-white rounded-md hover:bg-dark-primary/90"
              >
                + Aggiungi
              </button>
            </div>
            <div className="space-y-2">
              {(season.spoilers || []).map((spoiler, index) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    value={spoiler}
                    onChange={(e) => handleSpoilerChange(index, e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-md text-dark-text text-sm"
                    placeholder="Inserisci uno spoiler..."
                  />
                  <button
                    onClick={() => handleSpoilerRemove(index)}
                    className="px-3 py-2 bg-dark-error text-white rounded-md hover:bg-dark-error/90"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


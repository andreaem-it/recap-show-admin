/**
 * Funzioni di utilità per esportare e importare serie TV in formato JSON
 */

import { TVSeries, createSeries, updateSeries, getSeriesDetails } from './api';
import { SeriesListItem } from './api';

/**
 * Esporta una serie come file JSON
 */
export function exportSeriesToJSON(series: TVSeries): void {
  try {
    // Prepara i dati per l'export (rimuovi campi Firebase come createdAt, updatedAt)
    const { createdAt, updatedAt, ...exportData } = series as any;
    
    // Crea il JSON formattato
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Crea un blob e scarica il file
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${series.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('Errore nell\'esportazione:', error);
    throw new Error(`Errore nell'esportazione: ${error.message}`);
  }
}

/**
 * Normalizza i dati della serie generando automaticamente gli id mancanti per gli episodi
 * Compatibile con schema v1.5 (episodeCount opzionale, id episodi opzionali)
 */
function normalizeSeriesData(seriesData: any, seriesId: string): void {
  if (!seriesData.seasons || !Array.isArray(seriesData.seasons)) {
    return;
  }
  
  seriesData.seasons.forEach((season: any, seasonIndex: number) => {
    if (!season.episodes || !Array.isArray(season.episodes)) {
      return;
    }
    
    season.episodes.forEach((episode: any, episodeIndex: number) => {
      // Genera id se mancante (v1.5: id è opzionale)
      if (!episode.id) {
        episode.id = `${seriesId}-s${season.seasonNumber}-e${episode.episodeNumber}`;
      }
      
      // Assicura che seasonNumber sia presente
      if (!episode.seasonNumber && season.seasonNumber) {
        episode.seasonNumber = season.seasonNumber;
      }
    });
  });
}

/**
 * Valida la struttura JSON di una serie
 */
export function validateSeriesJSON(data: any): { valid: boolean; error?: string } {
  try {
    // Verifica campi obbligatori
    if (!data.title || typeof data.title !== 'string') {
      return { valid: false, error: 'Il campo "title" è obbligatorio e deve essere una stringa' };
    }
    
    if (!data.category || typeof data.category !== 'string') {
      return { valid: false, error: 'Il campo "category" è obbligatorio e deve essere una stringa' };
    }
    
    if (!data.description || typeof data.description !== 'string') {
      return { valid: false, error: 'Il campo "description" è obbligatorio e deve essere una stringa' };
    }
    
    if (!Array.isArray(data.seasons)) {
      return { valid: false, error: 'Il campo "seasons" deve essere un array' };
    }
    
    // Valida struttura stagioni
    for (let i = 0; i < data.seasons.length; i++) {
      const season = data.seasons[i];
      if (!season.id || !season.seasonNumber || !season.title) {
        return { valid: false, error: `Stagione ${i + 1}: campi id, seasonNumber e title sono obbligatori` };
      }
      
      // episodeCount è opzionale (v1.5+)
      // Non validiamo perché è opzionale per backward compatibility
      
      if (!Array.isArray(season.episodes)) {
        return { valid: false, error: `Stagione ${i + 1}: il campo "episodes" deve essere un array` };
      }
      
      // Valida struttura episodi
      // V1.5: id è opzionale (verrà generato automaticamente se mancante)
      for (let j = 0; j < season.episodes.length; j++) {
        const episode = season.episodes[j];
        if (!episode.episodeNumber || typeof episode.episodeNumber !== 'number') {
          return { valid: false, error: `Stagione ${i + 1}, Episodio ${j + 1}: campo episodeNumber è obbligatorio e deve essere un numero` };
        }
        if (!episode.title || typeof episode.title !== 'string') {
          return { valid: false, error: `Stagione ${i + 1}, Episodio ${j + 1}: campo title è obbligatorio e deve essere una stringa` };
        }
        // id è opzionale - verrà generato automaticamente durante l'import se mancante
      }
    }
    
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: `Errore nella validazione: ${error.message}` };
  }
}

/**
 * Confronta due serie e restituisce i cambiamenti
 */
export interface Change {
  field: string;
  oldValue: any;
  newValue: any;
  type: 'modified' | 'added' | 'removed';
}

export function compareSeries(oldSeries: TVSeries, newSeries: Partial<TVSeries>): Change[] {
  const changes: Change[] = [];
  
  // Confronta i campi principali
  const fieldsToCompare: (keyof TVSeries)[] = [
    'title', 'description', 'category', 'imageUrl', 'startYear', 'endYear',
    'status', 'totalSeasons', 'totalEpisodes', 'originalNetwork', 'countries',
    'tags', 'availability'
  ];
  
  fieldsToCompare.forEach(field => {
    const oldValue = oldSeries[field];
    const newValue = newSeries[field];
    
    if (newValue !== undefined && JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: field as string,
        oldValue,
        newValue,
        type: 'modified',
      });
    }
  });
  
  // Confronta stagioni
  const oldSeasonsCount = oldSeries.seasons?.length || 0;
  const newSeasonsCount = newSeries.seasons?.length || 0;
  
  if (oldSeasonsCount !== newSeasonsCount) {
    changes.push({
      field: 'seasons',
      oldValue: `${oldSeasonsCount} stagioni`,
      newValue: `${newSeasonsCount} stagioni`,
      type: oldSeasonsCount < newSeasonsCount ? 'added' : 'removed',
    });
  }
  
  // Confronta dettagli stagioni
  if (newSeries.seasons) {
    newSeries.seasons.forEach((newSeason, index) => {
      const oldSeason = oldSeries.seasons?.[index];
      
      if (!oldSeason) {
        changes.push({
          field: `Stagione ${newSeason.seasonNumber}`,
          oldValue: null,
          newValue: `Aggiunta: ${newSeason.title}`,
          type: 'added',
        });
      } else {
        // Confronta episodi
        const oldEpisodesCount = oldSeason.episodes?.length || 0;
        const newEpisodesCount = newSeason.episodes?.length || 0;
        
        if (oldEpisodesCount !== newEpisodesCount) {
          changes.push({
            field: `Stagione ${newSeason.seasonNumber} - Episodi`,
            oldValue: `${oldEpisodesCount} episodi`,
            newValue: `${newEpisodesCount} episodi`,
            type: oldEpisodesCount < newEpisodesCount ? 'added' : 'removed',
          });
        }
        
        // Confronta recap, curiosità, spoiler
        if (newSeason.recap !== undefined && newSeason.recap !== oldSeason.recap) {
          changes.push({
            field: `Stagione ${newSeason.seasonNumber} - Recap`,
            oldValue: oldSeason.recap ? `${oldSeason.recap.substring(0, 50)}...` : 'Nessuno',
            newValue: newSeason.recap ? `${newSeason.recap.substring(0, 50)}...` : 'Nessuno',
            type: 'modified',
          });
        }
        
        if (newSeason.curiosities && JSON.stringify(newSeason.curiosities) !== JSON.stringify(oldSeason.curiosities)) {
          changes.push({
            field: `Stagione ${newSeason.seasonNumber} - Curiosità`,
            oldValue: `${oldSeason.curiosities?.length || 0} curiosità`,
            newValue: `${newSeason.curiosities.length} curiosità`,
            type: 'modified',
          });
        }
        
        if (newSeason.spoilers && JSON.stringify(newSeason.spoilers) !== JSON.stringify(oldSeason.spoilers)) {
          changes.push({
            field: `Stagione ${newSeason.seasonNumber} - Spoiler`,
            oldValue: `${oldSeason.spoilers?.length || 0} spoiler`,
            newValue: `${newSeason.spoilers.length} spoiler`,
            type: 'modified',
          });
        }
      }
    });
  }
  
  return changes;
}

/**
 * Importa una serie da JSON (per creazione o aggiornamento)
 */
export interface ImportSeriesOptions {
  updateIfExists?: boolean;
  seriesId?: string;
}

export async function importSeriesFromJSON(
  jsonData: any,
  options?: ImportSeriesOptions | string
): Promise<{ success: boolean; seriesId?: string; error?: string }> {
  try {
    // Gestisci la compatibilità con la vecchia firma (stringa)
    let updateIfExists = false;
    let seriesId: string | undefined;
    
    if (typeof options === 'string') {
      // Vecchia firma: importSeriesFromJSON(jsonData, seriesId)
      seriesId = options;
      updateIfExists = true;
    } else if (options) {
      // Nuova firma: importSeriesFromJSON(jsonData, { updateIfExists, seriesId })
      updateIfExists = options.updateIfExists ?? false;
      seriesId = options.seriesId;
    }
    
    console.log('[IMPORT] === INIZIO IMPORT SERIES ===');
    console.log('[IMPORT] Options:', { updateIfExists, seriesId, jsonDataId: jsonData.id });
    console.log('[IMPORT] JSON Data ricevuto:', {
      title: jsonData.title,
      category: jsonData.category,
      seasonsCount: jsonData.seasons?.length,
      totalEpisodes: jsonData.totalEpisodes,
    });
    
    // Valida il JSON
    console.log('[IMPORT] Validazione JSON...');
    const validation = validateSeriesJSON(jsonData);
    if (!validation.valid) {
      console.error('[IMPORT] Validazione fallita:', validation.error);
      return { success: false, error: validation.error };
    }
    console.log('[IMPORT] Validazione OK');
    
    // Prepara i dati (rimuovi eventuali campi Firebase)
    console.log('[IMPORT] Preparazione dati...');
    const { id: jsonId, createdAt, updatedAt, ...seriesData } = jsonData;
    console.log('[IMPORT] Campi rimossi:', { id: jsonId, createdAt, updatedAt });
    
    // Determina l'ID della serie da usare
    const targetSeriesId = seriesId || jsonId;
    
    // Normalizza i dati (genera id mancanti per episodi)
    normalizeSeriesData(seriesData, targetSeriesId || jsonId || 'temp');
    
    // Se updateIfExists è true e abbiamo un ID, prova ad aggiornare
    if (updateIfExists && targetSeriesId) {
      try {
        // Verifica se la serie esiste
        const existingSeries = await getSeriesDetails(targetSeriesId);
        console.log('[IMPORT] Serie esistente trovata, procedo con l\'aggiornamento');
        console.log('[IMPORT] Dati preparati per update:', {
          title: seriesData.title,
          category: seriesData.category,
          seasonsCount: seriesData.seasons?.length,
          hasSeasons: !!seriesData.seasons,
          keys: Object.keys(seriesData),
        });
        
        // Aggiorna la serie esistente
        console.log('[IMPORT] Chiamata updateSeries...');
        const updatedSeries = await updateSeries(targetSeriesId, seriesData as TVSeries);
        
        console.log('[IMPORT] Update completato con successo');
        console.log('[IMPORT] Serie aggiornata:', {
          id: updatedSeries.id,
          title: updatedSeries.title,
          seasonsCount: updatedSeries.seasons?.length,
        });
        console.log('[IMPORT] === FINE IMPORT SERIES (SUCCESSO) ===');
        
        return { success: true, seriesId: targetSeriesId };
      } catch (error: any) {
        // Se la serie non esiste e updateIfExists è true, crea una nuova serie
        if (error.message?.includes('not found') || error.message?.includes('non trovata')) {
          console.log('[IMPORT] Serie non trovata, procedo con la creazione');
          return await createSeriesFromJSON(jsonData);
        }
        throw error;
      }
    }
    
    // Crea una nuova serie
    console.log('[IMPORT] Creazione nuova serie...');
    return await createSeriesFromJSON(jsonData);
  } catch (error: any) {
    console.error('[IMPORT] === ERRORE NELL\'IMPORTAZIONE ===');
    console.error('[IMPORT] Tipo errore:', error?.constructor?.name);
    console.error('[IMPORT] Messaggio errore:', error?.message);
    console.error('[IMPORT] Stack trace:', error?.stack);
    console.error('[IMPORT] Errore completo:', error);
    console.error('[IMPORT] === FINE IMPORT SERIES (ERRORE) ===');
    return { success: false, error: error.message || 'Errore nell\'importazione' };
  }
}

/**
 * Legge un file JSON e restituisce i dati parsati
 */
export function readJSONFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const jsonData = JSON.parse(content);
        resolve(jsonData);
      } catch (error: any) {
        reject(new Error(`Errore nel parsing del JSON: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Errore nella lettura del file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Parsea una stringa JSON
 */
export function parseJSONString(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (error: any) {
    throw new Error(`Errore nel parsing del JSON: ${error.message}`);
  }
}

/**
 * Crea una nuova serie da JSON
 */
export async function createSeriesFromJSON(
  jsonData: any
): Promise<{ success: boolean; seriesId?: string; error?: string }> {
  try {
    console.log('[CREATE] === INIZIO CREATE SERIES FROM JSON ===');
    console.log('[CREATE] JSON Data ricevuto:', {
      title: jsonData.title,
      category: jsonData.category,
      seasonsCount: jsonData.seasons?.length,
      totalEpisodes: jsonData.totalEpisodes,
    });
    
    // Valida il JSON
    console.log('[CREATE] Validazione JSON...');
    const validation = validateSeriesJSON(jsonData);
    if (!validation.valid) {
      console.error('[CREATE] Validazione fallita:', validation.error);
      return { success: false, error: validation.error };
    }
    console.log('[CREATE] Validazione OK');
    
    // Prepara i dati (rimuovi eventuali campi Firebase)
    console.log('[CREATE] Preparazione dati...');
    const { id, createdAt, updatedAt, ...seriesData } = jsonData;
    console.log('[CREATE] Campi rimossi:', { id, createdAt, updatedAt });
    console.log('[CREATE] Dati preparati per create:', {
      title: seriesData.title,
      category: seriesData.category,
      seasonsCount: seriesData.seasons?.length,
      hasSeasons: !!seriesData.seasons,
      keys: Object.keys(seriesData),
    });
    
    // Crea la nuova serie
    console.log('[CREATE] Chiamata createSeries...');
    const newSeries = await createSeries(seriesData as Omit<TVSeries, 'id'>);
    
    console.log('[CREATE] Creazione completata con successo');
    console.log('[CREATE] Nuova serie creata:', {
      id: newSeries.id,
      title: newSeries.title,
      seasonsCount: newSeries.seasons?.length,
    });
    console.log('[CREATE] === FINE CREATE SERIES FROM JSON (SUCCESSO) ===');
    
    return { success: true, seriesId: newSeries.id };
  } catch (error: any) {
    console.error('[CREATE] === ERRORE NELLA CREAZIONE ===');
    console.error('[CREATE] Tipo errore:', error?.constructor?.name);
    console.error('[CREATE] Messaggio errore:', error?.message);
    console.error('[CREATE] Stack trace:', error?.stack);
    console.error('[CREATE] Errore completo:', error);
    console.error('[CREATE] === FINE CREATE SERIES FROM JSON (ERRORE) ===');
    return { success: false, error: error.message || 'Errore nella creazione' };
  }
}

/**
 * Estrae i dati principali di una serie per l'anteprima (simile a SeriesListItem)
 */
export function extractSeriesPreview(jsonData: any): SeriesListItem | null {
  try {
    if (!jsonData.title || !jsonData.category || !jsonData.description) {
      return null;
    }
    
    return {
      id: jsonData.id || 'new',
      title: jsonData.title,
      imageUrl: jsonData.imageUrl,
      description: jsonData.description,
      startYear: jsonData.startYear || new Date().getFullYear(),
      endYear: jsonData.endYear || null,
      status: jsonData.status || 'ongoing',
      totalSeasons: jsonData.totalSeasons || jsonData.seasons?.length || 0,
      totalEpisodes: jsonData.totalEpisodes || 0,
      category: jsonData.category,
      seasons: jsonData.seasons?.map((season: any) => ({
        id: season.id || '',
        seasonNumber: season.seasonNumber || 0,
        title: season.title || '',
      })) || [],
    };
  } catch (error) {
    return null;
  }
}

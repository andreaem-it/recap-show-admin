/**
 * Client API per comunicare con Firestore
 * Usa Firebase Firestore per gestire i dati delle serie TV
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface SeriesListItem {
  id: string;
  title: string;
  imageUrl?: string;
  description: string;
  startYear: number;
  endYear: number | null;
  status: 'ended' | 'ongoing';
  totalSeasons: number;
  totalEpisodes: number;
  category: string;
  seasons: Array<{
    id: string;
    seasonNumber: number;
    title: string;
  }>;
}

export interface Episode {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  importantMinutes?: {
    start: number;
    end: number;
    description?: string;
  }[];
}

export interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  episodes: Episode[];
  recap?: string;
  curiosities?: string[];
  spoilers?: string[];
  episodeCount?: number; // V1.5: Numero TOTALE reale di episodi della stagione (opzionale)
}

export type SeriesCategory = 'Drama' | 'Fantasy' | 'Crime' | 'Comedy' | 'Thriller' | 'Sci-Fi' | 'Action';

export interface TVSeries {
  id: string;
  title: string;
  startYear: number;
  endYear: number | null;
  status: 'ended' | 'ongoing';
  totalSeasons: number;
  totalEpisodes: number;
  originalNetwork: string;
  countries: string[];
  tags: string[];
  availability: {
    platform: string;
    country: string;
    type: 'subscription' | 'rent' | 'buy';
    deeplink: string;
  }[];
  description: string;
  imageUrl?: string;
  category: SeriesCategory;
  seasons: Season[];
}

/**
 * Recupera la lista di tutte le serie da Firestore
 */
export async function getSeriesList(): Promise<SeriesListItem[]> {
  if (!db) {
    throw new Error('Firestore non configurato');
  }

  try {
    const seriesRef = collection(db, 'series');
    const q = query(seriesRef, orderBy('title'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        imageUrl: data.imageUrl,
        description: data.description,
        startYear: data.startYear,
        endYear: data.endYear,
        status: data.status,
        totalSeasons: data.totalSeasons || data.seasons?.length || 0,
        totalEpisodes: data.totalEpisodes || 0,
        category: data.category,
        seasons: data.seasons?.map((season: any) => ({
          id: season.id,
          seasonNumber: season.seasonNumber,
          title: season.title,
        })) || [],
      } as SeriesListItem;
    });
  } catch (error: any) {
    console.error('Errore nel recupero della lista:', error);
    throw new Error(`Errore nel recupero della lista: ${error.message}`);
  }
}

/**
 * Recupera i dettagli completi di una serie da Firestore
 */
export async function getSeriesDetails(id: string): Promise<TVSeries> {
  console.log('[API] === GET SERIES DETAILS ===');
  console.log('[API] Series ID:', id);
  console.log('[API] Firestore DB disponibile:', !!db);
  
  if (!db) {
    console.error('[API] ERRORE: Firestore non configurato');
    throw new Error('Firestore non configurato');
  }

  try {
    console.log('[API] Creazione riferimento documento...');
    const seriesRef = doc(db, 'series', id);
    console.log('[API] Chiamata getDoc...');
    const seriesSnap = await getDoc(seriesRef);
    
    if (!seriesSnap.exists()) {
      console.error('[API] ERRORE: Documento non trovato');
      throw new Error('Serie non trovata');
    }
    
    console.log('[API] Documento trovato, estrazione dati...');
    const data = seriesSnap.data();
    console.log('[API] Dati recuperati:', {
      id: seriesSnap.id,
      title: data.title,
      category: data.category,
      seasonsCount: data.seasons?.length,
      hasSeasons: !!data.seasons,
    });
    
    const result = {
      id: seriesSnap.id,
      ...data,
    } as TVSeries;
    
    console.log('[API] === FINE GET SERIES DETAILS (SUCCESSO) ===');
    return result;
  } catch (error: any) {
    console.error('[API] === ERRORE NEL RECUPERO DETTAGLI ===');
    console.error('[API] Tipo errore:', error?.constructor?.name);
    console.error('[API] Messaggio errore:', error?.message);
    console.error('[API] Stack trace:', error?.stack);
    throw new Error(`Errore nel recupero dei dettagli: ${error.message}`);
  }
}

/**
 * Crea una nuova serie in Firestore
 */
export async function createSeries(series: Omit<TVSeries, 'id'>): Promise<TVSeries> {
  console.log('[API] === INIZIO CREATE SERIES ===');
  console.log('[API] Firestore DB disponibile:', !!db);
  console.log('[API] Dati serie ricevuti:', {
    title: series.title,
    category: series.category,
    seasonsCount: series.seasons?.length,
    hasSeasons: !!series.seasons,
  });
  
  if (!db) {
    console.error('[API] ERRORE: Firestore non configurato');
    throw new Error('Firestore non configurato');
  }

  try {
    console.log('[API] Creazione riferimento collection...');
    const seriesRef = collection(db, 'series');
    
    // Prepara i dati per Firestore (rimuovi eventuali campi undefined)
    console.log('[API] Preparazione dati per Firestore...');
    const seriesData: any = {};
    Object.keys(series).forEach(key => {
      const value = series[key as keyof typeof series];
      if (value !== undefined) {
        // Se è un array di oggetti complessi (come seasons), assicurati che sia serializzabile
        if (Array.isArray(value)) {
          console.log(`[API] Elaborazione array per campo "${key}":`, {
            length: value.length,
            firstItem: value[0] ? Object.keys(value[0]) : null,
          });
          seriesData[key] = value.map((item: any) => {
            // Rimuovi undefined dai singoli elementi
            const cleanItem: any = {};
            Object.keys(item).forEach(itemKey => {
              if (item[itemKey] !== undefined) {
                cleanItem[itemKey] = item[itemKey];
              }
            });
            return cleanItem;
          });
        } else {
          seriesData[key] = value;
        }
      }
    });
    
    const firestoreData = {
      ...seriesData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    console.log('[API] Dati finali per Firestore:', {
      keys: Object.keys(firestoreData),
      title: firestoreData.title,
      category: firestoreData.category,
      seasonsCount: firestoreData.seasons?.length,
      hasCreatedAt: !!firestoreData.createdAt,
      hasUpdatedAt: !!firestoreData.updatedAt,
    });
    
    console.log('[API] Chiamata addDoc su Firestore...');
    const docRef = await addDoc(seriesRef, firestoreData);
    console.log('[API] addDoc completato con successo');
    console.log('[API] Nuovo documento ID:', docRef.id);
    
    // Verifica immediata che i dati siano stati scritti
    console.log('[API] Verifica scrittura dati...');
    const verifySnap = await getDoc(docRef);
    if (verifySnap.exists()) {
      const verifyData = verifySnap.data();
      console.log('[API] Dati verificati su Firestore:', {
        id: verifySnap.id,
        title: verifyData.title,
        category: verifyData.category,
        seasonsCount: verifyData.seasons?.length,
        createdAt: verifyData.createdAt?.toDate?.() || verifyData.createdAt,
        updatedAt: verifyData.updatedAt?.toDate?.() || verifyData.updatedAt,
      });
    } else {
      console.warn('[API] ATTENZIONE: Documento non trovato dopo creazione!');
    }
    
    // Recupera la serie appena creata per avere tutti i dati corretti
    console.log('[API] Recupero serie creata...');
    const newSeries = await getSeriesDetails(docRef.id);
    console.log('[API] Serie recuperata:', {
      id: newSeries.id,
      title: newSeries.title,
      seasonsCount: newSeries.seasons?.length,
    });
    console.log('[API] === FINE CREATE SERIES (SUCCESSO) ===');
    
    return newSeries;
  } catch (error: any) {
    console.error('[API] === ERRORE NELLA CREAZIONE ===');
    console.error('[API] Tipo errore:', error?.constructor?.name);
    console.error('[API] Codice errore:', error?.code);
    console.error('[API] Messaggio errore:', error?.message);
    console.error('[API] Stack trace:', error?.stack);
    console.error('[API] Errore completo:', error);
    console.error('[API] === FINE CREATE SERIES (ERRORE) ===');
    throw new Error(`Errore nella creazione: ${error.message}`);
  }
}

/**
 * Aggiorna una serie esistente in Firestore
 */
export async function updateSeries(id: string, series: Partial<TVSeries>): Promise<TVSeries> {
  console.log('[API] === INIZIO UPDATE SERIES ===');
  console.log('[API] Series ID:', id);
  console.log('[API] Firestore DB disponibile:', !!db);
  
  if (!db) {
    console.error('[API] ERRORE: Firestore non configurato');
    throw new Error('Firestore non configurato');
  }

  try {
    console.log('[API] Creazione riferimento documento...');
    const seriesRef = doc(db, 'series', id);
    console.log('[API] Riferimento documento creato:', seriesRef.path);
    
    // Rimuovi l'id dal payload se presente (non va aggiornato)
    console.log('[API] Preparazione dati per update...');
    const { id: _, ...updateData } = series as any;
    console.log('[API] Dati dopo rimozione id:', {
      keys: Object.keys(updateData),
      title: updateData.title,
      category: updateData.category,
      seasonsCount: updateData.seasons?.length,
      hasSeasons: !!updateData.seasons,
      seasonsType: Array.isArray(updateData.seasons) ? 'array' : typeof updateData.seasons,
    });
    
    // Prepara i dati per Firestore (rimuovi undefined e gestisci array annidati)
    const firestoreData: any = {
      updatedAt: Timestamp.now(),
    };
    
    Object.keys(updateData).forEach(key => {
      const value = updateData[key];
      if (value !== undefined) {
        // Se è un array di oggetti complessi (come seasons), assicurati che sia serializzabile
        if (Array.isArray(value)) {
          console.log(`[API] Elaborazione array per campo "${key}":`, {
            length: value.length,
            firstItem: value[0] ? Object.keys(value[0]) : null,
          });
          firestoreData[key] = value.map((item: any) => {
            // Rimuovi undefined dai singoli elementi
            const cleanItem: any = {};
            Object.keys(item).forEach(itemKey => {
              if (item[itemKey] !== undefined) {
                cleanItem[itemKey] = item[itemKey];
              }
            });
            return cleanItem;
          });
        } else {
          firestoreData[key] = value;
        }
      }
    });
    
    console.log('[API] Dati finali per Firestore:', {
      keys: Object.keys(firestoreData),
      title: firestoreData.title,
      category: firestoreData.category,
      seasonsCount: firestoreData.seasons?.length,
      hasUpdatedAt: !!firestoreData.updatedAt,
    });
    
    console.log('[API] Chiamata updateDoc su Firestore...');
    console.log('[API] Payload completo per Firestore:', JSON.stringify(firestoreData, null, 2).substring(0, 1000));
    await updateDoc(seriesRef, firestoreData);
    console.log('[API] updateDoc completato con successo');
    
    // Verifica immediata che i dati siano stati scritti
    console.log('[API] Verifica scrittura dati...');
    const verifySnap = await getDoc(seriesRef);
    if (verifySnap.exists()) {
      const verifyData = verifySnap.data();
      console.log('[API] Dati verificati su Firestore:', {
        id: verifySnap.id,
        title: verifyData.title,
        category: verifyData.category,
        seasonsCount: verifyData.seasons?.length,
        updatedAt: verifyData.updatedAt?.toDate?.() || verifyData.updatedAt,
      });
    } else {
      console.warn('[API] ATTENZIONE: Documento non trovato dopo update!');
    }
    
    // Recupera la serie aggiornata
    console.log('[API] Recupero serie aggiornata...');
    const updatedSeries = await getSeriesDetails(id);
    console.log('[API] Serie recuperata:', {
      id: updatedSeries.id,
      title: updatedSeries.title,
      seasonsCount: updatedSeries.seasons?.length,
    });
    console.log('[API] === FINE UPDATE SERIES (SUCCESSO) ===');
    
    return updatedSeries;
  } catch (error: any) {
    console.error('[API] === ERRORE NELL\'AGGIORNAMENTO ===');
    console.error('[API] Tipo errore:', error?.constructor?.name);
    console.error('[API] Codice errore:', error?.code);
    console.error('[API] Messaggio errore:', error?.message);
    console.error('[API] Stack trace:', error?.stack);
    console.error('[API] Errore completo:', error);
    console.error('[API] === FINE UPDATE SERIES (ERRORE) ===');
    throw new Error(`Errore nell'aggiornamento: ${error.message}`);
  }
}

/**
 * Elimina una serie da Firestore
 */
export async function deleteSeries(id: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore non configurato');
  }

  try {
    const seriesRef = doc(db, 'series', id);
    await deleteDoc(seriesRef);
  } catch (error: any) {
    console.error('Errore nell\'eliminazione della serie:', error);
    throw new Error(`Errore nell'eliminazione: ${error.message}`);
  }
}


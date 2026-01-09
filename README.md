# RecapShow Admin Dashboard

Dashboard amministrativa per gestire le serie TV di RecapShow.

## Caratteristiche

- 🔐 **Autenticazione**: Sistema di login con username/password (predisposto per Firebase Auth)
- 📺 **Gestione Serie**: Visualizzazione, modifica e creazione di serie TV
- 📚 **Gestione Stagioni**: Aggiunta, modifica ed eliminazione di stagioni
- 🎬 **Gestione Episodi**: Gestione completa degli episodi con minuti importanti
- 💾 **Storage**: Predisposto per Firebase Firestore (attualmente usa API locale)

## Tecnologie

- **Next.js 14** - Framework React per il web
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Firebase** - Predisposto per Auth e Firestore (commentato)
- **React Hook Form** - Gestione form

## Installazione

```bash
cd ADMIN
npm install
```

## Configurazione

Crea un file `.env` nella cartella `ADMIN`:

```env
# API Configuration
API_BASE_URL=http://localhost:3001

# Admin Credentials (per ora semplice autenticazione locale)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Firebase Configuration (commentato - da configurare quando si passa a Firebase)
# NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
# NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
# NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Avvio

### 1. Assicurati che l'API sia in esecuzione

```bash
cd ../API
npm start
```

### 2. Avvia la dashboard admin

```bash
cd ADMIN
npm run dev
```

La dashboard sarà disponibile su `http://localhost:3000`

## Credenziali Default

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **IMPORTANTE**: Cambia le credenziali in produzione!

## Struttura Progetto

```
ADMIN/
├── src/
│   ├── app/                    # Pagine Next.js
│   │   ├── page.tsx            # Login
│   │   └── dashboard/          # Dashboard principale
│   │       ├── page.tsx        # Lista serie
│   │       └── series/
│   │           └── [id]/       # Dettaglio serie
│   ├── components/             # Componenti React
│   │   ├── LoginForm.tsx
│   │   ├── SeriesList.tsx
│   │   ├── SeriesDetailForm.tsx
│   │   ├── SeasonEditor.tsx
│   │   └── EpisodeEditor.tsx
│   ├── lib/                    # Librerie e utilities
│   │   ├── api.ts              # Client API (usa API locale)
│   │   ├── auth.ts             # Autenticazione (predisposto per Firebase)
│   │   └── firebase.ts         # Configurazione Firebase (commentato)
│   └── styles/
│       └── globals.css          # Stili globali
```

## Migrazione a Firebase

Quando si vuole passare a Firebase:

1. **Configura Firebase**:
   - Crea un progetto Firebase nella console
   - Abilita Authentication (Email/Password)
   - Abilita Firestore Database
   - Abilita Storage (se necessario)

2. **Aggiorna `.env`**:
   - Aggiungi le credenziali Firebase

3. **Decommenta il codice Firebase**:
   - `src/lib/firebase.ts` - Decommenta la configurazione
   - `src/lib/auth.ts` - Decommenta il codice Firebase Auth
   - `src/lib/api.ts` - Modifica per usare Firestore invece di HTTP

4. **Aggiorna le funzioni API**:
   - Implementa `createSeries()`, `updateSeries()`, `deleteSeries()` usando Firestore
   - Modifica `getSeriesList()` e `getSeriesDetails()` per usare Firestore

## Note

- **Per ora**: La dashboard usa l'API locale esistente (`http://localhost:3001`)
- **Funzionalità non ancora implementate nell'API locale**:
  - Creazione nuova serie (POST)
  - Aggiornamento serie (PUT)
  - Eliminazione serie (DELETE)
  
  Queste funzionalità sono predisposte nel codice ma devono essere implementate nell'API o migrate a Firebase.

## Sviluppo

```bash
# Sviluppo
npm run dev

# Build produzione
npm run build

# Avvio produzione
npm start
```


'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface ReportChange {
  id: string;
  seriesId: string;
  seriesTitle: string;
  seriesSlug?: string;
  changeType: 'description' | 'metadata' | 'episodes' | 'other';
  description: string;
  userEmail?: string | null;
  status: 'pending' | 'reviewed' | 'rejected';
  createdAt: Timestamp | null;
  reviewedAt: Timestamp | null;
  reviewedBy: string | null;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'rejected'>('all');

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      if (!db) {
        throw new Error('Firestore non configurato.');
      }
      const reportsRef = collection(db, 'reportChanges');
      const q = query(reportsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const reportsData: ReportChange[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        reportsData.push({
          id: doc.id,
          ...data,
        } as ReportChange);
      });

      let filteredReports = reportsData;
      if (filter !== 'all') {
        filteredReports = reportsData.filter(r => r.status === filter);
      }

      setReports(filteredReports);
    } catch (error) {
      console.error('Errore nel caricamento delle segnalazioni:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: 'reviewed' | 'rejected') => {
    try {
      if (!db) {
        throw new Error('Firestore non configurato.');
      }
      const reportRef = doc(db, 'reportChanges', reportId);
      await updateDoc(reportRef, {
        status,
        reviewedAt: new Date(),
        reviewedBy: 'admin', // TODO: Usa l'utente corrente
      });
      await loadReports();
    } catch (error) {
      console.error('Errore nell\'aggiornamento della segnalazione:', error);
      alert('Errore nell\'aggiornamento della segnalazione');
    }
  };

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'reviewed':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'In attesa';
      case 'reviewed':
        return 'Revisionata';
      case 'rejected':
        return 'Rifiutata';
      default:
        return status;
    }
  };

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case 'description':
        return 'Descrizione';
      case 'metadata':
        return 'Metadati';
      case 'episodes':
        return 'Episodi/Stagioni';
      case 'other':
        return 'Altro';
      default:
        return type;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0 }}>Segnalazioni Modifiche</h1>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1f1f1f',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          ← Torna al Dashboard
        </button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        {(['all', 'pending', 'reviewed', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === f ? '#e50914' : '#1f1f1f',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            {f === 'all' ? 'Tutte' : f === 'pending' ? 'In attesa' : f === 'reviewed' ? 'Revisionate' : 'Rifiutate'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#a0a0a0' }}>
          Caricamento...
        </div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#a0a0a0' }}>
          Nessuna segnalazione trovata
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reports.map((report) => (
            <div
              key={report.id}
              style={{
                backgroundColor: '#1f1f1f',
                border: '1px solid #2a2a2a',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0', color: '#ffffff' }}>
                    {report.seriesTitle}
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#a0a0a0' }}>
                      Tipo: <strong style={{ color: '#ffffff' }}>{getChangeTypeLabel(report.changeType)}</strong>
                    </span>
                    <span style={{ fontSize: '14px', color: '#a0a0a0' }}>
                      Serie ID: <strong style={{ color: '#ffffff' }}>{report.seriesId}</strong>
                    </span>
                    {report.userEmail && (
                      <span style={{ fontSize: '14px', color: '#a0a0a0' }}>
                        Email: <strong style={{ color: '#ffffff' }}>{report.userEmail}</strong>
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: getStatusColor(report.status) + '20',
                        color: getStatusColor(report.status),
                        border: `1px solid ${getStatusColor(report.status)}40`,
                      }}
                    >
                      {getStatusLabel(report.status)}
                    </span>
                    <span style={{ fontSize: '12px', color: '#707070' }}>
                      Creata: {formatDate(report.createdAt)}
                    </span>
                    {report.reviewedAt && (
                      <span style={{ fontSize: '12px', color: '#707070' }}>
                        Revisionata: {formatDate(report.reviewedAt)}
                      </span>
                    )}
                  </div>
                </div>
                {report.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => updateReportStatus(report.id, 'reviewed')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#10b981',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ffffff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      Approva
                    </button>
                    <button
                      onClick={() => updateReportStatus(report.id, 'rejected')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ef4444',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ffffff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      Rifiuta
                    </button>
                  </div>
                )}
              </div>
              <div
                style={{
                  backgroundColor: '#141414',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  padding: '16px',
                  marginTop: '16px',
                }}
              >
                <p style={{ fontSize: '14px', color: '#ffffff', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {report.description}
                </p>
              </div>
              {report.seriesSlug && (
                <div style={{ marginTop: '16px' }}>
                  <a
                    href={`https://www.recapshow.it/series/${report.seriesSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#e50914',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    Vedi serie →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

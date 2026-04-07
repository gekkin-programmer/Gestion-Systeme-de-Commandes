'use client';

import { useEffect, useState, useCallback } from 'react';
import { BackButton } from '@/components/shared/BackButton';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useHotelSocket } from '@/hooks/useSocket';
import dk from '@/styles/dark.module.css';
import type { RoomDTO } from '@/types';

const ROOM_TYPES = ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE', 'PENTHOUSE'];

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE:   '#4ade80',
  OCCUPIED:    '#f59e0b',
  MAINTENANCE: '#f87171',
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE:   'Libre',
  OCCUPIED:    'Occupée',
  MAINTENANCE: 'Maintenance',
};

type Tab = 'rooms' | 'occupancy';

export default function AdminRoomsPage() {
  const { user, accessToken } = useAuth();
  const hotelId = (user as any)?.hotelId ?? '';

  const [tab,       setTab]       = useState<Tab>('rooms');
  const [rooms,     setRooms]     = useState<RoomDTO[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [creating,  setCreating]  = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData,  setFormData]  = useState({ roomNumber: '', floor: '1', type: 'DOUBLE' });

  const [qrLoading, setQrLoading] = useState<string | null>(null);

  const loadRooms = useCallback(() => {
    if (!hotelId) return;
    setLoading(true);
    api.get(`/hotels/${hotelId}/rooms`)
      .then(({ data }) => setRooms(data.data))
      .finally(() => setLoading(false));
  }, [hotelId]);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  useHotelSocket(accessToken, null, {
    onRoomStatusChanged: (updated: unknown) => {
      const r = updated as RoomDTO;
      setRooms((prev) => prev.map((x) => x.id === r.id ? { ...x, status: r.status } : x));
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const { data } = await api.post(`/hotels/${hotelId}/rooms`, {
        roomNumber: parseInt(formData.roomNumber),
        floor:      parseInt(formData.floor),
        type:       formData.type,
      });
      setRooms((prev) => [...prev, data.data]);
      setShowForm(false);
      setFormData({ roomNumber: '', floor: '1', type: 'DOUBLE' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Erreur lors de la création.';
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateQR = async (roomId: string) => {
    setQrLoading(roomId);
    try {
      const { data } = await api.post(`/hotels/${hotelId}/rooms/${roomId}/qr`);
      setRooms((prev) => prev.map((r) => r.id === roomId ? { ...r, qrCodeUrl: data.data.qrCodeUrl } : r));
    } catch { /* silent */ } finally {
      setQrLoading(null);
    }
  };

  const occupied = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const available = rooms.filter((r) => r.status === 'AVAILABLE').length;

  return (
    <div className={dk.page}>

      <header className={dk.header}>
        <BackButton />
        <span className={dk.headerTitle}>Chambres</span>
        <div className={dk.headerRight} style={{ gap: 8 }}>
          {tab === 'rooms' && (
            <button className={dk.btn} style={{ fontSize: 9, padding: '8px 14px' }} onClick={() => setShowForm((v) => !v)}>
              + Chambre
            </button>
          )}
          {tab === 'occupancy' && (
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: 'var(--gold)', border: '1px solid var(--line)', padding: '3px 10px' }}>
              {occupied} / {rooms.length}
            </span>
          )}
        </div>
      </header>

      <main className={dk.main}>

        <div className={dk.tabBar}>
          <button className={`${dk.tab} ${tab === 'rooms' ? dk.tabActive : ''}`} onClick={() => setTab('rooms')}>
            QR Codes
          </button>
          <button className={`${dk.tab} ${tab === 'occupancy' ? dk.tabActive : ''}`} onClick={() => setTab('occupancy')}>
            Occupation
          </button>
        </div>

        {/* ── QR tab ── */}
        {tab === 'rooms' && (
          <>
            {showForm && (
              <div className={dk.card}>
                <span className={dk.sectionLabel}>Nouvelle chambre</span>
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div className={dk.inputGroup}>
                    <label className={dk.inputLabel} htmlFor="room-num">Numéro</label>
                    <input
                      id="room-num" type="number" className={dk.input}
                      value={formData.roomNumber}
                      onChange={(e) => setFormData((p) => ({ ...p, roomNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div className={dk.inputGroup}>
                    <label className={dk.inputLabel} htmlFor="room-floor">Étage</label>
                    <input
                      id="room-floor" type="number" className={dk.input}
                      value={formData.floor}
                      min="0"
                      onChange={(e) => setFormData((p) => ({ ...p, floor: e.target.value }))}
                    />
                  </div>
                  <div className={dk.inputGroup}>
                    <label className={dk.inputLabel} htmlFor="room-type">Type</label>
                    <select
                      id="room-type"
                      className={dk.input}
                      value={formData.type}
                      onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                      style={{ cursor: 'pointer' }}
                    >
                      {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  {createError && (
                    <div className={dk.errorBox} style={{ marginBottom: 12 }}>
                      <span className={dk.errorText}>{createError}</span>
                    </div>
                  )}
                  <button type="submit" className={dk.btn} disabled={creating} style={{ width: '100%', marginTop: 4 }}>
                    {creating ? 'Création…' : 'Créer la chambre'}
                  </button>
                </form>
              </div>
            )}

            {loading ? (
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)', textAlign: 'center', padding: '40px 0' }}>Chargement…</p>
            ) : rooms.length === 0 ? (
              <div className={dk.card} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'var(--cream-dim)' }}>Aucune chambre. Commencez par en créer une.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}
                  >
                    {/* Room header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: 'var(--cream)', lineHeight: 1 }}>
                          {room.roomNumber}
                        </p>
                        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, color: 'var(--cream-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
                          {room.type} · Ét. {room.floor}
                        </p>
                      </div>
                      <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: STATUS_COLORS[room.status], border: `1px solid ${STATUS_COLORS[room.status]}55`, padding: '2px 6px' }}>
                        {STATUS_LABELS[room.status]}
                      </span>
                    </div>

                    {/* Room code */}
                    <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', padding: '8px 10px', textAlign: 'center' }}>
                      <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: 4 }}>
                        Code chambre
                      </p>
                      <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: 'var(--gold)', letterSpacing: '0.2em' }}>
                        {room.roomCode}
                      </p>
                    </div>

                    {/* QR */}
                    {room.qrCodeUrl ? (
                      <div style={{ textAlign: 'center' }}>
                        <img src={room.qrCodeUrl} alt={`QR Chambre ${room.roomNumber}`} style={{ width: 80, height: 80, display: 'block', margin: '0 auto 6px' }} />
                        <a href={room.qrCodeUrl} download={`chambre-${room.roomNumber}.png`}>
                          <button className={dk.btnOutline} style={{ fontSize: 8, padding: '4px 10px', width: '100%' }}>
                            Télécharger QR
                          </button>
                        </a>
                      </div>
                    ) : (
                      <button
                        className={dk.btn}
                        style={{ fontSize: 9, padding: '8px 12px', opacity: qrLoading === room.id ? 0.5 : 1 }}
                        disabled={qrLoading === room.id}
                        onClick={() => handleGenerateQR(room.id)}
                      >
                        {qrLoading === room.id ? 'Génération…' : 'Générer QR'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Occupancy tab ── */}
        {tab === 'occupancy' && (
          <>
            {loading ? (
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)', textAlign: 'center', padding: '40px 0' }}>Chargement…</p>
            ) : (
              <>
                <div className={dk.summaryStrip} style={{ marginBottom: 16 }}>
                  <div className={dk.summaryCell}>
                    <span className={dk.summaryCellLabel}>Occupées</span>
                    <span className={dk.summaryCellValue}>{occupied}</span>
                  </div>
                  <div className={dk.summaryCell}>
                    <span className={dk.summaryCellLabel}>Libres</span>
                    <span className={dk.summaryCellValue}>{available}</span>
                  </div>
                  <div className={dk.summaryCell}>
                    <span className={dk.summaryCellLabel}>Maintenance</span>
                    <span className={dk.summaryCellValue}>{rooms.length - occupied - available}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[...rooms].sort((a, b) => a.roomNumber - b.roomNumber).map((room) => (
                    <div
                      key={room.id}
                      style={{
                        background: 'var(--surface)',
                        border: `1px solid ${STATUS_COLORS[room.status]}55`,
                        padding: '12px 10px',
                        textAlign: 'center',
                      }}
                    >
                      <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[room.status], margin: '0 auto 6px' }} />
                      <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--cream)', lineHeight: 1 }}>{room.roomNumber}</p>
                      <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, color: STATUS_COLORS[room.status], letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
                        {STATUS_LABELS[room.status]}
                      </p>
                      <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, color: 'var(--cream-dim)', marginTop: 2 }}>Ét. {room.floor}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

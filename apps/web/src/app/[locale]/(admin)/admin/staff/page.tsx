'use client';

import { useEffect, useState } from 'react';
import { BackButton } from '@/components/shared/BackButton';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import dk from '@/styles/dark.module.css';

interface StaffMember {
  id:        string;
  email:     string;
  isActive:  boolean;
  createdAt: string;
  role:      string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });
}

export default function AdminStaffPage() {
  const { user } = useAuth();
  const restaurantId = user?.restaurantId ?? '';

  const [staff,         setStaff]         = useState<StaffMember[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  /* Create form */
  const [newEmail,      setNewEmail]      = useState('');
  const [newPassword,   setNewPassword]   = useState('');
  const [creating,      setCreating]      = useState(false);
  const [createError,   setCreateError]   = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  /* Confirm delete */
  const [deletingId,    setDeletingId]    = useState<string | null>(null);
  const [togglingId,    setTogglingId]    = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;
    api.get(`/restaurants/${restaurantId}/staff`)
      .then(({ data }) => setStaff(data.data))
      .catch(() => setError('Impossible de charger le personnel.'))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setCreating(true);
    try {
      const { data } = await api.post(`/restaurants/${restaurantId}/staff`, {
        email:    newEmail,
        password: newPassword,
      });
      setStaff((prev) => [...prev, data.data]);
      setNewEmail('');
      setNewPassword('');
      setCreateSuccess(`Compte créé pour ${data.data.email}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erreur lors de la création.';
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (member: StaffMember) => {
    setTogglingId(member.id);
    try {
      await api.patch(`/restaurants/${restaurantId}/staff/${member.id}/toggle`);
      setStaff((prev) =>
        prev.map((s) => s.id === member.id ? { ...s, isActive: !s.isActive } : s),
      );
    } catch {
      /* silent */
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/restaurants/${restaurantId}/staff/${id}`);
      setStaff((prev) => prev.filter((s) => s.id !== id));
      setDeletingId(null);
    } catch {
      /* silent */
    }
  };

  return (
    <div className={dk.page} onClick={() => setDeletingId(null)}>

      <header className={dk.header}>
        <BackButton />
        <span className={dk.headerTitle}>Gestion du staff</span>
        <div className={dk.headerRight}>
          <span
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 13,
              color: 'var(--gold)',
              border: '1px solid var(--line)',
              padding: '3px 10px',
            }}
          >
            {staff.length} membre{staff.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      <main className={dk.main}>

        {/* Create staff form */}
        <span className={dk.sectionLabel}>Ajouter un membre du personnel</span>
        <div className={dk.card} style={{ marginBottom: 20 }} onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div className={dk.inputGroup}>
              <label className={dk.inputLabel} htmlFor="staff-email">Adresse e-mail</label>
              <input
                id="staff-email"
                type="email"
                className={dk.input}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="staff@restaurant.cm"
                required
                autoComplete="off"
              />
            </div>

            <div className={dk.inputGroup}>
              <label className={dk.inputLabel} htmlFor="staff-password">Mot de passe</label>
              <input
                id="staff-password"
                type="password"
                className={dk.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {createError && (
              <div className={dk.errorBox} style={{ marginBottom: 12 }}>
                <span className={dk.errorText}>{createError}</span>
              </div>
            )}

            {createSuccess && (
              <div
                style={{
                  background: 'rgba(74, 222, 128, 0.07)',
                  border: '1px solid rgba(74, 222, 128, 0.25)',
                  padding: '10px 14px',
                  marginBottom: 12,
                  fontFamily: 'Jost, sans-serif',
                  fontSize: 12,
                  color: '#4ade80',
                }}
              >
                {createSuccess}
              </div>
            )}

            <button
              type="submit"
              className={dk.btn}
              disabled={creating}
              style={{ alignSelf: 'flex-start' }}
            >
              {creating ? 'Création…' : '+ Créer le compte'}
            </button>
          </form>
        </div>

        {/* Staff list */}
        <span className={dk.sectionLabel}>Personnel enregistré</span>

        {error && (
          <div className={dk.errorBox} style={{ marginBottom: 12 }}>
            <span className={dk.errorText}>{error}</span>
          </div>
        )}

        {loading ? (
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: 12,
              color: 'var(--cream-dim)',
              textAlign: 'center',
              padding: '40px 0',
            }}
          >
            Chargement…
          </p>
        ) : staff.length === 0 ? (
          <div className={dk.card} style={{ textAlign: 'center' }}>
            <p
              style={{
                fontFamily: 'Jost, sans-serif',
                fontSize: 13,
                color: 'var(--cream-dim)',
              }}
            >
              Aucun membre du personnel.
            </p>
          </div>
        ) : (
          <div className={dk.card} style={{ padding: 0, overflow: 'hidden' }}>
            {staff.map((member) => {
              const isDeleting = deletingId === member.id;
              const isToggling = togglingId === member.id;

              return (
                <div
                  key={member.id}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display:       'flex',
                    alignItems:    'center',
                    gap:           12,
                    padding:       '14px 16px',
                    borderBottom:  '1px solid var(--line)',
                    flexWrap:      'wrap',
                  }}
                >
                  {/* Status dot */}
                  <span
                    style={{
                      width:        8,
                      height:       8,
                      borderRadius: '50%',
                      background:   member.isActive ? '#4ade80' : '#f87171',
                      flexShrink:   0,
                    }}
                  />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily:    'Jost, sans-serif',
                        fontSize:      13,
                        color:         'var(--cream)',
                        whiteSpace:    'nowrap',
                        overflow:      'hidden',
                        textOverflow:  'ellipsis',
                        marginBottom:  2,
                      }}
                    >
                      {member.email}
                    </p>
                    <div
                      style={{
                        display:    'flex',
                        gap:        10,
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontFamily:    'Jost, sans-serif',
                          fontSize:      9,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color:         'var(--cream-dim)',
                        }}
                      >
                        {member.role}
                      </span>
                      <span
                        style={{
                          fontFamily:    'Jost, sans-serif',
                          fontSize:      9,
                          color:         'var(--cream-dim)',
                        }}
                      >
                        Depuis le {formatDate(member.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Active badge */}
                  <span
                    style={{
                      fontFamily:    'Jost, sans-serif',
                      fontSize:      8,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color:         member.isActive ? '#4ade80' : '#f87171',
                      border:        `1px solid ${member.isActive ? 'rgba(74,222,128,0.35)' : 'rgba(248,113,113,0.35)'}`,
                      padding:       '2px 7px',
                      flexShrink:    0,
                    }}
                  >
                    {member.isActive ? 'Actif' : 'Inactif'}
                  </span>

                  {/* Toggle */}
                  <button
                    style={{
                      background:    'none',
                      border:        '1px solid var(--line)',
                      color:         'var(--cream-dim)',
                      padding:       '4px 10px',
                      cursor:        'pointer',
                      fontFamily:    'Jost, sans-serif',
                      fontSize:      9,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      flexShrink:    0,
                      opacity:       isToggling ? 0.5 : 1,
                    }}
                    disabled={isToggling}
                    onClick={() => handleToggleActive(member)}
                  >
                    {member.isActive ? 'Désactiver' : 'Activer'}
                  </button>

                  {/* Delete */}
                  {isDeleting ? (
                    <button
                      className={dk.btnDanger}
                      style={{ fontSize: 9, padding: '5px 10px', flexShrink: 0 }}
                      onClick={() => handleDelete(member.id)}
                    >
                      Confirmer ?
                    </button>
                  ) : (
                    <button
                      style={{
                        background:  'none',
                        border:      '1px solid rgba(239,68,68,0.3)',
                        color:       '#f87171',
                        padding:     '4px 8px',
                        cursor:      'pointer',
                        fontSize:    11,
                        flexShrink:  0,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(member.id);
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

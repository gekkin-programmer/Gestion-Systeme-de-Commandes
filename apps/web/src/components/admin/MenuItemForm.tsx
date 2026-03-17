'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import dk from '@/styles/dark.module.css';
import type { CategoryDTO, MenuItemDTO } from '@/types';

interface MenuItemFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: (item: MenuItemDTO) => void;
  restaurantId: string;
  categories: CategoryDTO[];
  editItem?: MenuItemDTO;
}

interface FormState {
  nameFr: string; nameEn: string;
  descriptionFr: string; descriptionEn: string;
  price: string; categoryId: string; imageUrl: string;
  isAvailable: boolean; isPopular: boolean;
  chefName: string; cookingTimeMin: string;
  calories: string; servings: string;
  proteinG: string; carbsG: string; fatG: string;
}

const EMPTY: FormState = {
  nameFr: '', nameEn: '', descriptionFr: '', descriptionEn: '',
  price: '', categoryId: '', imageUrl: '',
  isAvailable: true, isPopular: false,
  chefName: '', cookingTimeMin: '', calories: '', servings: '',
  proteinG: '', carbsG: '', fatG: '',
};

function calcCalories(protein: string, carbs: string, fat: string): string {
  const p = parseFloat(protein) || 0;
  const c = parseFloat(carbs) || 0;
  const f = parseFloat(fat) || 0;
  if (p === 0 && c === 0 && f === 0) return '';
  return String(Math.round(p * 4 + c * 4 + f * 9));
}

export function MenuItemForm({ open, onClose, onSaved, restaurantId, categories, editItem }: MenuItemFormProps) {
  const [form,         setForm]         = useState<FormState>(EMPTY);
  const [error,        setError]        = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tab,          setTab]          = useState<'essential' | 'details'>('essential');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTab('essential');
    if (editItem) {
      setForm({
        nameFr: editItem.nameFr, nameEn: editItem.nameEn,
        descriptionFr: editItem.descriptionFr ?? '', descriptionEn: editItem.descriptionEn ?? '',
        price: String(editItem.price), categoryId: editItem.categoryId, imageUrl: editItem.imageUrl ?? '',
        isAvailable: editItem.isAvailable, isPopular: editItem.isPopular,
        chefName: editItem.chefName ?? '',
        cookingTimeMin: editItem.cookingTimeMin ? String(editItem.cookingTimeMin) : '',
        calories: editItem.calories ? String(editItem.calories) : '',
        servings: editItem.servings ? String(editItem.servings) : '',
        proteinG: editItem.proteinG ? String(editItem.proteinG) : '',
        carbsG: editItem.carbsG ? String(editItem.carbsG) : '',
        fatG: editItem.fatG ? String(editItem.fatG) : '',
      });
      setImagePreview(editItem.imageUrl ?? null);
    } else {
      setForm({ ...EMPTY, categoryId: categories[0]?.id ?? '' });
      setImagePreview(null);
    }
    setError(null);
  }, [open, editItem, categories]);

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setMacro = (field: 'proteinG' | 'carbsG' | 'fatG', value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      next.calories = calcCalories(
        field === 'proteinG' ? value : prev.proteinG,
        field === 'carbsG'   ? value : prev.carbsG,
        field === 'fatG'     ? value : prev.fatG,
      );
      return next;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      set('imageUrl', data.data.url as string);
    } catch {
      setError("Erreur lors du téléchargement de l'image");
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(form.price);
    if (!form.nameFr.trim()) { setError('Le nom en français est requis'); setTab('essential'); return; }
    if (!form.nameEn.trim()) { setError('The English name is required'); setTab('essential'); return; }
    if (!form.categoryId)    { setError('Sélectionnez une catégorie'); setTab('essential'); return; }
    if (isNaN(p) || p <= 0) { setError('Prix invalide'); setTab('essential'); return; }
    setError(null); setLoading(true);
    try {
      const payload = {
        nameFr: form.nameFr.trim(), nameEn: form.nameEn.trim(),
        descriptionFr: form.descriptionFr.trim() || undefined,
        descriptionEn: form.descriptionEn.trim() || undefined,
        price: p, categoryId: form.categoryId,
        imageUrl: form.imageUrl.trim() || undefined,
        isAvailable: form.isAvailable, isPopular: form.isPopular,
        chefName: form.chefName.trim() || undefined,
        cookingTimeMin: form.cookingTimeMin ? parseInt(form.cookingTimeMin) : undefined,
        calories: form.calories ? parseInt(form.calories) : undefined,
        servings: form.servings ? parseInt(form.servings) : undefined,
        proteinG: form.proteinG ? parseFloat(form.proteinG) : undefined,
        carbsG: form.carbsG ? parseFloat(form.carbsG) : undefined,
        fatG: form.fatG ? parseFloat(form.fatG) : undefined,
      };
      const { data } = editItem
        ? await api.patch(`/menu/items/${editItem.id}`, payload)
        : await api.post(`/menu/${restaurantId}/items`, payload);
      onSaved(data.data as MenuItemDTO);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur serveur';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const inp: React.CSSProperties = { width: '100%', background: '#100C07', border: '1px solid rgba(240,230,211,0.1)', color: '#F0E6D3', padding: '10px 12px', fontFamily: 'Jost, sans-serif', fontSize: 13, outline: 'none', transition: 'border-color 0.2s' };
  const lbl: React.CSSProperties = { fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#A89880', display: 'block', marginBottom: 4 };
  const grp: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };
  const g2:  React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 };
  const g3:  React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose} />

      {/* Panel */}
      <div style={{
        position: 'relative', zIndex: 201,
        width: '100%', maxWidth: 560,
        background: '#1C1510',
        border: '1px solid rgba(240,230,211,0.1)',
        animation: 'slideUp 0.22s ease-out',
      }}>
        {/* Gold top accent */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #C8A96E, transparent)' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 0' }}>
          <div>
            <span style={{ ...lbl, marginBottom: 2 }}>Formulaire</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#F0E6D3', fontWeight: 400, margin: 0 }}>
              {editItem ? 'Modifier le plat' : 'Ajouter un plat'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(240,230,211,0.1)', color: '#A89880', width: 30, height: 30, cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(240,230,211,0.1)', marginTop: 16, padding: '0 24px' }}>
          {(['essential', 'details'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? '#C8A96E' : 'transparent'}`,
                color: tab === t ? '#C8A96E' : '#A89880',
                fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
                padding: '10px 16px', cursor: 'pointer', marginBottom: -1, transition: 'color 0.2s',
              }}
            >
              {t === 'essential' ? 'Essentiel' : 'Détails'}
            </button>
          ))}
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>

            {tab === 'essential' && (
              <>
                <div style={g2}>
                  <div style={grp}><label style={lbl}>Nom (FR) *</label><input style={inp} value={form.nameFr} onChange={(e) => set('nameFr', e.target.value)} placeholder="Ex: Poulet DG" /></div>
                  <div style={grp}><label style={lbl}>Name (EN) *</label><input style={inp} value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} placeholder="Ex: DG Chicken" /></div>
                </div>

                <div style={g2}>
                  <div style={grp}><label style={lbl}>Prix (XAF) *</label><input style={inp} type="number" min="1" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="3500" /></div>
                  <div style={grp}>
                    <label style={lbl}>Catégorie *</label>
                    <div style={{ position: 'relative' }}>
                      <select
                        style={{
                          ...inp,
                          appearance: 'none', WebkitAppearance: 'none',
                          paddingRight: 40, cursor: 'pointer',
                          borderColor: form.categoryId ? 'rgba(200,169,110,0.4)' : 'rgba(240,230,211,0.1)',
                        }}
                        value={form.categoryId}
                        onChange={(e) => set('categoryId', e.target.value)}
                      >
                        <option value="" disabled style={{ background: '#1C1510', color: '#A89880' }}>Choisir une catégorie…</option>
                        {categories.map((cat) => <option key={cat.id} value={cat.id} style={{ background: '#1C1510', color: '#F0E6D3' }}>{cat.nameFr}</option>)}
                      </select>
                      {/* Gold chevron overlay */}
                      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#C8A96E' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Image upload */}
                <div style={grp}>
                  <label style={lbl}>Photo du plat</label>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${imagePreview ? 'rgba(200,169,110,0.5)' : 'rgba(240,230,211,0.1)'}`,
                      background: '#100C07',
                      cursor: uploading ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: imagePreview ? 0 : '16px 14px',
                      overflow: 'hidden',
                      transition: 'border-color 0.2s',
                      height: imagePreview ? 90 : undefined,
                    }}
                  >
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A89880" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: '#A89880' }}>
                          {uploading ? 'Téléchargement…' : 'Cliquer pour choisir une photo'}
                        </span>
                      </>
                    )}
                  </div>
                  {imagePreview && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', color: '#C8A96E', fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', textAlign: 'left', padding: '4px 0' }}>
                      ↺ Changer l&apos;image
                    </button>
                  )}
                </div>

                {/* Flags */}
                <div style={{ display: 'flex', gap: 24, paddingTop: 4 }}>
                  {([['isAvailable', 'Disponible'], ['isPopular', 'Populaire']] as const).map(([field, label]) => {
                    const checked = form[field];
                    return (
                      <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontSize: 12, color: checked ? '#C8A96E' : '#A89880', transition: 'color 0.2s' }}>
                        <input type="checkbox" checked={checked} onChange={(e) => set(field, e.target.checked)} style={{ display: 'none' }} />
                        <span style={{
                          width: 16, height: 16, flexShrink: 0,
                          border: `1px solid ${checked ? '#C8A96E' : 'rgba(240,230,211,0.2)'}`,
                          background: checked ? '#C8A96E' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}>
                          {checked && (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#100C07" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="2 6 5 9 10 3" />
                            </svg>
                          )}
                        </span>
                        {label}
                      </label>
                    );
                  })}
                </div>
              </>
            )}

            {tab === 'details' && (
              <>
                <div style={grp}><label style={lbl}>Description (FR)</label><textarea style={{ ...inp, resize: 'none' }} rows={2} value={form.descriptionFr} onChange={(e) => set('descriptionFr', e.target.value)} placeholder="Description en français…" /></div>
                <div style={grp}><label style={lbl}>Description (EN)</label><textarea style={{ ...inp, resize: 'none' }} rows={2} value={form.descriptionEn} onChange={(e) => set('descriptionEn', e.target.value)} placeholder="English description…" /></div>

                <div style={g2}>
                  <div style={grp}><label style={lbl}>Cuisinier</label><input style={inp} value={form.chefName} onChange={(e) => set('chefName', e.target.value)} placeholder="Chef Mbarga" /></div>
                  <div style={grp}><label style={lbl}>Temps cuisson (min)</label><input style={inp} type="number" min="1" value={form.cookingTimeMin} onChange={(e) => set('cookingTimeMin', e.target.value)} placeholder="20" /></div>
                </div>

                <div style={grp}>
                  <label style={lbl}>Macronutriments (g)</label>
                  <div style={g3}>
                    <div style={grp}><label style={{ ...lbl, fontSize: 8 }}>Protéines</label><input style={inp} type="number" min="0" step="0.1" value={form.proteinG} onChange={(e) => setMacro('proteinG', e.target.value)} placeholder="0" /></div>
                    <div style={grp}><label style={{ ...lbl, fontSize: 8 }}>Glucides</label><input style={inp} type="number" min="0" step="0.1" value={form.carbsG} onChange={(e) => setMacro('carbsG', e.target.value)} placeholder="0" /></div>
                    <div style={grp}><label style={{ ...lbl, fontSize: 8 }}>Lipides</label><input style={inp} type="number" min="0" step="0.1" value={form.fatG} onChange={(e) => setMacro('fatG', e.target.value)} placeholder="0" /></div>
                  </div>
                </div>

                <div style={g2}>
                  <div style={grp}><label style={lbl}>Calories (kcal)</label><input style={{ ...inp, color: (form.proteinG || form.carbsG || form.fatG) ? '#C8A96E' : '#F0E6D3' }} type="number" min="1" value={form.calories} onChange={(e) => set('calories', e.target.value)} placeholder="450" /></div>
                  <div style={grp}><label style={lbl}>Personnes</label><input style={inp} type="number" min="1" value={form.servings} onChange={(e) => set('servings', e.target.value)} placeholder="2" /></div>
                </div>
              </>
            )}

          </div>

          {error && (
            <div style={{ margin: '0 24px', padding: '10px 14px', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)' }}>
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: '#f87171' }}>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid rgba(240,230,211,0.1)' }}>
            <button type="button" className={dk.btnOutline} style={{ fontSize: 10, padding: '10px 20px' }} onClick={onClose} disabled={loading}>Annuler</button>
            <button type="submit" className={dk.btn} style={{ fontSize: 10, padding: '10px 20px' }} disabled={loading || uploading}>
              {loading ? '…' : editItem ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

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
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  isAvailable: boolean;
  isPopular: boolean;
  chefName: string;
  cookingTimeMin: string;
  calories: string;
  servings: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
}

const EMPTY: FormState = {
  nameFr: '',
  nameEn: '',
  descriptionFr: '',
  descriptionEn: '',
  price: '',
  categoryId: '',
  imageUrl: '',
  isAvailable: true,
  isPopular: false,
  chefName: '',
  cookingTimeMin: '',
  calories: '',
  servings: '',
  proteinG: '',
  carbsG: '',
  fatG: '',
};

function calcCalories(protein: string, carbs: string, fat: string): string {
  const p = parseFloat(protein) || 0;
  const c = parseFloat(carbs) || 0;
  const f = parseFloat(fat) || 0;
  if (p === 0 && c === 0 && f === 0) return '';
  return String(Math.round(p * 4 + c * 4 + f * 9));
}

export function MenuItemForm({ open, onClose, onSaved, restaurantId, categories, editItem }: MenuItemFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (editItem) {
      setForm({
        nameFr: editItem.nameFr,
        nameEn: editItem.nameEn,
        descriptionFr: editItem.descriptionFr ?? '',
        descriptionEn: editItem.descriptionEn ?? '',
        price: String(editItem.price),
        categoryId: editItem.categoryId,
        imageUrl: editItem.imageUrl ?? '',
        isAvailable: editItem.isAvailable,
        isPopular: editItem.isPopular,
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
        field === 'carbsG' ? value : prev.carbsG,
        field === 'fatG' ? value : prev.fatG,
      );
      return next;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // local preview
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set('imageUrl', data.data.url as string);
    } catch {
      setError('Erreur lors du téléchargement de l\'image');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(form.price);
    if (!form.nameFr.trim()) { setError('Le nom en français est requis'); return; }
    if (!form.nameEn.trim()) { setError('The English name is required'); return; }
    if (!form.categoryId)    { setError('Sélectionnez une catégorie'); return; }
    if (isNaN(p) || p <= 0) { setError('Prix invalide (doit être > 0)'); return; }
    setError(null);
    setLoading(true);
    try {
      const payload = {
        nameFr: form.nameFr.trim(),
        nameEn: form.nameEn.trim(),
        descriptionFr: form.descriptionFr.trim() || undefined,
        descriptionEn: form.descriptionEn.trim() || undefined,
        price: p,
        categoryId: form.categoryId,
        imageUrl: form.imageUrl.trim() || undefined,
        isAvailable: form.isAvailable,
        isPopular: form.isPopular,
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg)',
    border: '1px solid var(--line)',
    color: 'var(--cream)',
    padding: '10px 12px',
    fontFamily: 'Jost, sans-serif',
    fontSize: 13,
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'Jost, sans-serif',
    fontSize: 9,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: 'var(--cream-dim)',
    display: 'block',
    marginBottom: 4,
  };

  const groupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };
  const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 };
  const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div style={{
        position: 'relative',
        zIndex: 201,
        width: '100%',
        maxWidth: 540,
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        padding: '24px 20px',
        borderBottom: 'none',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: 'var(--cream)', fontWeight: 400 }}>
            {editItem ? 'Modifier le plat' : 'Ajouter un plat'}
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--cream-dim)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Names */}
          <div style={grid2}>
            <div style={groupStyle}>
              <label style={labelStyle}>Nom (FR) *</label>
              <input style={inputStyle} value={form.nameFr} onChange={(e) => set('nameFr', e.target.value)} placeholder="Ex: Poulet DG" />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Name (EN) *</label>
              <input style={inputStyle} value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} placeholder="Ex: DG Chicken" />
            </div>
          </div>

          {/* Descriptions */}
          <div style={groupStyle}>
            <label style={labelStyle}>Description (FR)</label>
            <textarea style={{ ...inputStyle, resize: 'none' }} rows={2} value={form.descriptionFr} onChange={(e) => set('descriptionFr', e.target.value)} placeholder="Description en français…" />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>Description (EN)</label>
            <textarea style={{ ...inputStyle, resize: 'none' }} rows={2} value={form.descriptionEn} onChange={(e) => set('descriptionEn', e.target.value)} placeholder="English description…" />
          </div>

          {/* Price + Category */}
          <div style={grid2}>
            <div style={groupStyle}>
              <label style={labelStyle}>Prix (XAF) *</label>
              <input style={inputStyle} type="number" min="1" step="1" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="Ex: 3500" />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Catégorie *</label>
              <select style={{ ...inputStyle }} value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
                <option value="" disabled>Choisir…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nameFr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image upload */}
          <div style={groupStyle}>
            <label style={labelStyle}>Image du plat</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                ...inputStyle,
                cursor: 'pointer',
                textAlign: 'left',
                color: uploading ? 'var(--cream-dim)' : imagePreview ? 'var(--gold)' : 'var(--cream-dim)',
              }}
            >
              {uploading ? 'Téléchargement…' : imagePreview ? 'Image sélectionnée — cliquer pour changer' : 'Choisir une image depuis l\'appareil'}
            </button>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                style={{ width: '100%', height: 120, objectFit: 'cover', border: '1px solid var(--line)', marginTop: 4 }}
              />
            )}
          </div>

          {/* Chef + Cooking time */}
          <div style={grid2}>
            <div style={groupStyle}>
              <label style={labelStyle}>Nom du cuisinier</label>
              <input style={inputStyle} value={form.chefName} onChange={(e) => set('chefName', e.target.value)} placeholder="Ex: Chef Mbarga" />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Temps de cuisson (min)</label>
              <input style={inputStyle} type="number" min="1" value={form.cookingTimeMin} onChange={(e) => set('cookingTimeMin', e.target.value)} placeholder="Ex: 20" />
            </div>
          </div>

          {/* Macros → auto-calculate calories */}
          <div style={groupStyle}>
            <label style={labelStyle}>Macronutriments (g) — calcul automatique des calories</label>
            <div style={grid3}>
              <div style={groupStyle}>
                <label style={{ ...labelStyle, fontSize: 8 }}>Protéines (g)</label>
                <input style={inputStyle} type="number" min="0" step="0.1" value={form.proteinG} onChange={(e) => setMacro('proteinG', e.target.value)} placeholder="0" />
              </div>
              <div style={groupStyle}>
                <label style={{ ...labelStyle, fontSize: 8 }}>Glucides (g)</label>
                <input style={inputStyle} type="number" min="0" step="0.1" value={form.carbsG} onChange={(e) => setMacro('carbsG', e.target.value)} placeholder="0" />
              </div>
              <div style={groupStyle}>
                <label style={{ ...labelStyle, fontSize: 8 }}>Lipides (g)</label>
                <input style={inputStyle} type="number" min="0" step="0.1" value={form.fatG} onChange={(e) => setMacro('fatG', e.target.value)} placeholder="0" />
              </div>
            </div>
          </div>

          {/* Calories (auto or manual) + Servings */}
          <div style={grid2}>
            <div style={groupStyle}>
              <label style={labelStyle}>Calories (kcal)</label>
              <input
                style={{ ...inputStyle, color: (form.proteinG || form.carbsG || form.fatG) ? 'var(--gold)' : 'var(--cream)' }}
                type="number"
                min="1"
                value={form.calories}
                onChange={(e) => set('calories', e.target.value)}
                placeholder="Ex: 450"
              />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Nombre de personnes</label>
              <input style={inputStyle} type="number" min="1" value={form.servings} onChange={(e) => set('servings', e.target.value)} placeholder="Ex: 2" />
            </div>
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'flex', gap: 24, paddingTop: 4 }}>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textTransform: 'none', fontSize: 12 }}>
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => set('isAvailable', e.target.checked)} />
              Disponible
            </label>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textTransform: 'none', fontSize: 12 }}>
              <input type="checkbox" checked={form.isPopular} onChange={(e) => set('isPopular', e.target.checked)} />
              Populaire
            </label>
          </div>

          {error && (
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: '#f87171', marginTop: 4 }}>{error}</p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
            <button type="button" className={dk.btnOutline} style={{ fontSize: 10, padding: '10px 20px' }} onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className={dk.btn} style={{ fontSize: 10, padding: '10px 20px' }} disabled={loading || uploading}>
              {loading ? '…' : editItem ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

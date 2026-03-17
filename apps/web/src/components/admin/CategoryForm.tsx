'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';
import dk from '@/styles/dark.module.css';
import type { CategoryDTO } from '@/types';

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: (cat: CategoryDTO) => void;
  restaurantId: string;
  editCategory?: CategoryDTO;
}

interface FormState {
  nameFr: string;
  nameEn: string;
  sortOrder: string;
}

const EMPTY: FormState = { nameFr: '', nameEn: '', sortOrder: '0' };

export function CategoryForm({ open, onClose, onSaved, restaurantId, editCategory }: CategoryFormProps) {
  const [form,    setForm]    = useState<FormState>(EMPTY);
  const [errors,  setErrors]  = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editCategory) {
      setForm({ nameFr: editCategory.nameFr, nameEn: editCategory.nameEn, sortOrder: String(editCategory.sortOrder) });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [open, editCategory]);

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.nameFr.trim()) errs.nameFr = 'Requis';
    if (!form.nameEn.trim()) errs.nameEn = 'Required';
    const so = parseInt(form.sortOrder, 10);
    if (isNaN(so) || so < 0) errs.sortOrder = 'Doit être ≥ 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        nameFr: form.nameFr.trim(),
        nameEn: form.nameEn.trim(),
        sortOrder: parseInt(form.sortOrder, 10),
      };
      const { data } = editCategory
        ? await api.patch(`/menu/categories/${editCategory.id}`, payload)
        : await api.post(`/menu/${restaurantId}/categories`, payload);
      onSaved(data.data as CategoryDTO);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur serveur';
      setErrors({ nameFr: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className={dk.inputGroup} style={{ marginBottom: 0 }}>
            <label className={dk.inputLabel} htmlFor="catNameFr">Nom (FR) *</label>
            <input
              id="catNameFr"
              className={dk.input}
              value={form.nameFr}
              onChange={(e) => set('nameFr', e.target.value)}
              placeholder="Ex: Plats principaux"
            />
            {errors.nameFr && <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: '#f87171', marginTop: 4 }}>{errors.nameFr}</p>}
          </div>
          <div className={dk.inputGroup} style={{ marginBottom: 0 }}>
            <label className={dk.inputLabel} htmlFor="catNameEn">Name (EN) *</label>
            <input
              id="catNameEn"
              className={dk.input}
              value={form.nameEn}
              onChange={(e) => set('nameEn', e.target.value)}
              placeholder="Ex: Main dishes"
            />
            {errors.nameEn && <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: '#f87171', marginTop: 4 }}>{errors.nameEn}</p>}
          </div>
        </div>

        <div className={dk.inputGroup} style={{ marginBottom: 0 }}>
          <label className={dk.inputLabel} htmlFor="sortOrder">Ordre d&apos;affichage</label>
          <input
            id="sortOrder"
            type="number"
            min="0"
            step="1"
            className={dk.input}
            value={form.sortOrder}
            onChange={(e) => set('sortOrder', e.target.value)}
          />
          {errors.sortOrder && <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: '#f87171', marginTop: 4 }}>{errors.sortOrder}</p>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
          <button type="button" className={dk.btnOutline} style={{ fontSize: 10, padding: '10px 20px' }} onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button type="submit" className={dk.btn} style={{ fontSize: 10, padding: '10px 20px' }} disabled={loading}>
            {loading ? 'Sauvegarde…' : editCategory ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

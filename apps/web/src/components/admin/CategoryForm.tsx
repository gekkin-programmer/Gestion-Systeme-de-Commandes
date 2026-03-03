'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
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
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editCategory) {
      setForm({
        nameFr: editCategory.nameFr,
        nameEn: editCategory.nameEn,
        sortOrder: String(editCategory.sortOrder),
      });
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

  const title = editCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie';

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="catNameFr"
            label="Nom (FR) *"
            value={form.nameFr}
            onChange={(e) => set('nameFr', e.target.value)}
            placeholder="Ex: Plats principaux"
            error={errors.nameFr}
          />
          <Input
            id="catNameEn"
            label="Name (EN) *"
            value={form.nameEn}
            onChange={(e) => set('nameEn', e.target.value)}
            placeholder="Ex: Main dishes"
            error={errors.nameEn}
          />
        </div>

        <Input
          id="sortOrder"
          label="Ordre d'affichage"
          type="number"
          min="0"
          step="1"
          value={form.sortOrder}
          onChange={(e) => set('sortOrder', e.target.value)}
          error={errors.sortOrder}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" loading={loading}>
            {editCategory ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

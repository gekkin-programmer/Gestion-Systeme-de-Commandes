'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
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
  isAvailable: boolean;
  isPopular: boolean;
}

const EMPTY: FormState = {
  nameFr: '',
  nameEn: '',
  descriptionFr: '',
  descriptionEn: '',
  price: '',
  categoryId: '',
  isAvailable: true,
  isPopular: false,
};

export function MenuItemForm({ open, onClose, onSaved, restaurantId, categories, editItem }: MenuItemFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);

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
        isAvailable: editItem.isAvailable,
        isPopular: editItem.isPopular,
      });
    } else {
      setForm({ ...EMPTY, categoryId: categories[0]?.id ?? '' });
    }
    setErrors({});
  }, [open, editItem, categories]);

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.nameFr.trim()) errs.nameFr = 'Requis';
    if (!form.nameEn.trim()) errs.nameEn = 'Required';
    if (!form.categoryId) errs.categoryId = 'Sélectionnez une catégorie';
    const p = parseFloat(form.price);
    if (isNaN(p) || p <= 0) errs.price = 'Prix invalide (doit être > 0)';
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
        descriptionFr: form.descriptionFr.trim() || undefined,
        descriptionEn: form.descriptionEn.trim() || undefined,
        price: parseFloat(form.price),
        categoryId: form.categoryId,
        isAvailable: form.isAvailable,
        isPopular: form.isPopular,
      };

      const { data } = editItem
        ? await api.patch(`/menu/items/${editItem.id}`, payload)
        : await api.post(`/menu/${restaurantId}/items`, payload);

      onSaved(data.data as MenuItemDTO);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur serveur';
      setErrors({ nameFr: msg });
    } finally {
      setLoading(false);
    }
  };

  const title = editItem ? 'Modifier le plat' : 'Ajouter un plat';

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Names */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="nameFr"
            label="Nom (FR) *"
            value={form.nameFr}
            onChange={(e) => set('nameFr', e.target.value)}
            placeholder="Ex: Poulet DG"
            error={errors.nameFr}
          />
          <Input
            id="nameEn"
            label="Name (EN) *"
            value={form.nameEn}
            onChange={(e) => set('nameEn', e.target.value)}
            placeholder="Ex: DG Chicken"
            error={errors.nameEn}
          />
        </div>

        {/* Descriptions */}
        <div className="flex flex-col gap-1">
          <label htmlFor="descFr" className="text-sm font-medium text-gray-700">
            Description (FR)
          </label>
          <textarea
            id="descFr"
            rows={2}
            value={form.descriptionFr}
            onChange={(e) => set('descriptionFr', e.target.value)}
            placeholder="Description en français…"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="descEn" className="text-sm font-medium text-gray-700">
            Description (EN)
          </label>
          <textarea
            id="descEn"
            rows={2}
            value={form.descriptionEn}
            onChange={(e) => set('descriptionEn', e.target.value)}
            placeholder="English description…"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none"
          />
        </div>

        {/* Price + Category */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="price"
            label="Prix (XAF) *"
            type="number"
            min="1"
            step="1"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="Ex: 3500"
            error={errors.price}
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="categoryId" className="text-sm font-medium text-gray-700">
              Catégorie *
            </label>
            <select
              id="categoryId"
              value={form.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="" disabled>Choisir…</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nameFr}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => set('isAvailable', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Disponible</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isPopular}
              onChange={(e) => set('isPopular', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Populaire</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" loading={loading}>
            {editItem ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

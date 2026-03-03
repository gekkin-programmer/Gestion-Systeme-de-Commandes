'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BackButton } from '@/components/shared/BackButton';
import api from '@/lib/api';

export default function CreateRestaurantPage() {
  const router = useRouter();
  const locale = useLocale();
  const [form, setForm] = useState({ name: '', slug: '', city: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const slugify = (str: string) =>
    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/superadmin/restaurants', form);
      router.push(`/${locale}/superadmin`);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3">
        <BackButton />
        <h1 className="font-bold text-gray-900">Nouveau Restaurant</h1>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <Input label="Nom" value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((p) => ({ ...p, name, slug: slugify(name) }));
            }} required />
          <Input label="Slug (URL)" value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required />
          <Input label="Ville" value={form.city}
            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
          <Input label="Adresse" value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" loading={loading}>Créer le restaurant</Button>
        </form>
      </main>
    </div>
  );
}

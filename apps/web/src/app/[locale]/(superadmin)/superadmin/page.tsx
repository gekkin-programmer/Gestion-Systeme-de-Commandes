'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { LordIcon } from '@/components/ui/LordIcon';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { RestaurantDTO } from '@/types';

export default function SuperAdminPage() {
  const locale = useLocale();
  const { user, logout } = useAuth();
  const [restaurants, setRestaurants] = useState<(RestaurantDTO & { _count: { users: number; orders: number } })[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    api.get('/superadmin/restaurants')
      .then(({ data }) => setRestaurants(data.data))
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (id: string) => {
    await api.patch(`/superadmin/restaurants/${id}/toggle`);
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)),
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <LordIcon name="user" trigger="in" size={26} colors="primary:#f97316,secondary:#1a1a1a" />
          <div>
            <h1 className="font-bold text-gray-900">Super Admin</h1>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/superadmin/restaurants`}>
            <Button size="sm" variant="secondary">
              <LordIcon name="plus" trigger="hover" size={16} colors="primary:#f97316,secondary:#1a1a1a" />
              Restaurant
            </Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={logout}>
            <LordIcon name="logout" trigger="click" size={16} colors="primary:#6b7280,secondary:#6b7280" />
            Déconnexion
          </Button>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <h2 className="mb-4 font-semibold text-gray-700">Restaurants ({restaurants.length})</h2>
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size={48} /></div>
        ) : (
          <div className="flex flex-col gap-3">
            {restaurants.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <LordIcon name="restaurant" trigger="hover" size={32} colors="primary:#f97316,secondary:#1a1a1a" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500">
                    {r.city} · {r._count.users} users · {r._count.orders} orders
                  </p>
                </div>
                <Badge variant={r.isActive ? 'success' : 'error'}>
                  {r.isActive ? 'Actif' : 'Inactif'}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => toggleActive(r.id)}>
                  {r.isActive ? 'Désactiver' : 'Activer'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

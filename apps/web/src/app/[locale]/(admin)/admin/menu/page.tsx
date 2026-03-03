'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { BackButton } from '@/components/shared/BackButton';
import { MenuItemForm } from '@/components/admin/MenuItemForm';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import dk from '@/styles/dark.module.css';
import type { CategoryDTO, MenuItemDTO } from '@/types';

type CategoryWithItems = CategoryDTO & { items: MenuItemDTO[] };

export default function AdminMenuPage() {
  const locale = useLocale();
  const { user } = useAuth();
  const restaurantId = user?.restaurantId ?? '';

  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [loading,    setLoading]    = useState(true);

  const [itemModal, setItemModal] = useState<{ open: boolean; editItem?: MenuItemDTO; defaultCategoryId?: string }>({ open: false });
  const [catModal,  setCatModal]  = useState<{ open: boolean; editCat?: CategoryDTO }>({ open: false });
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [deletingCatId,  setDeletingCatId]  = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;
    api.get(`/menu/${restaurantId}/admin`)
      .then(({ data }) => setCategories(data.data.categories))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const resetDeleting = () => { setDeletingItemId(null); setDeletingCatId(null); };

  const handleItemSaved = (saved: MenuItemDTO) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== saved.categoryId) return { ...cat, items: cat.items.filter((i) => i.id !== saved.id) };
        const exists = cat.items.some((i) => i.id === saved.id);
        return { ...cat, items: exists ? cat.items.map((i) => (i.id === saved.id ? saved : i)) : [...cat.items, saved] };
      }),
    );
  };

  const handleCatSaved = (saved: CategoryDTO) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      return exists
        ? prev.map((c) => (c.id === saved.id ? { ...c, ...saved } : c))
        : [...prev, { ...saved, items: [] }];
    });
  };

  const handleToggleAvailability = async (item: MenuItemDTO) => {
    await api.patch(`/menu/items/${item.id}/availability`);
    setCategories((prev) =>
      prev.map((cat) => ({ ...cat, items: cat.items.map((i) => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i) })),
    );
  };

  const handleDeleteItem = async (itemId: string) => {
    await api.delete(`/menu/items/${itemId}`);
    setCategories((prev) => prev.map((cat) => ({ ...cat, items: cat.items.filter((i) => i.id !== itemId) })));
    setDeletingItemId(null);
  };

  const handleDeleteCategory = async (catId: string) => {
    await api.delete(`/menu/categories/${catId}`);
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    setDeletingCatId(null);
  };

  return (
    <div className={dk.page} onClick={resetDeleting}>

      {/* Header */}
      <header className={dk.header}>
        <BackButton />
        <span className={dk.headerTitle}>Menu</span>
        <div className={dk.headerRight}>
          <button
            className={dk.btn}
            style={{ fontSize: 9, padding: '8px 14px' }}
            onClick={(e) => { e.stopPropagation(); setCatModal({ open: true }); }}
          >
            + Catégorie
          </button>
        </div>
      </header>

      <main className={dk.main}>
        {loading ? (
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)', textAlign: 'center', padding: '40px 0' }}>
            Chargement…
          </p>
        ) : categories.length === 0 ? (
          <div className={dk.card} style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'var(--cream-dim)' }}>
              Aucune catégorie. Commencez par en créer une.
            </p>
          </div>
        ) : (
          categories.map((category) => {
            const catName     = locale === 'fr' ? category.nameFr : category.nameEn;
            const isDeletingCat = deletingCatId === category.id;

            return (
              <div key={category.id} className={dk.card} onClick={(e) => e.stopPropagation()}>

                {/* Category header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: 'var(--cream)', fontWeight: 400 }}>
                      {catName}
                    </span>
                    <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)', marginLeft: 8 }}>
                      {category.nameFr} · {category.nameEn}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      className={dk.btnOutline}
                      style={{ fontSize: 8, padding: '5px 10px', borderRadius: 2 }}
                      onClick={() => setItemModal({ open: true, defaultCategoryId: category.id })}
                    >
                      + Plat
                    </button>
                    <button
                      style={{ background: 'none', border: '1px solid var(--line)', color: 'var(--cream-dim)', padding: '4px 8px', cursor: 'pointer', fontSize: 11, transition: 'color 0.2s' }}
                      onClick={() => setCatModal({ open: true, editCat: category })}
                    >
                      ✏
                    </button>
                    {isDeletingCat ? (
                      <button className={dk.btnDanger} style={{ fontSize: 9, padding: '5px 10px' }}
                        onClick={() => handleDeleteCategory(category.id)}>
                        Confirmer ?
                      </button>
                    ) : (
                      <button
                        style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '4px 8px', cursor: 'pointer', fontSize: 11, transition: 'color 0.2s' }}
                        onClick={() => { setDeletingCatId(category.id); setDeletingItemId(null); }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                {category.items.length === 0 ? (
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: 'var(--cream-dim)', fontStyle: 'italic' }}>
                    Aucun article dans cette catégorie.
                  </p>
                ) : (
                  category.items.map((item) => {
                    const iName        = locale === 'fr' ? item.nameFr : item.nameEn;
                    const isDeletingItem = deletingItemId === item.id;

                    return (
                      <div key={item.id} className={dk.row} style={{ alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'var(--cream)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {iName}
                          </p>
                          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: 'var(--gold)' }}>
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Badges */}
                        {item.isPopular && (
                          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', border: '1px solid rgba(200,169,110,0.4)', padding: '2px 6px' }}>
                            Populaire
                          </span>
                        )}
                        <span style={{
                          fontFamily: 'Jost, sans-serif', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase',
                          color:   item.isAvailable ? '#6fcf6f' : '#f87171',
                          border: `1px solid ${item.isAvailable ? 'rgba(111,207,111,0.4)' : 'rgba(248,113,113,0.4)'}`,
                          padding: '2px 6px',
                        }}>
                          {item.isAvailable ? 'Dispo' : 'Indispo'}
                        </span>

                        {/* Toggle */}
                        <button
                          style={{ background: 'none', border: '1px solid var(--line)', color: 'var(--cream-dim)', padding: '4px 8px', cursor: 'pointer', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'border-color 0.2s, color 0.2s', flexShrink: 0 }}
                          onClick={() => handleToggleAvailability(item)}
                        >
                          {item.isAvailable ? 'Désactiver' : 'Activer'}
                        </button>

                        {/* Edit */}
                        <button
                          style={{ background: 'none', border: '1px solid var(--line)', color: 'var(--cream-dim)', padding: '4px 8px', cursor: 'pointer', fontSize: 11, transition: 'color 0.2s', flexShrink: 0 }}
                          onClick={() => setItemModal({ open: true, editItem: item })}
                        >
                          ✏
                        </button>

                        {/* Delete */}
                        {isDeletingItem ? (
                          <button className={dk.btnDanger} style={{ fontSize: 9, padding: '5px 10px', flexShrink: 0 }}
                            onClick={() => handleDeleteItem(item.id)}>
                            Confirmer ?
                          </button>
                        ) : (
                          <button
                            style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '4px 8px', cursor: 'pointer', fontSize: 11, transition: 'color 0.2s', flexShrink: 0 }}
                            onClick={() => { setDeletingItemId(item.id); setDeletingCatId(null); }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })
        )}
      </main>

      {/* Modals */}
      <MenuItemForm
        open={itemModal.open}
        onClose={() => setItemModal({ open: false })}
        onSaved={handleItemSaved}
        restaurantId={restaurantId}
        categories={categories}
        editItem={itemModal.editItem}
      />
      <CategoryForm
        open={catModal.open}
        onClose={() => setCatModal({ open: false })}
        onSaved={handleCatSaved}
        restaurantId={restaurantId}
        editCategory={catModal.editCat}
      />
    </div>
  );
}

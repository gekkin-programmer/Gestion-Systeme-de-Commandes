'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { useRestaurantStore } from '@/store/restaurantStore';
import { useTheme } from '@/hooks/useTheme';
import api from '@/lib/api';
import styles from './menu.module.css';
import type { MenuDTO, MenuItemDTO, ThemePreset } from '@repo/shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(p: number) {
  return p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F') + ' FCFA';
}

// ─── Animation variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 36 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.62, ease: 'easeOut' as const },
  }),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface CardProps {
  dish:       MenuItemDTO;
  lang:       'fr' | 'en';
  qty:        number;
  onAdd:      () => void;
  onDecrease: () => void;
  index:      number;
  variant:    'A' | 'B';
}

function AddControl({ qty, onAdd, onDecrease, lang }: Pick<CardProps, 'qty' | 'onAdd' | 'onDecrease' | 'lang'>) {
  if (qty === 0) {
    return (
      <motion.button
        className={styles.addBtn}
        onClick={onAdd}
        whileHover={{ scale: 1.04, boxShadow: '0 0 14px rgba(200,169,110,0.35)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {lang === 'fr' ? 'AJOUTER +' : 'ADD +'}
      </motion.button>
    );
  }
  return (
    <div className={styles.stepper}>
      <button className={styles.stepperBtn} onClick={onDecrease}>−</button>
      <span className={styles.stepperCount}>{qty}</span>
      <button className={styles.stepperBtn} onClick={onAdd}>+</button>
    </div>
  );
}

function OutOfStockLabel({ lang }: { lang: 'fr' | 'en' }) {
  return (
    <div className={styles.outOfStockBadge}>
      {lang === 'fr' ? 'RUPTURE DE STOCK' : 'OUT OF STOCK'}
    </div>
  );
}

function DishCardA({ dish, lang, qty, onAdd, onDecrease, index }: CardProps) {
  const name = lang === 'fr' ? dish.nameFr : dish.nameEn;
  const desc = lang === 'fr' ? dish.descriptionFr : dish.descriptionEn;

  return (
    <div className={styles.cardWrapper}>
      <motion.div
        className={dish.isAvailable ? styles.cardA : `${styles.cardA} ${styles.cardDimmed}`}
        variants={fadeUp}
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <div className={styles.cardAImage}>
          <img src={dish.imageUrl ?? 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80'} alt={name} loading="lazy" />
          <div className={styles.imageOverlay} />
        </div>

        <div className={styles.cardContent}>
          <span className={styles.dishNumberBg} aria-hidden>
            {String(index + 1).padStart(2, '0')}
          </span>

          <h3 className={styles.dishName}>{name}</h3>
          {desc && <p className={styles.dishDesc}>{desc}</p>}

          {(dish.chefName || dish.cookingTimeMin || dish.calories || dish.servings) && (
            <div className={styles.metaGrid}>
              {dish.cookingTimeMin && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{lang === 'fr' ? 'Cuisson' : 'Cook time'}</span>
                  <span className={styles.metaValue}>{dish.cookingTimeMin} min</span>
                </div>
              )}
              {dish.calories && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Calories</span>
                  <span className={styles.metaValue}>{dish.calories} kcal</span>
                </div>
              )}
              {dish.servings && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{lang === 'fr' ? 'Personnes' : 'Servings'}</span>
                  <span className={styles.metaValue}>{dish.servings}</span>
                </div>
              )}
              {dish.chefName && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Chef</span>
                  <span className={styles.metaValue}>{dish.chefName}</span>
                </div>
              )}
            </div>
          )}

          <div className={styles.cardDivider} />

          <div className={styles.priceRow}>
            <span className={styles.price}>{formatPrice(dish.price)}</span>
            {dish.isAvailable && (
              <AddControl qty={qty} onAdd={onAdd} onDecrease={onDecrease} lang={lang} />
            )}
          </div>
        </div>
      </motion.div>
      {!dish.isAvailable && <OutOfStockLabel lang={lang} />}
    </div>
  );
}

function DishCardB({ dish, lang, qty, onAdd, onDecrease, index }: CardProps) {
  const name = lang === 'fr' ? dish.nameFr : dish.nameEn;
  const desc = lang === 'fr' ? dish.descriptionFr : dish.descriptionEn;

  return (
    <div className={styles.cardWrapper}>
      <motion.div
        className={dish.isAvailable ? styles.cardB : `${styles.cardB} ${styles.cardDimmed}`}
        variants={fadeUp}
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <div className={styles.cardBImage}>
          <img src={dish.imageUrl ?? 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80'} alt={name} loading="lazy" />
        </div>

        <div className={styles.cardBContent}>
          {dish.isPopular && (
            <div className={styles.popularBadge}>
              {lang === 'fr' ? 'Populaire' : 'Popular'}
            </div>
          )}
          <h3 className={styles.dishName} style={{ fontSize: 16 }}>{name}</h3>
          {desc && <p className={`${styles.dishDesc} ${styles.dishDescCompact}`}>{desc}</p>}

          {(dish.chefName || dish.cookingTimeMin || dish.calories || dish.servings) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
              {dish.cookingTimeMin && (
                <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)', letterSpacing: '0.04em' }}>
                  {dish.cookingTimeMin} min
                </span>
              )}
              {dish.calories && (
                <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)', letterSpacing: '0.04em' }}>
                  {dish.calories} kcal
                </span>
              )}
              {dish.servings && (
                <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)', letterSpacing: '0.04em' }}>
                  {dish.servings} {lang === 'fr' ? 'pers.' : 'ppl.'}
                </span>
              )}
              {dish.chefName && (
                <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.04em' }}>
                  {dish.chefName}
                </span>
              )}
            </div>
          )}

          <div className={styles.cardBPriceRow}>
            <span className={styles.price}>{formatPrice(dish.price)}</span>
            {dish.isAvailable && (
              <AddControl qty={qty} onAdd={onAdd} onDecrease={onDecrease} lang={lang} />
            )}
          </div>
        </div>
      </motion.div>
      {!dish.isAvailable && <OutOfStockLabel lang={lang} />}
    </div>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function MenuSkeleton() {
  return (
    <div className={styles.page} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, minHeight: '100dvh' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(200,169,110,0.15)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'var(--cream-dim)', letterSpacing: '0.08em' }}>
        Chargement du menu…
      </p>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

interface MenuPageProps {
  params: { restaurantSlug: string; tableToken: string };
}

export default function MenuPage({ params }: MenuPageProps) {
  const localeFromNextIntl = useLocale();
  const router = useRouter();

  const [lang, setLang]           = useState<'fr' | 'en'>(localeFromNextIntl === 'en' ? 'en' : 'fr');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentTime, setCurrentTime]       = useState('');
  const [mounted, setMounted]               = useState(false);

  const [menuData,   setMenuData]   = useState<MenuDTO | null>(null);
  const [loadError,  setLoadError]  = useState<string | null>(null);

  const { items, addItem, updateQuantity, setSession, getTotalItems, getSubtotal } = useCartStore();
  const { setBrand } = useRestaurantStore();
  const themeStyle = useTheme();

  useEffect(() => { setMounted(true); }, []);

  // Fetch menu data from API
  useEffect(() => {
    api
      .get(`/menu/slug/${params.restaurantSlug}`)
      .then(({ data }) => {
        const menu: MenuDTO = data.data;
        setMenuData(menu);
        setBrand({
          name:        menu.restaurant.name,
          logoUrl:     menu.restaurant.logoUrl,
          themePreset: (menu.theme ?? 'DARK_GOLD') as ThemePreset,
        });
      })
      .catch(() => setLoadError('Restaurant introuvable ou indisponible.'));
  }, [params.restaurantSlug, setBrand]);

  // Start table session
  useEffect(() => {
    if (!params.tableToken) return;
    api
      .post('/sessions/start', { tableToken: params.tableToken })
      .then(({ data }) => setSession(data.data.sessionToken, params.restaurantSlug))
      .catch(() => {});
  }, [params.tableToken, params.restaurantSlug, setSession]);

  // Live clock
  useEffect(() => {
    const tick = () =>
      setCurrentTime(
        new Date().toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      );
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;
  const subtotal   = mounted ? getSubtotal()   : 0;

  const getQty = (dishId: string) =>
    mounted ? (items.find((i) => i.menuItemId === dishId)?.quantity ?? 0) : 0;

  const handleAdd = (dish: MenuItemDTO) => {
    const qty = getQty(dish.id);
    if (qty === 0) {
      addItem({ menuItemId: dish.id, nameFr: dish.nameFr, nameEn: dish.nameEn, price: dish.price, quantity: 1, imageUrl: dish.imageUrl ?? undefined });
    } else {
      updateQuantity(dish.id, qty + 1);
    }
  };

  const handleDecrease = (dish: MenuItemDTO) =>
    updateQuantity(dish.id, getQty(dish.id) - 1);

  if (!mounted || (!menuData && !loadError)) return <MenuSkeleton />;

  if (loadError) {
    return (
      <div className={styles.page} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, minHeight: '100dvh', padding: 24 }}>
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 16, color: 'var(--cream)', textAlign: 'center' }}>{loadError}</p>
        <button className={styles.addBtn} onClick={() => router.back()}>← Retour</button>
      </div>
    );
  }

  const restaurant = menuData!.restaurant;
  const apiCategories = menuData!.categories;

  // Build nav categories from API
  const navCategories = [
    { id: 'all', labelFr: 'Tout', labelEn: 'All' },
    ...apiCategories.map((c) => ({ id: c.id, labelFr: c.nameFr, labelEn: c.nameEn })),
  ];

  const sectionsToShow = apiCategories
    .filter((c) => activeCategory === 'all' || c.id === activeCategory)
    .filter((c) => c.items.length > 0)
    .map((cat, i) => ({ ...cat, num: i + 1 }));

  return (
    <div className={styles.page} style={themeStyle}>
      {/* ── HEADER ── */}
      <header className={styles.header}>
        <span className={styles.logo}>
          {restaurant.logoUrl
            ? <img src={restaurant.logoUrl} alt={restaurant.name} style={{ height: 32, objectFit: 'contain' }} />
            : restaurant.name
          }
        </span>
        <div className={styles.headerRight}>
          <div className={styles.langToggle}>
            <button className={`${styles.langBtn} ${lang === 'fr' ? styles.langBtnActive : ''}`} onClick={() => setLang('fr')}>FR</button>
            <span className={styles.langDivider}>|</span>
            <button className={`${styles.langBtn} ${lang === 'en' ? styles.langBtnActive : ''}`} onClick={() => setLang('en')}>EN</button>
          </div>
          <button className={styles.cartBtn} onClick={() => router.push(`/${lang}/cart`)} aria-label={lang === 'fr' ? 'Voir le panier' : 'View cart'}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {totalItems > 0 && <span className={styles.cartCount}>{totalItems}</span>}
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className={styles.hero} aria-label="Restaurant hero">
        <div className={styles.heroGradient} />

        <motion.h1
          className={styles.heroTitle}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          {restaurant.name}
        </motion.h1>

        <motion.div
          className={styles.heroMeta}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.36 }}
        >
          {restaurant.city && <span>{restaurant.city.toUpperCase()}</span>}
          {restaurant.city && <span className={styles.heroMetaDot} />}
          <span>{lang === 'fr' ? 'OUVERT' : 'OPEN'}</span>
        </motion.div>

        {currentTime && (
          <div className={styles.liveTime} aria-live="polite">{currentTime}</div>
        )}
      </section>

      {/* ── CATEGORY NAV ── */}
      <nav className={styles.catNav} aria-label={lang === 'fr' ? 'Catégories du menu' : 'Menu categories'}>
        {navCategories.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.catBtn} ${activeCategory === cat.id ? styles.catBtnActive : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {lang === 'fr' ? cat.labelFr : cat.labelEn}
          </button>
        ))}
      </nav>

      {/* ── MENU ── */}
      <main className={styles.menuMain}>
        <AnimatePresence mode="popLayout">
          {sectionsToShow.map((section) => (
            <motion.section
              key={section.id}
              id={`section-${section.id}`}
              className={styles.menuSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>({section.num})</span>
                <span className={styles.sectionTitle}>
                  {lang === 'fr' ? section.nameFr : section.nameEn}
                </span>
                <div className={styles.sectionRule} />
              </div>

              <div className={styles.cardGrid}>
                {section.items.map((dish, di) => {
                  const variant: 'A' | 'B' = di % 2 === 0 ? 'A' : 'B';
                  const cardProps: CardProps = {
                    dish,
                    lang,
                    qty:        getQty(dish.id),
                    onAdd:      () => handleAdd(dish),
                    onDecrease: () => handleDecrease(dish),
                    index:      di,
                    variant,
                  };
                  return variant === 'A'
                    ? <DishCardA key={dish.id} {...cardProps} />
                    : <DishCardB key={dish.id} {...cardProps} />;
                })}
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </main>

      {/* ── BOTTOM ORDER BAR ── */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            className={styles.orderBar}
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className={styles.orderBarLeft}>
              <span className={styles.orderBarCount}>
                {totalItems}&nbsp;{lang === 'fr' ? (totalItems > 1 ? 'articles' : 'article') : (totalItems > 1 ? 'items' : 'item')}
              </span>
              <span className={styles.orderBarTotal}>{formatPrice(subtotal)}</span>
            </div>
            <button className={styles.orderBarBtn} onClick={() => router.push(`/${lang}/cart`)}>
              {lang === 'fr' ? 'PASSER COMMANDE' : 'ORDER NOW'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

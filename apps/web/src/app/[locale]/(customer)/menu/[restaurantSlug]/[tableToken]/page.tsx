'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import api from '@/lib/api';
import styles from './menu.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Dish {
  id: string;
  category: string;
  nameFr: string;
  nameEn: string;
  descFr: string;
  descEn: string;
  price: number;
  chef: string;
  time: number;
  calories: number;
  allergensFr: string;
  allergensEn: string;
  ingredsFr: string[];
  ingredsEn: string[];
  image: string;
  isPopular: boolean;
  isAvailable: boolean;
  variant: 'A' | 'B';
}

// ─── Static data ──────────────────────────────────────────────────────────────

const RESTAURANT = {
  name:      'Le Baobab',
  taglineFr: 'La saveur authentique du Cameroun',
  taglineEn: 'The authentic taste of Cameroon',
  table:     '07',
};

const CATEGORIES = [
  { id: 'all',       labelFr: 'Tout',      labelEn: 'All' },
  { id: 'entrees',   labelFr: 'Entrées',   labelEn: 'Starters' },
  { id: 'plats',     labelFr: 'Plats',     labelEn: 'Mains' },
  { id: 'poissons',  labelFr: 'Poissons',  labelEn: 'Fish' },
  { id: 'grillades', labelFr: 'Grillades', labelEn: 'Grills' },
  { id: 'desserts',  labelFr: 'Desserts',  labelEn: 'Desserts' },
  { id: 'boissons',  labelFr: 'Boissons',  labelEn: 'Drinks' },
];

const DISHES: Dish[] = [
  // ── ENTRÉES ──
  {
    id: 'dish-1',
    category: 'entrees',
    nameFr: 'Beignets de haricots',
    nameEn: 'Bean Fritters',
    descFr: "Beignets croustillants de haricots blancs, frits à l'huile de palme rouge, assaisonnés de poivre noir et d'oignons frais.",
    descEn: 'Crispy white bean fritters fried in red palm oil, seasoned with black pepper and fresh onions.',
    price: 1500,
    chef: 'Pauline Essomba',
    time: 20,
    calories: 280,
    allergensFr: 'Légumineuses',
    allergensEn: 'Legumes',
    ingredsFr: ['Haricots blancs', 'Oignons', 'Piment', 'Huile de palme', 'Poivre noir'],
    ingredsEn: ['White beans', 'Onions', 'Chili', 'Palm oil', 'Black pepper'],
    image: 'https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=800&q=80',
    isPopular: false,
    isAvailable: true,
    variant: 'B',
  },
  {
    id: 'dish-2',
    category: 'entrees',
    nameFr: 'Koki de haricots vapeur',
    nameEn: 'Steamed Bean Koki',
    descFr: "Gâteau de haricots blancs vapeur enveloppé dans des feuilles de bananier, relevé de palme et de piment. Une spécialité ancestrale.",
    descEn: 'White bean cake steamed in banana leaves, seasoned with palm oil and chili. An ancestral specialty.',
    price: 1800,
    chef: 'Pauline Essomba',
    time: 45,
    calories: 310,
    allergensFr: 'Légumineuses',
    allergensEn: 'Legumes',
    ingredsFr: ['Haricots blancs', 'Huile de palme', 'Piment', 'Feuilles de bananier', 'Sel'],
    ingredsEn: ['White beans', 'Palm oil', 'Chili pepper', 'Banana leaves', 'Salt'],
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
    isPopular: false,
    isAvailable: true,
    variant: 'A',
  },

  // ── PLATS ──
  {
    id: 'dish-3',
    category: 'plats',
    nameFr: 'Ndolé aux crevettes',
    nameEn: 'Ndolé with Shrimp',
    descFr: "Plat emblématique camerounais aux feuilles amères, crevettes fumées et pâte d'arachide, mijoté lentement sur feu doux.",
    descEn: 'Iconic Cameroonian bitter-leaf stew with smoked shrimp and groundnut paste, slow-simmered over a gentle flame.',
    price: 4500,
    chef: 'Jean-Pierre Mballa',
    time: 35,
    calories: 520,
    allergensFr: 'Crustacés, Arachides',
    allergensEn: 'Shellfish, Peanuts',
    ingredsFr: ['Feuilles de ndolé', 'Crevettes fumées', "Pâte d'arachide", 'Oignons', 'Ail', 'Poisson fumé'],
    ingredsEn: ['Ndolé leaves', 'Smoked shrimp', 'Groundnut paste', 'Onions', 'Garlic', 'Smoked fish'],
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
    isPopular: true,
    isAvailable: true,
    variant: 'A',
  },
  {
    id: 'dish-4',
    category: 'plats',
    nameFr: 'Eru et Fufu de maïs',
    nameEn: 'Eru with Corn Fufu',
    descFr: "Légumes-feuilles d'eru finement ciselés, mijotés avec viande fumée et huile de palme. Servi avec fufu de maïs blanc.",
    descEn: 'Finely shredded eru leaves simmered with smoked meat and palm oil. Served with white corn fufu.',
    price: 3800,
    chef: 'Jean-Pierre Mballa',
    time: 50,
    calories: 580,
    allergensFr: 'Aucun',
    allergensEn: 'None',
    ingredsFr: ['Feuilles d\'eru', 'Viande fumée', 'Huile de palme', 'Fufu de maïs', 'Oignons'],
    ingredsEn: ['Eru leaves', 'Smoked meat', 'Palm oil', 'Corn fufu', 'Onions'],
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80',
    isPopular: false,
    isAvailable: true,
    variant: 'B',
  },

  // ── POISSONS ──
  {
    id: 'dish-5',
    category: 'poissons',
    nameFr: 'Tilapia braisé',
    nameEn: 'Grilled Tilapia',
    descFr: "Tilapia entier mariné aux épices locales, braisé lentement au charbon de bois. Servi avec attiéké et sauce tomate fraîche.",
    descEn: 'Whole tilapia marinated in local spices, slowly charcoal-grilled. Served with cassava couscous and fresh tomato sauce.',
    price: 3800,
    chef: 'Samuel Nkengue',
    time: 30,
    calories: 420,
    allergensFr: 'Poisson',
    allergensEn: 'Fish',
    ingredsFr: ['Tilapia entier', 'Citron vert', 'Piment rouge', 'Gingembre', 'Attiéké', 'Tomates'],
    ingredsEn: ['Whole tilapia', 'Lime', 'Red chili', 'Ginger', 'Cassava couscous', 'Tomatoes'],
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
    isPopular: false,
    isAvailable: true,
    variant: 'A',
  },
  {
    id: 'dish-6',
    category: 'poissons',
    nameFr: 'Saumon plancha, sauce verte',
    nameEn: 'Plancha Salmon, Green Sauce',
    descFr: "Filet de saumon Atlantique cuit à la plancha, nappé de sauce basilic-gingembre, servi sur lit de légumes de saison.",
    descEn: 'Atlantic salmon fillet cooked on the plancha, drizzled with basil-ginger sauce, on a bed of seasonal vegetables.',
    price: 6500,
    chef: 'Samuel Nkengue',
    time: 20,
    calories: 380,
    allergensFr: 'Poisson',
    allergensEn: 'Fish',
    ingredsFr: ['Saumon Atlantique', 'Basilic', 'Gingembre', 'Citron', 'Légumes de saison', 'Huile d\'olive'],
    ingredsEn: ['Atlantic salmon', 'Basil', 'Ginger', 'Lemon', 'Seasonal vegetables', 'Olive oil'],
    image: 'https://images.unsplash.com/photo-1485921325833-c519793a2afa?w=800&q=80',
    isPopular: true,
    isAvailable: true,
    variant: 'B',
  },

  // ── GRILLADES ──
  {
    id: 'dish-7',
    category: 'grillades',
    nameFr: 'Poulet DG',
    nameEn: 'DG Chicken',
    descFr: 'Poulet fermier sauté aux légumes croquants, plantains mûrs fondants et épices camerounaises. Le plat de prestige du restaurant.',
    descEn: 'Free-range chicken sautéed with crisp vegetables, meltingly ripe plantains and Cameroonian spice blend. Our prestige dish.',
    price: 5500,
    chef: 'Marie-Claire Ateba',
    time: 40,
    calories: 680,
    allergensFr: 'Aucun',
    allergensEn: 'None',
    ingredsFr: ['Poulet fermier', 'Plantains mûrs', 'Carottes', 'Haricots verts', 'Oignons', 'Épices DG'],
    ingredsEn: ['Free-range chicken', 'Ripe plantains', 'Carrots', 'Green beans', 'Onions', 'DG spice blend'],
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80',
    isPopular: true,
    isAvailable: true,
    variant: 'B',
  },
  {
    id: 'dish-8',
    category: 'grillades',
    nameFr: 'Côtes de porc braisées',
    nameEn: 'Braised Pork Ribs',
    descFr: "Côtes de porc marinées 12h dans une sauce épicée maison, braisées lentement sur charbon de bois jusqu'à parfaite tendreté.",
    descEn: 'Pork ribs marinated 12h in house spiced sauce, slowly braised over charcoal to perfect tenderness.',
    price: 4800,
    chef: 'Marie-Claire Ateba',
    time: 55,
    calories: 720,
    allergensFr: 'Aucun',
    allergensEn: 'None',
    ingredsFr: ['Côtes de porc', 'Ail', 'Gingembre', 'Piment', 'Oignons', 'Épices du chef'],
    ingredsEn: ['Pork ribs', 'Garlic', 'Ginger', 'Chili', 'Onions', 'Chef\'s spices'],
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&q=80',
    isPopular: false,
    isAvailable: true,
    variant: 'A',
  },

  // ── DESSERTS ──
  {
    id: 'dish-9',
    category: 'desserts',
    nameFr: 'Plantains mûrs caramélisés',
    nameEn: 'Caramelised Sweet Plantains',
    descFr: 'Bananes plantains bien mûres, caramélisées à la poêle avec du sucre de canne et du beurre de karité. Douceur africaine.',
    descEn: 'Perfectly ripe plantains pan-caramelised with cane sugar and shea butter. A classic African sweet treat.',
    price: 1200,
    chef: 'Pauline Essomba',
    time: 15,
    calories: 220,
    allergensFr: 'Aucun',
    allergensEn: 'None',
    ingredsFr: ['Plantains très mûrs', 'Sucre de canne', 'Beurre de karité', 'Cannelle', 'Vanille'],
    ingredsEn: ['Ripe plantains', 'Cane sugar', 'Shea butter', 'Cinnamon', 'Vanilla'],
    image: 'https://images.unsplash.com/photo-1534701198139-f8f37e56a7c4?w=800&q=80',
    isPopular: false,
    isAvailable: true,
    variant: 'A',
  },
  {
    id: 'dish-10',
    category: 'desserts',
    nameFr: 'Bouillie de mil au lait de coco',
    nameEn: 'Millet Porridge with Coconut Milk',
    descFr: 'Bouillie de mil crémeuse au lait de coco, sucrée à la canne, parsemée de noix grillées et de zestes de citron vert.',
    descEn: 'Creamy millet porridge with coconut milk, cane sugar, topped with toasted nuts and lime zest.',
    price: 1400,
    chef: 'Pauline Essomba',
    time: 25,
    calories: 290,
    allergensFr: 'Noix, Lait de coco',
    allergensEn: 'Tree nuts, Coconut',
    ingredsFr: ['Farine de mil', 'Lait de coco', 'Sucre de canne', 'Noix grillées', 'Citron vert'],
    ingredsEn: ['Millet flour', 'Coconut milk', 'Cane sugar', 'Toasted nuts', 'Lime'],
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80',
    isPopular: false,
    isAvailable: true,
    variant: 'B',
  },

  // ── BOISSONS ──
  {
    id: 'dish-11',
    category: 'boissons',
    nameFr: 'Jus de bissap glacé',
    nameEn: 'Iced Hibiscus Juice',
    descFr: "Infusion glacée de fleurs de bissap séchées, gingembre frais et menthe. Riche en antioxydants, naturellement acidulé.",
    descEn: 'Chilled infusion of dried hibiscus flowers, fresh ginger and mint. Rich in antioxidants, naturally tangy.',
    price: 1000,
    chef: 'Marie-Claire Ateba',
    time: 5,
    calories: 45,
    allergensFr: 'Aucun',
    allergensEn: 'None',
    ingredsFr: ['Fleurs de bissap', 'Gingembre frais', 'Menthe', 'Sucre de canne', 'Eau filtrée'],
    ingredsEn: ['Hibiscus flowers', 'Fresh ginger', 'Mint', 'Cane sugar', 'Filtered water'],
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80',
    isPopular: true,
    isAvailable: false,
    variant: 'B',
  },
  {
    id: 'dish-12',
    category: 'boissons',
    nameFr: 'Gingembre pressé maison',
    nameEn: 'House-Pressed Ginger Juice',
    descFr: "Jus de gingembre frais pressé, miel d'acacia, citron vert et curcuma. Tonique et rafraîchissant, servi sur glace pilée.",
    descEn: 'Freshly pressed ginger juice with acacia honey, lime and turmeric. Tonic and refreshing, served over crushed ice.',
    price: 1200,
    chef: 'Marie-Claire Ateba',
    time: 5,
    calories: 60,
    allergensFr: 'Aucun',
    allergensEn: 'None',
    ingredsFr: ['Gingembre frais', "Miel d'acacia", 'Citron vert', 'Curcuma', 'Glace pilée'],
    ingredsEn: ['Fresh ginger', 'Acacia honey', 'Lime', 'Turmeric', 'Crushed ice'],
    image: 'https://images.unsplash.com/photo-1570145820259-b5f388e5cc59?w=800&q=80',
    isPopular: false,
    isAvailable: true,
    variant: 'A',
  },
];

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
  dish: Dish;
  lang: 'fr' | 'en';
  qty: number;
  onAdd: () => void;
  onDecrease: () => void;
  index: number;
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
  const name     = lang === 'fr' ? dish.nameFr     : dish.nameEn;
  const desc     = lang === 'fr' ? dish.descFr     : dish.descEn;
  const ingreds  = lang === 'fr' ? dish.ingredsFr  : dish.ingredsEn;
  const allergens = lang === 'fr' ? dish.allergensFr : dish.allergensEn;

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
          <img src={dish.image} alt={name} loading="lazy" />
          <div className={styles.imageOverlay} />
        </div>

        <div className={styles.cardContent}>
          <span className={styles.dishNumberBg} aria-hidden>
            {String(index + 1).padStart(2, '0')}
          </span>

          <h3 className={styles.dishName}>{name}</h3>
          <p className={styles.dishDesc}>{desc}</p>

          <div className={styles.cardDivider} />

          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Chef</span>
              <span className={styles.metaValue}>{dish.chef}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>{lang === 'fr' ? 'Durée' : 'Time'}</span>
              <span className={styles.metaValue}>{dish.time} min</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Calories</span>
              <span className={styles.metaValue}>{dish.calories} kcal</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>{lang === 'fr' ? 'Allergènes' : 'Allergens'}</span>
              <span className={styles.metaValue}>{allergens}</span>
            </div>
          </div>

          <div className={styles.ingredientsWrapper}>
            <span className={styles.ingredientsLabel}>
              {lang === 'fr' ? 'Ingrédients' : 'Ingredients'}
            </span>
            <div className={styles.ingredientsChips}>
              {ingreds.map((ing) => (
                <span key={ing} className={styles.chip}>{ing}</span>
              ))}
            </div>
          </div>

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
  const name    = lang === 'fr' ? dish.nameFr    : dish.nameEn;
  const desc    = lang === 'fr' ? dish.descFr    : dish.descEn;
  const ingreds = lang === 'fr' ? dish.ingredsFr : dish.ingredsEn;

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
          <img src={dish.image} alt={name} loading="lazy" />
        </div>
        <div className={styles.cardBOverlay} />

        {dish.isPopular && (
          <div className={styles.popularBadge}>
            {lang === 'fr' ? 'Populaire' : 'Popular'}
          </div>
        )}

        <div className={styles.cardBContent}>
          <h3 className={styles.dishName}>{name}</h3>
          <p className={`${styles.dishDesc} ${styles.dishDescCompact}`}>{desc}</p>

          <div className={styles.ingredientsChips}>
            {ingreds.slice(0, 4).map((ing) => (
              <span key={ing} className={styles.chip}>{ing}</span>
            ))}
          </div>

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

  const { items, addItem, updateQuantity, setSession, getTotalItems, getSubtotal } = useCartStore();

  useEffect(() => { setMounted(true); }, []);

  // Start table session
  useEffect(() => {
    if (!params.tableToken) return;
    api
      .post('/sessions/start', { tableToken: params.tableToken })
      .then(({ data }) => setSession(data.data.sessionToken, params.restaurantSlug))
      .catch(() => {});
  }, [params.tableToken, params.restaurantSlug, setSession]);

  // Live clock — updates every second
  useEffect(() => {
    const tick = () =>
      setCurrentTime(
        new Date().toLocaleTimeString('fr-CM', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  // Gate Zustand-persisted (localStorage) values behind mount to prevent
  // server/client hydration mismatch (server always has empty cart).
  const totalItems = mounted ? getTotalItems() : 0;
  const subtotal   = mounted ? getSubtotal()   : 0;

  const getQty = (dishId: string) =>
    items.find((i) => i.menuItemId === dishId)?.quantity ?? 0;

  const handleAdd = (dish: Dish) => {
    const qty = getQty(dish.id);
    if (qty === 0) {
      addItem({ menuItemId: dish.id, nameFr: dish.nameFr, nameEn: dish.nameEn, price: dish.price, quantity: 1, imageUrl: dish.image });
    } else {
      updateQuantity(dish.id, qty + 1);
    }
  };

  const handleDecrease = (dish: Dish) =>
    updateQuantity(dish.id, getQty(dish.id) - 1);

  const sectionNumbers = CATEGORIES
    .filter((c) => c.id !== 'all' && DISHES.some((d) => d.category === c.id))
    .map((c, i) => ({ id: c.id, num: i + 1 }));

  const sectionsToShow = CATEGORIES
    .filter((c) => c.id !== 'all')
    .filter((c) => activeCategory === 'all' || c.id === activeCategory)
    .map((cat) => ({
      ...cat,
      dishes: DISHES.filter((d) => d.category === cat.id),
      num: sectionNumbers.find((s) => s.id === cat.id)?.num ?? 1,
    }))
    .filter((s) => s.dishes.length > 0);

  return (
    <div className={styles.page}>
      {/* ── HEADER ── */}
      <header className={styles.header}>
        <span className={styles.logo}>{RESTAURANT.name}</span>
        <span className={styles.tableBadge}>
          {lang === 'fr' ? 'TABLE' : 'TABLE'} {RESTAURANT.table}
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
          {RESTAURANT.name}
        </motion.h1>

        <motion.p
          className={styles.heroTagline}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.18, ease: 'easeOut' }}
        >
          {lang === 'fr' ? RESTAURANT.taglineFr : RESTAURANT.taglineEn}
        </motion.p>

        <motion.div
          className={styles.heroMeta}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.36 }}
        >
          <span>DOUALA</span>
          <span className={styles.heroMetaDot} />
          <span>{lang === 'fr' ? 'TABLE' : 'TABLE'} {RESTAURANT.table}</span>
          <span className={styles.heroMetaDot} />
          <span>{lang === 'fr' ? 'OUVERT' : 'OPEN'}</span>
        </motion.div>

        {currentTime && (
          <div className={styles.liveTime} aria-live="polite">{currentTime}</div>
        )}
      </section>

      {/* ── CATEGORY NAV ── */}
      <nav className={styles.catNav} aria-label={lang === 'fr' ? 'Catégories du menu' : 'Menu categories'}>
        {CATEGORIES.map((cat) => (
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
                  {lang === 'fr' ? section.labelFr : section.labelEn}
                </span>
                <div className={styles.sectionRule} />
              </div>

              <div className={styles.cardGrid}>
                {section.dishes.map((dish, di) => {
                  const cardProps: CardProps = {
                    dish,
                    lang,
                    qty:        getQty(dish.id),
                    onAdd:      () => handleAdd(dish),
                    onDecrease: () => handleDecrease(dish),
                    index:      di,
                  };
                  return dish.variant === 'A'
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

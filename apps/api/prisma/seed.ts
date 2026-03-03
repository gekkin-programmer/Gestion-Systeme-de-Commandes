import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ─── Super Admin ──────────────────────────────────────────────────────────

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL ?? 'superadmin@restaurant.cm';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD ?? 'SuperAdmin2024!';

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      passwordHash: await bcrypt.hash(superAdminPassword, 12),
      role: Role.SUPER_ADMIN,
    },
  });
  console.log(`✅ Super Admin: ${superAdmin.email}`);

  // ─── Restaurant ───────────────────────────────────────────────────────────

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'restaurant-le-baobab' },
    update: {},
    create: {
      name: 'Restaurant Le Baobab',
      slug: 'restaurant-le-baobab',
      address: 'Rue de la Joie, Akwa',
      city: 'Douala',
      currency: 'XAF',
      isActive: true,
      settings: {
        create: {
          mtnMoneyNumber: '650000001',
          orangeMoneyNumber: '690000001',
          enableMtnMoney: true,
          enableOrangeMoney: true,
          enableCash: true,
          taxRate: 0.1925,
        },
      },
    },
  });
  console.log(`✅ Restaurant: ${restaurant.name}`);

  // ─── Admin & Staff Accounts ───────────────────────────────────────────────

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lebaobab.cm' },
    update: {},
    create: {
      email: 'admin@lebaobab.cm',
      passwordHash: await bcrypt.hash('Admin2024!', 12),
      role: Role.ADMIN,
      restaurantId: restaurant.id,
    },
  });
  console.log(`✅ Admin: ${adminUser.email}`);

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@lebaobab.cm' },
    update: {},
    create: {
      email: 'staff@lebaobab.cm',
      passwordHash: await bcrypt.hash('Staff2024!', 12),
      role: Role.STAFF,
      restaurantId: restaurant.id,
    },
  });
  console.log(`✅ Staff: ${staffUser.email}`);

  // ─── Categories ──────────────────────────────────────────────────────────

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-entrees-baobab' },
      update: {},
      create: {
        id: 'cat-entrees-baobab',
        restaurantId: restaurant.id,
        nameFr: 'Entrées',
        nameEn: 'Starters',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-plats-baobab' },
      update: {},
      create: {
        id: 'cat-plats-baobab',
        restaurantId: restaurant.id,
        nameFr: 'Plats Principaux',
        nameEn: 'Main Courses',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-boissons-baobab' },
      update: {},
      create: {
        id: 'cat-boissons-baobab',
        restaurantId: restaurant.id,
        nameFr: 'Boissons',
        nameEn: 'Drinks',
        sortOrder: 3,
      },
    }),
  ]);
  console.log(`✅ ${categories.length} categories created`);

  const [entrées, plats, boissons] = categories;

  // ─── Menu Items ───────────────────────────────────────────────────────────

  const menuItems = await Promise.all([
    // Entrées
    prisma.menuItem.upsert({
      where: { id: 'item-salade-baobab' },
      update: {},
      create: {
        id: 'item-salade-baobab',
        categoryId: entrées.id,
        restaurantId: restaurant.id,
        nameFr: 'Salade Tropicale',
        nameEn: 'Tropical Salad',
        descriptionFr: 'Salade fraîche avec mangue, avocat et crevettes',
        descriptionEn: 'Fresh salad with mango, avocado and shrimp',
        price: 2500,
        isAvailable: true,
        isPopular: false,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'item-accras-baobab' },
      update: {},
      create: {
        id: 'item-accras-baobab',
        categoryId: entrées.id,
        restaurantId: restaurant.id,
        nameFr: 'Accras de Morue',
        nameEn: 'Cod Fritters',
        descriptionFr: 'Beignets de morue croustillants, sauce pimentée',
        descriptionEn: 'Crispy cod fritters with spicy sauce',
        price: 3000,
        isAvailable: true,
        isPopular: true,
      },
    }),
    // Plats
    prisma.menuItem.upsert({
      where: { id: 'item-ndole-baobab' },
      update: {},
      create: {
        id: 'item-ndole-baobab',
        categoryId: plats.id,
        restaurantId: restaurant.id,
        nameFr: 'Ndolé au Bœuf',
        nameEn: 'Ndolé with Beef',
        descriptionFr: 'Plat traditionnel camerounais aux feuilles de ndolé, bœuf et crevettes',
        descriptionEn: 'Traditional Cameroonian dish with ndolé leaves, beef and shrimp',
        price: 5500,
        isAvailable: true,
        isPopular: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'item-poulet-baobab' },
      update: {},
      create: {
        id: 'item-poulet-baobab',
        categoryId: plats.id,
        restaurantId: restaurant.id,
        nameFr: 'Poulet DG',
        nameEn: 'DG Chicken',
        descriptionFr: 'Poulet braisé au four, plantains frits et légumes',
        descriptionEn: 'Oven-braised chicken, fried plantains and vegetables',
        price: 7000,
        isAvailable: true,
        isPopular: true,
      },
    }),
    // Boissons
    prisma.menuItem.upsert({
      where: { id: 'item-jus-baobab' },
      update: {},
      create: {
        id: 'item-jus-baobab',
        categoryId: boissons.id,
        restaurantId: restaurant.id,
        nameFr: 'Jus de Bissap',
        nameEn: 'Bissap Juice',
        descriptionFr: 'Jus d\'hibiscus frais et sucré',
        descriptionEn: 'Fresh and sweet hibiscus juice',
        price: 1000,
        isAvailable: true,
        isPopular: false,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'item-33export-baobab' },
      update: {},
      create: {
        id: 'item-33export-baobab',
        categoryId: boissons.id,
        restaurantId: restaurant.id,
        nameFr: '33 Export',
        nameEn: '33 Export Beer',
        descriptionFr: 'Bière camerounaise bien fraîche 65cl',
        descriptionEn: 'Fresh Cameroonian beer 65cl',
        price: 1500,
        isAvailable: true,
        isPopular: true,
      },
    }),
  ]);
  console.log(`✅ ${menuItems.length} menu items created`);

  // ─── Tables ───────────────────────────────────────────────────────────────

  const tableData = [
    { number: 1, label: 'Table 1 - Terrasse', capacity: 4 },
    { number: 2, label: 'Table 2 - Terrasse', capacity: 4 },
    { number: 3, label: 'Table 3 - Intérieur', capacity: 6 },
    { number: 4, label: 'Table 4 - Salon VIP', capacity: 8 },
  ];

  for (const t of tableData) {
    await prisma.table.upsert({
      where: {
        restaurantId_number: {
          restaurantId: restaurant.id,
          number: t.number,
        },
      },
      update: {},
      create: {
        restaurantId: restaurant.id,
        ...t,
        qrToken: uuidv4(),
      },
    });
  }
  console.log(`✅ ${tableData.length} tables created`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Credentials:');
  console.log(`   Super Admin: ${superAdminEmail} / ${superAdminPassword}`);
  console.log('   Admin:       admin@lebaobab.cm / Admin2024!');
  console.log('   Staff:       staff@lebaobab.cm / Staff2024!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

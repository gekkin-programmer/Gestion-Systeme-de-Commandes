import { PrismaClient, Role, ServiceType, RoomType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function main() {
  console.log('🌱 Starting hotel seed...');

  // ─── Super Admin ──────────────────────────────────────────────────────────

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL ?? 'superadmin@hotel.cm';
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

  // ─── Hotel ────────────────────────────────────────────────────────────────

  const hotel = await prisma.hotel.upsert({
    where: { slug: 'hotel-le-baobab' },
    update: {},
    create: {
      name: 'Hôtel Le Baobab',
      slug: 'hotel-le-baobab',
      address: 'Boulevard de la Liberté, Akwa',
      city: 'Douala',
      currency: 'XAF',
      isActive: true,
      settings: {
        create: {
          mtnMoneyNumber: '650000001',
          orangeMoneyNumber: '690000001',
          enableMtnMoney: true,
          enableOrangeMoney: true,
          enableHotelBill: true,
          taxRate: 0.1925,
        },
      },
    },
  });
  console.log(`✅ Hotel: ${hotel.name}`);

  // ─── Admin & Staff Accounts ───────────────────────────────────────────────

  await prisma.user.upsert({
    where: { email: 'admin@lebaobab.cm' },
    update: {},
    create: {
      email: 'admin@lebaobab.cm',
      passwordHash: await bcrypt.hash('Admin2024!', 12),
      role: Role.ADMIN,
      hotelId: hotel.id,
    },
  });
  console.log(`✅ Admin: admin@lebaobab.cm`);

  const staffAccounts = [
    { email: 'staff@lebaobab.cm', dept: null as ServiceType | null },
    { email: 'roomservice@lebaobab.cm', dept: ServiceType.ROOM_SERVICE },
    { email: 'housekeeping@lebaobab.cm', dept: ServiceType.HOUSEKEEPING },
    { email: 'concierge@lebaobab.cm', dept: ServiceType.CONCIERGE },
    { email: 'spa@lebaobab.cm', dept: ServiceType.SPA },
  ];

  for (const s of staffAccounts) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash: await bcrypt.hash('Staff2024!', 12),
        role: Role.STAFF,
        hotelId: hotel.id,
        departmentType: s.dept,
      },
    });
    console.log(`✅ Staff: ${s.email}`);
  }

  // ─── Service Departments ──────────────────────────────────────────────────

  const departments = [
    { id: 'dept-roomsvc-baobab', type: ServiceType.ROOM_SERVICE, nameFr: 'Room Service', nameEn: 'Room Service', sortOrder: 1 },
    { id: 'dept-housekeeping-baobab', type: ServiceType.HOUSEKEEPING, nameFr: 'Ménage', nameEn: 'Housekeeping', sortOrder: 2 },
    { id: 'dept-concierge-baobab', type: ServiceType.CONCIERGE, nameFr: 'Conciergerie', nameEn: 'Concierge', sortOrder: 3 },
    { id: 'dept-spa-baobab', type: ServiceType.SPA, nameFr: 'Spa & Bien-être', nameEn: 'Spa & Wellness', sortOrder: 4 },
  ];

  for (const d of departments) {
    await prisma.serviceDepartment.upsert({
      where: { id: d.id },
      update: {},
      create: { ...d, hotelId: hotel.id },
    });
  }
  console.log(`✅ ${departments.length} departments created`);

  // ─── Service Items ────────────────────────────────────────────────────────

  const serviceItems = [
    // Room Service
    { id: 'item-dejeuner-baobab', deptId: 'dept-roomsvc-baobab', nameFr: 'Petit-déjeuner continental', nameEn: 'Continental Breakfast', price: 5000, descFr: 'Viennoiseries, jus frais, café ou thé', descEn: 'Pastries, fresh juice, coffee or tea' },
    { id: 'item-diner-baobab', deptId: 'dept-roomsvc-baobab', nameFr: 'Dîner en chambre', nameEn: 'In-room Dinner', price: 12000, descFr: 'Plat du jour + boisson', descEn: 'Daily special + drink' },
    { id: 'item-snack-baobab', deptId: 'dept-roomsvc-baobab', nameFr: 'Plateau de fruits', nameEn: 'Fruit Platter', price: 3000, descFr: 'Fruits tropicaux de saison', descEn: 'Seasonal tropical fruits' },
    { id: 'item-vin-baobab', deptId: 'dept-roomsvc-baobab', nameFr: 'Bouteille de vin', nameEn: 'Bottle of Wine', price: 15000, descFr: 'Sélection du sommelier', descEn: 'Sommelier selection' },
    { id: 'item-minbar-baobab', deptId: 'dept-roomsvc-baobab', nameFr: 'Réassort mini-bar', nameEn: 'Mini-bar Restock', price: 2000, descFr: 'Eau, sodas, snacks', descEn: 'Water, sodas, snacks' },
    // Housekeeping
    { id: 'item-menage-baobab', deptId: 'dept-housekeeping-baobab', nameFr: 'Nettoyage de chambre', nameEn: 'Room Cleaning', price: null as number | null, descFr: 'Nettoyage complet avec changement de linge', descEn: 'Full cleaning with linen change' },
    { id: 'item-serviettes-baobab', deptId: 'dept-housekeeping-baobab', nameFr: 'Serviettes supplémentaires', nameEn: 'Extra Towels', price: null, descFr: 'Set de 2 serviettes', descEn: 'Set of 2 towels' },
    { id: 'item-oreillers-baobab', deptId: 'dept-housekeeping-baobab', nameFr: 'Oreillers supplémentaires', nameEn: 'Extra Pillows', price: null, descFr: 'Oreillers moelleux', descEn: 'Soft pillows' },
    { id: 'item-lessive-baobab', deptId: 'dept-housekeeping-baobab', nameFr: 'Service blanchisserie', nameEn: 'Laundry Service', price: 3500, descFr: 'Par pièce, retour sous 24h', descEn: 'Per item, 24h return' },
    { id: 'item-repassage-baobab', deptId: 'dept-housekeeping-baobab', nameFr: 'Repassage', nameEn: 'Ironing Service', price: 2000, descFr: 'Par pièce', descEn: 'Per item' },
    // Concierge
    { id: 'item-taxi-baobab', deptId: 'dept-concierge-baobab', nameFr: 'Réservation taxi', nameEn: 'Taxi Booking', price: null, descFr: "Taxi vers l'aéroport ou en ville", descEn: 'Taxi to airport or city' },
    { id: 'item-resto-baobab', deptId: 'dept-concierge-baobab', nameFr: 'Réservation restaurant', nameEn: 'Restaurant Booking', price: null, descFr: 'Sélection des meilleurs restaurants', descEn: 'Best restaurant selection' },
    { id: 'item-visite-baobab', deptId: 'dept-concierge-baobab', nameFr: 'Visite guidée', nameEn: 'Guided Tour', price: 25000, descFr: 'Découverte de Douala avec guide', descEn: 'Douala city tour with guide' },
    { id: 'item-courier-baobab', deptId: 'dept-concierge-baobab', nameFr: 'Service coursier', nameEn: 'Courier Service', price: 2000, descFr: 'Livraison en ville', descEn: 'City delivery' },
    { id: 'item-fleurs-baobab', deptId: 'dept-concierge-baobab', nameFr: 'Arrangement floral', nameEn: 'Flower Arrangement', price: 8000, descFr: 'Fleurs fraîches pour votre chambre', descEn: 'Fresh flowers for your room' },
    // Spa
    { id: 'item-massage-baobab', deptId: 'dept-spa-baobab', nameFr: 'Massage relaxant 60min', nameEn: 'Relaxing Massage 60min', price: 20000, descFr: 'Massage corps entier', descEn: 'Full body massage' },
    { id: 'item-soin-baobab', deptId: 'dept-spa-baobab', nameFr: 'Soin du visage', nameEn: 'Facial Treatment', price: 15000, descFr: 'Soin hydratant et revitalisant', descEn: 'Hydrating and revitalizing treatment' },
    { id: 'item-manicure-baobab', deptId: 'dept-spa-baobab', nameFr: 'Manucure & Pédicure', nameEn: 'Manicure & Pedicure', price: 12000, descFr: 'Soin complet des mains et pieds', descEn: 'Full hands and feet care' },
    { id: 'item-hammam-baobab', deptId: 'dept-spa-baobab', nameFr: 'Hammam 45min', nameEn: 'Hammam 45min', price: 10000, descFr: 'Bain de vapeur traditionnel', descEn: 'Traditional steam bath' },
    { id: 'item-jacuzzi-baobab', deptId: 'dept-spa-baobab', nameFr: 'Jacuzzi privatif', nameEn: 'Private Jacuzzi', price: 18000, descFr: 'Jacuzzi privatif avec champagne', descEn: 'Private jacuzzi with champagne' },
  ];

  for (const item of serviceItems) {
    await prisma.serviceItem.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        departmentId: item.deptId,
        hotelId: hotel.id,
        nameFr: item.nameFr,
        nameEn: item.nameEn,
        descriptionFr: item.descFr,
        descriptionEn: item.descEn,
        price: item.price,
        isAvailable: true,
      },
    });
  }
  console.log(`✅ ${serviceItems.length} service items created`);

  // ─── Rooms (10 rooms, 3 floors) ───────────────────────────────────────────

  const roomData = [
    { id: 'room-101-baobab', roomNumber: 101, floor: 1, type: RoomType.SINGLE },
    { id: 'room-102-baobab', roomNumber: 102, floor: 1, type: RoomType.DOUBLE },
    { id: 'room-103-baobab', roomNumber: 103, floor: 1, type: RoomType.DOUBLE },
    { id: 'room-104-baobab', roomNumber: 104, floor: 1, type: RoomType.SUITE },
    { id: 'room-201-baobab', roomNumber: 201, floor: 2, type: RoomType.DOUBLE },
    { id: 'room-202-baobab', roomNumber: 202, floor: 2, type: RoomType.DOUBLE },
    { id: 'room-203-baobab', roomNumber: 203, floor: 2, type: RoomType.DELUXE },
    { id: 'room-204-baobab', roomNumber: 204, floor: 2, type: RoomType.SUITE },
    { id: 'room-301-baobab', roomNumber: 301, floor: 3, type: RoomType.DELUXE },
    { id: 'room-302-baobab', roomNumber: 302, floor: 3, type: RoomType.PENTHOUSE },
  ];

  for (const r of roomData) {
    const existing = await prisma.room.findUnique({ where: { id: r.id } });
    if (!existing) {
      let roomCode = generateRoomCode();
      while (await prisma.room.findUnique({ where: { roomCode } })) {
        roomCode = generateRoomCode();
      }
      await prisma.room.create({
        data: {
          id: r.id,
          hotelId: hotel.id,
          roomNumber: r.roomNumber,
          floor: r.floor,
          type: r.type,
          roomCode,
        },
      });
    }
  }
  console.log(`✅ ${roomData.length} rooms created`);

  // Print room codes for testing
  const rooms = await prisma.room.findMany({
    where: { hotelId: hotel.id },
    orderBy: { roomNumber: 'asc' },
    select: { roomNumber: true, roomCode: true, type: true },
  });
  console.log('\n🏨 Room codes:');
  for (const r of rooms) {
    console.log(`   ${r.roomNumber} (${r.type}): ${r.roomCode}`);
  }

  console.log('\n🎉 Hotel seed completed!');
  console.log('\n📋 Credentials:');
  console.log(`   Super Admin:  ${superAdminEmail} / ${superAdminPassword}`);
  console.log('   Admin:        admin@lebaobab.cm / Admin2024!');
  console.log('   Staff (all):  staff@lebaobab.cm / Staff2024!');
  console.log('   Room Service: roomservice@lebaobab.cm / Staff2024!');
  console.log('   Housekeeping: housekeeping@lebaobab.cm / Staff2024!');
  console.log('   Concierge:    concierge@lebaobab.cm / Staff2024!');
  console.log('   Spa:          spa@lebaobab.cm / Staff2024!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

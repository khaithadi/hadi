import { PrismaClient, Role, PropertyType, PropertyStatus, BookingStatus, BookingMode } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { WILAYAS, AMENITIES } from '../src/lib/constants';

const prisma = new PrismaClient();

function ref(n: number) {
  return `NZ-${String(n).padStart(6, '0')}`;
}

async function main() {
  console.log('Seeding Nuzul…');

  // --- Wilayas ---
  for (const w of WILAYAS) {
    await prisma.wilaya.upsert({
      where: { id: w.id },
      update: { nameAr: w.nameAr, nameFr: w.nameFr, nameEn: w.nameEn, slug: w.slug },
      create: w,
    });
  }
  console.log(`  wilayas: ${WILAYAS.length}`);

  // --- Amenities ---
  for (const a of AMENITIES) {
    await prisma.amenity.upsert({ where: { key: a.key }, update: a, create: a });
  }
  console.log(`  amenities: ${AMENITIES.length}`);

  // --- Commission config ---
  await prisma.commissionConfig.upsert({
    where: { scope: 'global' },
    update: {},
    create: { scope: 'global', commissionRate: 0.12, serviceFeeRate: 0.05, depositRate: 0.2 },
  });

  // --- Users ---
  const pwd = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nuzul.dz' },
    update: {},
    create: {
      role: Role.admin, fullName: 'Nuzul Admin', email: 'admin@nuzul.dz',
      phone: '+213700000001', passwordHash: pwd, phoneVerified: true, emailVerified: true, locale: 'ar',
    },
  });
  const host = await prisma.user.upsert({
    where: { email: 'host@nuzul.dz' },
    update: {},
    create: {
      role: Role.host, fullName: 'Yacine Hôte', email: 'host@nuzul.dz',
      phone: '+213700000002', passwordHash: pwd, phoneVerified: true, locale: 'fr',
      hostProfile: { create: { bio: 'Hôte vérifié à Alger et Tipaza.', isSuperhost: true, responseRate: 98, payoutMethod: 'baridimob' } },
    },
  });
  const guest = await prisma.user.upsert({
    where: { email: 'guest@nuzul.dz' },
    update: {},
    create: {
      role: Role.guest, fullName: 'Amine Voyageur', email: 'guest@nuzul.dz',
      phone: '+213700000003', passwordHash: pwd, phoneVerified: true, locale: 'ar',
    },
  });
  console.log('  users: admin/host/guest (password: password123)');

  const amenityRows = await prisma.amenity.findMany();
  const byKey = (k: string) => amenityRows.find((a) => a.key === k)!.id;

  // --- Properties ---
  const seedProps = [
    {
      title: 'شقة F3 مفروشة قرب البحر - الجزائر العاصمة',
      type: PropertyType.apartment, wilayaId: 16, capacity: 5, rooms: 3, beds: 3, bathrooms: 1,
      pricePerNight: 9900, cleaningFee: 1500, securityDeposit: 10000, ratingAvg: 4.7, reviewsCount: 12,
      amenities: ['wifi', 'ac', 'kitchen', 'tv', 'sea_view', 'family_friendly'], featured: true,
      img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
    },
    {
      title: 'Villa avec piscine - Tipaza bord de mer',
      type: PropertyType.villa, wilayaId: 42, capacity: 10, rooms: 5, beds: 6, bathrooms: 3,
      pricePerNight: 28000, cleaningFee: 4000, securityDeposit: 30000, ratingAvg: 4.9, reviewsCount: 23,
      amenities: ['wifi', 'ac', 'pool', 'parking', 'garden', 'sea_view', 'generator'], featured: true,
      img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
    },
    {
      title: 'Studio cosy centre-ville - Oran',
      type: PropertyType.studio, wilayaId: 31, capacity: 2, rooms: 1, beds: 1, bathrooms: 1,
      pricePerNight: 6500, cleaningFee: 800, securityDeposit: 5000, ratingAvg: 4.5, reviewsCount: 8,
      amenities: ['wifi', 'ac', 'kitchen', 'tv', 'elevator'], featured: false,
      img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    },
    {
      title: 'منزل عائلي بإطلالة جبلية - تيزي وزو',
      type: PropertyType.house, wilayaId: 15, capacity: 8, rooms: 4, beds: 5, bathrooms: 2,
      pricePerNight: 12000, cleaningFee: 2000, securityDeposit: 12000, ratingAvg: 4.6, reviewsCount: 15,
      amenities: ['wifi', 'heating', 'kitchen', 'parking', 'garden', 'family_friendly'], featured: false,
      img: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200',
    },
    {
      title: 'Chalet de montagne - Chréa, Blida',
      type: PropertyType.chalet, wilayaId: 9, capacity: 6, rooms: 3, beds: 4, bathrooms: 2,
      pricePerNight: 14500, cleaningFee: 2500, securityDeposit: 15000, ratingAvg: 4.8, reviewsCount: 19,
      amenities: ['wifi', 'heating', 'kitchen', 'parking', 'garden'], featured: true,
      img: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200',
    },
    {
      title: 'بنغالو صحراوي - غرداية',
      type: PropertyType.guesthouse, wilayaId: 47, capacity: 4, rooms: 2, beds: 2, bathrooms: 1,
      pricePerNight: 8000, cleaningFee: 1000, securityDeposit: 6000, ratingAvg: 4.4, reviewsCount: 6,
      amenities: ['wifi', 'ac', 'kitchen', 'water_tank', 'generator'], featured: false,
      img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
    },
  ];

  let createdProps = [] as { id: string }[];
  for (let i = 0; i < seedProps.length; i++) {
    const p = seedProps[i];
    const slug = `${p.type}-${p.wilayaId}-${i + 1}`;
    const existing = await prisma.property.findUnique({ where: { slug } });
    if (existing) { createdProps.push(existing); continue; }
    const created = await prisma.property.create({
      data: {
        hostId: host.id, title: p.title, slug, description: `${p.title}. ${'إقامة مريحة وموثوقة عبر منصة نُزُل. '.repeat(3)}`,
        type: p.type, status: PropertyStatus.approved, wilayaId: p.wilayaId,
        capacity: p.capacity, rooms: p.rooms, beds: p.beds, bathrooms: p.bathrooms,
        pricePerNight: p.pricePerNight, cleaningFee: p.cleaningFee, securityDeposit: p.securityDeposit,
        ratingAvg: p.ratingAvg, reviewsCount: p.reviewsCount, isFeatured: p.featured,
        bookingMode: i % 2 === 0 ? BookingMode.request : BookingMode.instant,
        images: { create: [{ url: p.img, sortOrder: 0 }, { url: p.img + '&sat=-30', sortOrder: 1 }] },
        amenities: { create: p.amenities.map((k) => ({ amenityId: byKey(k) })) },
        houseRules: { create: [{ text: 'ممنوع التدخين داخل العقار' }, { text: 'احترام الجيران بعد الساعة 22:00' }] },
      },
    });
    createdProps.push(created);
  }
  console.log(`  properties: ${createdProps.length}`);

  // One pending listing to exercise the admin moderation queue.
  await prisma.property.upsert({
    where: { slug: 'pending-apartment-23' },
    update: {},
    create: {
      hostId: host.id, title: 'Appartement à valider - Annaba', slug: 'pending-apartment-23',
      description: 'Appartement en attente de validation par l’équipe Nuzul. '.repeat(3),
      type: PropertyType.apartment, status: PropertyStatus.pending, wilayaId: 23,
      capacity: 4, rooms: 2, beds: 2, bathrooms: 1, pricePerNight: 7200, cleaningFee: 1000,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200', sortOrder: 0 }] },
      amenities: { create: [{ amenityId: byKey('wifi') }, { amenityId: byKey('ac') }] },
    },
  });

  // --- A completed booking + review for the first property ---
  const prop0 = createdProps[0];
  const existingBooking = await prisma.booking.findUnique({ where: { reference: ref(1) } });
  if (!existingBooking) {
    const booking = await prisma.booking.create({
      data: {
        reference: ref(1), propertyId: prop0.id, guestId: guest.id,
        status: BookingStatus.completed, mode: BookingMode.request,
        checkIn: new Date('2026-05-10'), checkOut: new Date('2026-05-13'), guests: 3, nights: 3,
        nightlyTotal: 29700, cleaningFee: 1500, serviceFee: 1485, commission: 3564,
        total: 32685, depositDue: 6537, balanceDue: 26148,
      },
    });
    await prisma.review.create({
      data: {
        bookingId: booking.id, propertyId: prop0.id, authorId: guest.id, subjectId: host.id,
        rating: 5, comment: 'إقامة ممتازة، المضيف متعاون والموقع رائع قرب البحر.', isVerified: true,
      },
    });
    await prisma.payment.create({
      data: { bookingId: booking.id, userId: guest.id, type: 'deposit', method: 'mock', status: 'succeeded', amount: 6537, providerRef: 'mock_seed_1' },
    });
  }
  console.log('  bookings + review + payment: 1');

  console.log('Done.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

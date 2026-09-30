import { PrismaClient, Role, Gender } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('[ROVIN Seeder] Initializing database telemetry...');

  // 1. Initialize System Settings
  const settings = await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      deliveryChargeInsideDhaka: 70,
      deliveryChargeOutsideDhaka: 130,
      freeShippingThreshold: 5000,
      bkashMerchantNumber: '01711000000',
      nagadMerchantNumber: '01711000000',
      maintenanceMode: false,
    },
  });
  console.log('[ROVIN Seeder] SystemSettings calibrated:', settings.id);

  // 2. Initialize Super Admin
  const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@rovin.com.bd' },
    update: {},
    create: {
      name: 'ROVIN Commander',
      email: 'admin@rovin.com.bd',
      phone: '01711000000',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      gender: Gender.MALE,
      profileImageUrl: '/assets/avatars/avatar-m1.svg',
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });
  console.log('[ROVIN Seeder] Super Admin initialized:', adminUser.email);

  // 3. Initialize Categories and Subcategories
  const categories = [
    {
      name: 'RC Drift Cars',
      slug: 'rc-drift-cars',
      description: 'Precision gyro-assisted 1:16 & 1:12 drift chassis with ultra-slick competition tires.',
      subcategories: [
        { name: '1:16 Scale RWD Drift', slug: '1-16-rwd-drift' },
        { name: '1:12 Scale AWD High-Torque', slug: '1-12-awd-high-torque' },
        { name: 'Brushless Competition Chassis', slug: 'brushless-competition-chassis' },
      ],
    },
    {
      name: 'RC Crawlers & Buggies',
      slug: 'rc-crawlers-buggies',
      description: 'High-clearance 4x4 trail crawlers and 60km/h brushless desert buggies.',
      subcategories: [
        { name: '4x4 Trail Crawlers', slug: '4x4-trail-crawlers' },
        { name: 'Brushless Desert Buggies', slug: 'brushless-desert-buggies' },
      ],
    },
    {
      name: 'Tactical Room Decor',
      slug: 'tactical-room-decor',
      description: 'Precision machined engine desk pieces, tactical LED ambient bars, and industrial display pedestals.',
      subcategories: [
        { name: 'Mechanical Desk Models', slug: 'mechanical-desk-models' },
        { name: 'Cyberpunk Ambient Lighting', slug: 'cyberpunk-ambient-lighting' },
      ],
    },
    {
      name: 'Hobby Electronics & Tools',
      slug: 'hobby-electronics-tools',
      description: 'High-discharge LiPo batteries, brushless motors, ESC speed controllers, and titanium hex drivers.',
      subcategories: [
        { name: 'LiPo Batteries & Chargers', slug: 'lipo-batteries-chargers' },
        { name: 'Brushless Motors & ESCs', slug: 'brushless-motors-escs' },
        { name: 'Precision Hex Toolsets', slug: 'precision-hex-toolsets' },
      ],
    },
  ];

  for (const catData of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: {},
      create: {
        name: catData.name,
        slug: catData.slug,
        description: catData.description,
      },
    });

    for (const sub of catData.subcategories) {
      await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: {},
        create: {
          categoryId: cat.id,
          name: sub.name,
          slug: sub.slug,
        },
      });
    }
  }

  console.log(`[ROVIN Seeder] Seeded ${categories.length} taxonomy categories with subcategories.`);
  console.log('[ROVIN Seeder] Calibration complete.');
}

main()
  .catch((e) => {
    console.error('[Seeder Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

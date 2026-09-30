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

async function seedProducts() {
  const driftCategory = await prisma.category.findUnique({ where: { slug: 'rc-drift-cars' } });
  const crawlerCategory = await prisma.category.findUnique({ where: { slug: 'rc-crawlers-buggies' } });
  const decorCategory = await prisma.category.findUnique({ where: { slug: 'tactical-room-decor' } });

  if (driftCategory) {
    const sub = await prisma.subcategory.findFirst({ where: { categoryId: driftCategory.id } });
    await prisma.product.upsert({
      where: { sku: 'ROV-DRF-1601' },
      update: {},
      create: {
        title: 'ROVIN Apex-16 RWD Gyro Drift Chassis',
        slug: 'rovin-apex-16-rwd-drift-chassis',
        sku: 'ROV-DRF-1601',
        description: 'Professional grade 1:16 scale rear-wheel drive drift car equipped with dynamic ESP electronic gyro stabilization, magnetic body mounts, and aluminum oil-filled threaded shocks.',
        categoryId: driftCategory.id,
        subcategoryId: sub?.id || null,
        priceBDT: 8500,
        costPriceBDT: 4600,
        discountPriceBDT: 7990,
        stockQuantity: 18,
        lowStockThreshold: 5,
        availableColors: [
          { name: 'Stealth Matte Black', hex: '#14161F' },
          { name: 'Nitro Amber Gold', hex: '#FFC837' },
          { name: 'Chassis Gunmetal', hex: '#3A4054' },
        ],
        availableSizes: ['1:16 Scale RTR'],
        weightGrams: 920,
        packageIncludes: [
          '1x ROVIN Apex-16 Drift Chassis',
          '1x 2.4GHz Pistol Transmitter with Gyro Sensitivity Dial',
          '2x 7.4V 1200mAh Li-ion High-Discharge Batteries',
          '1x USB Fast Balancing Charger',
          '4x Hard Drift Slick Wheels + 4x Rubber Grip Tires',
          '1x Precision Aluminum Hex Tool Kit',
        ],
        specs: {
          scale: '1:16',
          driveType: 'RWD (Rear Wheel Drive with Gyro)',
          motor: 'High-RPM Carbon Brushed 280 Drift Motor',
          topSpeed: '35 km/h',
          runTime: '25-30 Mins per Battery',
          controlRange: '100+ Meters',
        },
        images: [
          'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=800&q=80',
        ],
        isActive: true,
        featured: true,
      },
    });
  }

  if (crawlerCategory) {
    const sub = await prisma.subcategory.findFirst({ where: { categoryId: crawlerCategory.id } });
    await prisma.product.upsert({
      where: { sku: 'ROV-CRW-1201' },
      update: {},
      create: {
        title: 'ROVIN Titan-12 4x4 High-Torque Trail Crawler',
        slug: 'rovin-titan-12-4x4-trail-crawler',
        sku: 'ROV-CRW-1201',
        description: 'Unstoppable 1:12 scale metal geared trail crawler with portal axles, locking differentials, high-clearance aluminum link suspension, and IPX5 splashproof ESC.',
        categoryId: crawlerCategory.id,
        subcategoryId: sub?.id || null,
        priceBDT: 14500,
        costPriceBDT: 8200,
        discountPriceBDT: 13900,
        stockQuantity: 4, // Intentionally low stock to test low stock telemetry!
        lowStockThreshold: 5,
        availableColors: [
          { name: 'Tactical Olive Carbon', hex: '#2A3026' },
          { name: 'Pitch Obsidian', hex: '#07070A' },
        ],
        availableSizes: ['1:12 Scale High-Clearance'],
        weightGrams: 1850,
        packageIncludes: [
          '1x ROVIN Titan-12 4x4 Crawler',
          '1x 2.4GHz 4-Channel Remote Controller',
          '1x 7.4V 2200mAh LiPo Pack',
          '1x USB Smart Balancing Charger',
          '1x Tow Winch Cable & Shackle Set',
        ],
        specs: {
          scale: '1:12',
          driveType: '4WD Shaft Driven with Portal Axles',
          motor: 'High-Torque 550 Brushed Motor (35T)',
          topSpeed: '18 km/h (Low Gear Crawl Focus)',
          runTime: '40 Mins',
          waterResistance: 'IPX5 Splashproof',
        },
        images: [
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
        ],
        isActive: true,
        featured: true,
      },
    });
  }

  if (decorCategory) {
    await prisma.product.upsert({
      where: { sku: 'ROV-ENG-V801' },
      update: {},
      create: {
        title: 'ROVIN Machined V8 Piston Desk Telemetry Engine',
        slug: 'rovin-machined-v8-piston-desk-engine',
        sku: 'ROV-ENG-V801',
        description: 'CNC cut aluminum mechanical V8 engine replica with synchronized moving pistons, crankshaft bearings, and warm amber combustion illumination for desk setups.',
        categoryId: decorCategory.id,
        priceBDT: 6200,
        costPriceBDT: 3100,
        discountPriceBDT: null,
        stockQuantity: 12,
        lowStockThreshold: 3,
        availableColors: [
          { name: 'Machined Titanium & Amber', hex: '#FFC837' },
        ],
        weightGrams: 750,
        packageIncludes: [
          '1x CNC Machined V8 Desk Engine Display',
          '1x USB-C Braided Tactical Power Cable',
          '1x Gunmetal Hex Baseplate with Telemetry Laser Etch',
        ],
        specs: {
          material: '6061-T6 Aircraft Grade Billet Aluminum',
          power: '5V USB-C Ambient Power',
          bearings: 'Stainless Steel High-Speed Miniature Bearings',
        },
        images: [
          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        ],
        isActive: true,
        featured: false,
      },
    });
  }
}

seedProducts()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

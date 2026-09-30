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
  await seedProducts();
  await seedCms();
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
  const toolsCategory = await prisma.category.findUnique({ where: { slug: 'hobby-electronics-tools' } });

  const driftSub = driftCategory ? await prisma.subcategory.findFirst({ where: { categoryId: driftCategory.id } }) : null;
  const crawlerSub = crawlerCategory ? await prisma.subcategory.findFirst({ where: { categoryId: crawlerCategory.id } }) : null;
  const decorSub = decorCategory ? await prisma.subcategory.findFirst({ where: { categoryId: decorCategory.id } }) : null;
  const toolsSub = toolsCategory ? await prisma.subcategory.findFirst({ where: { categoryId: toolsCategory.id } }) : null;

  const catalog = [
    // SPECIAL ITEMS
    {
      sku: 'ROV-DRF-1601',
      title: 'ROVIN Apex-16 RWD Gyro Drift Chassis',
      slug: 'rovin-apex-16-rwd-drift-chassis',
      description: 'Professional grade 1:16 scale rear-wheel drive drift car equipped with dynamic ESP electronic gyro stabilization, magnetic body mounts, and aluminum oil-filled threaded shocks.',
      categoryId: driftCategory?.id,
      subcategoryId: driftSub?.id,
      priceBDT: 8500,
      costPriceBDT: 4600,
      discountPriceBDT: 7990,
      stockQuantity: 18,
      lowStockThreshold: 5,
      isSpecial: true,
      featured: true,
      availableColors: [
        { name: 'Stealth Matte Black', hex: '#14161F' },
        { name: 'Nitro Amber Gold', hex: '#FFC837' },
      ],
      availableSizes: ['1:16 Scale RTR'],
      weightGrams: 920,
      images: [
        'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=800&q=80',
      ],
      specs: { scale: '1:16', driveType: 'RWD (Gyro Assist)', motor: 'High-RPM 280 Drift Motor', topSpeed: '35 km/h' },
    },
    {
      sku: 'ROV-DRF-1002',
      title: 'ROVIN Phantom-D 1:10 Drift Spec Pro Chassis',
      slug: 'rovin-phantom-d-1-10-drift-spec-pro',
      description: 'Carbon fiber double-deck competition chassis with belt-driven counter-steer ratio, magnetic front bumper, and adjustable caster angles.',
      categoryId: driftCategory?.id,
      subcategoryId: driftSub?.id,
      priceBDT: 16500,
      costPriceBDT: 9500,
      discountPriceBDT: 15400,
      stockQuantity: 8,
      lowStockThreshold: 3,
      isSpecial: true,
      featured: true,
      availableColors: [{ name: 'Gloss Carbon Weave', hex: '#1C202C' }],
      availableSizes: ['1:10 Scale ARR'],
      weightGrams: 1450,
      images: [
        'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=800&q=80',
      ],
      specs: { scale: '1:10', driveType: 'RWD Competition Belt', motor: 'Sensored Brushless 10.5T', topSpeed: '45 km/h' },
    },
    {
      sku: 'ROV-CRW-1002',
      title: 'ROVIN Marauder-10 Brushless Desert Trophy Truck',
      slug: 'rovin-marauder-10-brushless-trophy-truck',
      description: 'Ultra high-speed 65 km/h brushless desert runner with trailing arm solid rear axle, aluminum reservoir shocks, and steel differential ring gears.',
      categoryId: crawlerCategory?.id,
      subcategoryId: crawlerSub?.id,
      priceBDT: 19800,
      costPriceBDT: 11500,
      discountPriceBDT: 18500,
      stockQuantity: 6,
      lowStockThreshold: 2,
      isSpecial: true,
      featured: true,
      availableColors: [{ name: 'Desert Camo Sand', hex: '#D4A373' }, { name: 'Pitch Obsidian', hex: '#0D0F16' }],
      availableSizes: ['1:10 Scale High Speed'],
      weightGrams: 2300,
      images: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      ],
      specs: { scale: '1:10', driveType: '4WD Solid Axle Trailing Arm', motor: '3660 3800KV Brushless', topSpeed: '65 km/h' },
    },
    {
      sku: 'ROV-ENG-V801',
      title: 'ROVIN Machined V8 Piston Desk Telemetry Engine',
      slug: 'rovin-machined-v8-piston-desk-engine',
      description: 'CNC cut aluminum mechanical V8 engine replica with synchronized moving pistons, crankshaft bearings, and warm amber combustion illumination for desk setups.',
      categoryId: decorCategory?.id,
      subcategoryId: decorSub?.id,
      priceBDT: 6200,
      costPriceBDT: 3100,
      discountPriceBDT: null,
      stockQuantity: 12,
      lowStockThreshold: 3,
      isSpecial: true,
      featured: false,
      availableColors: [{ name: 'Machined Titanium & Amber', hex: '#FFC837' }],
      weightGrams: 750,
      images: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      ],
      specs: { material: '6061-T6 Billet Aluminum', power: '5V USB-C', bearings: 'Stainless High-Speed Miniature' },
    },

    // NON-SPECIAL: REGULAR CATALOG ITEMS (NEW ARRIVALS & MOST SELLING)
    {
      sku: 'ROV-CRW-1201',
      title: 'ROVIN Titan-12 4x4 High-Torque Trail Crawler',
      slug: 'rovin-titan-12-4x4-trail-crawler',
      description: 'Unstoppable 1:12 scale metal geared trail crawler with portal axles, locking differentials, high-clearance aluminum link suspension, and IPX5 splashproof ESC.',
      categoryId: crawlerCategory?.id,
      subcategoryId: crawlerSub?.id,
      priceBDT: 14500,
      costPriceBDT: 8200,
      discountPriceBDT: 13900,
      stockQuantity: 4,
      lowStockThreshold: 5,
      isSpecial: false,
      featured: true,
      availableColors: [{ name: 'Tactical Olive Carbon', hex: '#2A3026' }],
      availableSizes: ['1:12 Scale High-Clearance'],
      weightGrams: 1850,
      images: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      ],
      specs: { scale: '1:12', driveType: '4WD Shaft Driven Portal Axles', motor: 'High-Torque 550 Brushed (35T)', topSpeed: '18 km/h' },
    },
    {
      sku: 'ROV-DRF-2401',
      title: 'ROVIN Ghost-24 Micro Desktop Drift Car',
      slug: 'rovin-ghost-24-micro-desktop-drift-car',
      description: 'Compact 1:24 precision desk tandem drift chassis with digital steering proportional servo, metal ball diff, and USB-C direct chassis charging.',
      categoryId: driftCategory?.id,
      subcategoryId: driftSub?.id,
      priceBDT: 4800,
      costPriceBDT: 2600,
      discountPriceBDT: 4350,
      stockQuantity: 24,
      lowStockThreshold: 5,
      isSpecial: false,
      featured: true,
      availableColors: [{ name: 'Titanium White', hex: '#FFFFFF' }, { name: 'Matte Obsidian', hex: '#141721' }],
      availableSizes: ['1:24 Scale RTR'],
      weightGrams: 320,
      images: [
        'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80',
      ],
      specs: { scale: '1:24', driveType: 'AWD Ball Diff', motor: 'Coreless Micro High-RPM', topSpeed: '22 km/h' },
    },
    {
      sku: 'ROV-CRW-1801',
      title: 'ROVIN Rock-Buster 1:18 Mini Trail Crawler',
      slug: 'rovin-rock-buster-1-18-mini-crawler',
      description: 'Agile 1:18 high-flexion trail truck with beadlock off-road tires, waterproof electronics, and multi-link steering geometry.',
      categoryId: crawlerCategory?.id,
      subcategoryId: crawlerSub?.id,
      priceBDT: 6500,
      costPriceBDT: 3400,
      discountPriceBDT: 5990,
      stockQuantity: 15,
      lowStockThreshold: 4,
      isSpecial: false,
      featured: false,
      availableColors: [{ name: 'Nitro Amber Accent', hex: '#FFC837' }],
      availableSizes: ['1:18 Scale RTR'],
      weightGrams: 780,
      images: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      ],
      specs: { scale: '1:18', driveType: 'Full-time 4WD', motor: '180 High-Torque Brushed', topSpeed: '12 km/h' },
    },
    {
      sku: 'ROV-DEC-ROT1',
      title: 'ROVIN CNC Billet Wankel Rotary Desk Sculpture',
      slug: 'rovin-cnc-billet-wankel-rotary-engine',
      description: 'Exquisite motorized dual-rotor Wankel desk display with visible eccentric shaft, brass apex seals, and machined aerospace aluminum framing.',
      categoryId: decorCategory?.id,
      subcategoryId: decorSub?.id,
      priceBDT: 5900,
      costPriceBDT: 2900,
      discountPriceBDT: 5490,
      stockQuantity: 10,
      lowStockThreshold: 3,
      isSpecial: false,
      featured: false,
      availableColors: [{ name: 'Anodized Gunmetal & Gold', hex: '#8C9BAF' }],
      weightGrams: 680,
      images: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      ],
      specs: { material: '6061 Billet Aluminum & Brass', drive: 'Synchronous Low-RPM Silent Motor', power: 'USB 5V' },
    },
    {
      sku: 'ROV-TOOL-SET',
      title: 'ROVIN Titanium Nitride Precision Hex Driver Set (4-Piece)',
      slug: 'rovin-titanium-nitride-precision-hex-driver-set',
      description: 'High-durability TiN coated hex tips (1.5mm, 2.0mm, 2.5mm, 3.0mm) with hollow CNC knurled aluminum grips and rotating end caps.',
      categoryId: toolsCategory?.id,
      subcategoryId: toolsSub?.id,
      priceBDT: 2450,
      costPriceBDT: 1100,
      discountPriceBDT: 2190,
      stockQuantity: 30,
      lowStockThreshold: 6,
      isSpecial: false,
      featured: false,
      availableColors: [{ name: 'Black & Gold TiN', hex: '#FFC837' }],
      weightGrams: 210,
      images: [
        'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=800&q=80',
      ],
      specs: { material: 'HSS with TiN Coating', sizes: '1.5mm, 2.0mm, 2.5mm, 3.0mm', handle: 'Lightweight Hollow Knurled' },
    },
    {
      sku: 'ROV-BAT-2200',
      title: 'ROVIN 7.4V 2200mAh 60C High-Discharge LiPo Pack',
      slug: 'rovin-7-4v-2200mah-60c-lipo-pack',
      description: 'Punchy 2S LiPo hardcase battery with Deans T-plug connector, low internal resistance cells, and gold-plated balance leads.',
      categoryId: toolsCategory?.id,
      subcategoryId: toolsSub?.id,
      priceBDT: 1850,
      costPriceBDT: 950,
      discountPriceBDT: 1650,
      stockQuantity: 25,
      lowStockThreshold: 5,
      isSpecial: false,
      featured: false,
      availableColors: [{ name: 'Carbon Protective Wrap', hex: '#1C202C' }],
      weightGrams: 140,
      images: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      ],
      specs: { voltage: '7.4V (2S)', capacity: '2200mAh', dischargeRate: '60C Constant / 120C Burst', plug: 'Deans (T-Plug)' },
    },
    {
      sku: 'ROV-MOT-3650',
      title: 'ROVIN Brushless 3650 4300KV Motor & 60A ESC Combo',
      slug: 'rovin-brushless-3650-4300kv-esc-combo',
      description: 'Sensorless 4-pole high-torque brushless power system with aluminum finned heat-sink can, waterproof 60A ESC, and BEC 6V/3A output.',
      categoryId: toolsCategory?.id,
      subcategoryId: toolsSub?.id,
      priceBDT: 4600,
      costPriceBDT: 2300,
      discountPriceBDT: 4190,
      stockQuantity: 14,
      lowStockThreshold: 4,
      isSpecial: false,
      featured: false,
      availableColors: [{ name: 'Anodized Nitro Amber', hex: '#FFC837' }],
      weightGrams: 280,
      images: [
        'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80',
      ],
      specs: { kv: '4300KV', esc: '60A Waterproof', poles: '4-Pole High-Torque Rotor', maxRPM: '50000' },
    },
    {
      sku: 'ROV-RIM-BEAD',
      title: 'ROVIN CNC Alloy 1.9 Beadlock Wheel Rims (Set of 4)',
      slug: 'rovin-cnc-alloy-1-9-beadlock-wheel-rims',
      description: 'Heavyweight lower center of gravity aluminum beadlock rims with steel hardware bolts, hex hub adaptors, and anodized finish.',
      categoryId: toolsCategory?.id,
      subcategoryId: toolsSub?.id,
      priceBDT: 3200,
      costPriceBDT: 1600,
      discountPriceBDT: 2890,
      stockQuantity: 18,
      lowStockThreshold: 4,
      isSpecial: false,
      featured: false,
      availableColors: [{ name: 'Machined Silver & Black', hex: '#D4DCE6' }],
      weightGrams: 360,
      images: [
        'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=800&q=80',
      ],
      specs: { size: '1.9 Inch', hex: '12mm Standard', type: 'True Beadlock (No Glue Required)', weight: '90g per rim' },
    },
  ];

  for (const item of catalog) {
    if (!item.categoryId) continue;
    await prisma.product.upsert({
      where: { sku: item.sku },
      update: {
        title: item.title,
        priceBDT: item.priceBDT,
        discountPriceBDT: item.discountPriceBDT,
        isSpecial: item.isSpecial,
        featured: item.featured,
        stockQuantity: item.stockQuantity,
      },
      create: {
        title: item.title,
        slug: item.slug,
        sku: item.sku,
        description: item.description,
        categoryId: item.categoryId,
        subcategoryId: item.subcategoryId || null,
        priceBDT: item.priceBDT,
        costPriceBDT: item.costPriceBDT,
        discountPriceBDT: item.discountPriceBDT,
        stockQuantity: item.stockQuantity,
        lowStockThreshold: item.lowStockThreshold,
        isSpecial: item.isSpecial,
        featured: item.featured,
        availableColors: item.availableColors,
        availableSizes: (item as any).availableSizes || null,
        weightGrams: item.weightGrams,
        images: item.images,
        specs: item.specs,
      },
    });
  }
}

async function seedCms() {
  await prisma.siteContent.upsert({
    where: { slug: 'privacy-policy' },
    update: {},
    create: {
      slug: 'privacy-policy',
      title: 'ROVIN Privacy Policy & Data Calibration',
      content: `### 1. Information We Collect
ROVIN collects your name, delivery address, 11-digit Bangladesh phone number, and optional email when creating an account or placing an order. This information is utilized exclusively for order fulfillment, courier parcel dispatch (via Steadfast & Pathao), and security verification.

### 2. Security of Customer Records
Your password is never stored in plain text; all credentials are encrypted using industry-standard bcrypt hashing. Multi-factor verification codes (6-digit OTPs) expire automatically within 5 minutes.

### 3. Third-Party Courier Data Sharing
To facilitate Cash on Delivery (COD) and nationwide shipping across all 64 districts in Bangladesh, your name, contact phone number, and shipping address are securely transmitted to authorized courier gateways (Steadfast Courier and Pathao Logistics).

### 4. Cookies & Session Storage
We utilize local session tokens solely for authenticating your active crew session and preserving your cart configuration.`,
    },
  });

  await prisma.siteContent.upsert({
    where: { slug: 'about-us' },
    update: {},
    create: {
      slug: 'about-us',
      title: 'About ROVIN — Built for Speed, Torque & Precision',
      content: `### Engineered for "The Boys" Vibe & Mechanical Precision
ROVIN was forged for hobbyists, collectors, and builders who appreciate raw mechanical engineering, brushless torque, and tactical dark-aesthetic desk tech.

We eliminate childish plastic toys and loud gradient clutter, instead delivering chiseled, surgical, and durable hardware. From precision gyro-assisted 1:16 rear-wheel-drive drift buggies to metal-geared portal axle trail crawlers and CNC machined aluminum engine display sculptures, every item in the ROVIN hangar is built to perform.

### Direct Sourcing & Bangladesh Nationwide Delivery
We carefully test every single batch before stocking. Our automated courier network delivers directly to your doorstep anywhere in Bangladesh, supported by reliable Cash on Delivery (COD) and direct MFS payments.`,
    },
  });

  await prisma.siteContent.upsert({
    where: { slug: 'terms-conditions' },
    update: {},
    create: {
      slug: 'terms-conditions',
      title: 'ROVIN Terms of Service & Warranty Calibration',
      content: `### 1. Order Verification & Delivery
Orders placed through our 1-page checkout are processed and verified within 24 hours. Nationwide delivery inside Dhaka takes 24–48 hours, and outside Dhaka 48–72 hours via Steadfast or Pathao couriers.

### 2. Unboxing & Inspection Protocol
Customers are advised to inspect the parcel packaging upon delivery. Hobby electronics and RC models carry a 7-day manufacturer warranty against factory defects. Physical damage caused by improper operation, crashes, or unauthorized modifications is excluded.`,
    },
  });
}

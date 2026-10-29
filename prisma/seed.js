const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Vedik Vana...');

  // 1. Store Settings
  await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'Vedik Vana',
      tagline: 'Sacred Botanical Living — 100% Pure, Wild-Harvested & Farm-Traceable',
      logoUrl: '/images/logo.png',
      contactEmail: 'care@vedikvana.com',
      contactPhone: '+91 98765 43210',
      address: 'Vedik Vana Heritage Estates, Himalayan Foothills, Dehradun, Uttarakhand, 248001',
      fssaiLicence: '10024011000918',
      freeShippingThresholdPaise: 99900, // ₹999 free shipping
      standardShippingFeePaise: 9900,   // ₹99
      taxRatePercent: 5,
      codEnabled: true,
      razorpayKeyId: 'rzp_test_vedikvanaDemo123',
      razorpayKeySecret: 'sampleSecretKey9988',
      announcementText: '✨ Special Festive Offering: Use code VEDIK15 for 15% off | Free Express Delivery across India above ₹999',
      announcementActive: true,
      currency: 'INR',
      currencySymbol: '₹',
    },
  });

  // 2. Admin User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('AdminPassword123!', salt);

  await prisma.adminUser.upsert({
    where: { email: 'admin@vedikvana.com' },
    update: { passwordHash, uniqueStaffId: 'VV-ADMIN-01' },
    create: {
      email: 'admin@vedikvana.com',
      uniqueStaffId: 'VV-ADMIN-01',
      name: 'Vedic Vana Master Admin',
      passwordHash,
      role: 'OWNER',
      isActive: true,
    },
  });

  // Seed sample Customer
  const customerPasswordHash = await bcrypt.hash('Customer123!', salt);
  await prisma.customer.upsert({
    where: { email: 'customer@vedikvana.com' },
    update: { passwordHash: customerPasswordHash, phone: '+919876543211' },
    create: {
      email: 'customer@vedikvana.com',
      phone: '+919876543211',
      name: 'Aarav Sharma',
      passwordHash: customerPasswordHash,
      addresses: JSON.stringify([
        {
          fullName: 'Aarav Sharma',
          phone: '+91 98765 43211',
          addressLine1: 'B-402, Lotus Boulevard, Sector 100',
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201304',
          isDefault: true,
        },
      ]),
    },
  });

  // 3. Categories
  const categoriesData = [
    {
      name: 'Resins & Pure Shilajit',
      slug: 'resins-shilajit',
      description: 'Gold-grade purified Himalayan minerals and adaptogenic mountain resins harvested at 16,000+ feet.',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
      displayOrder: 1,
    },
    {
      name: 'Cold-Pressed Oils',
      slug: 'cold-pressed-oils',
      description: 'Traditional slow wood-pressed (Kachi Ghani) virgin oils from single-origin certified Indian farms.',
      image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80',
      displayOrder: 2,
    },
    {
      name: 'Chyawanprash & Rasayanas',
      slug: 'chyawanprash-rasayanas',
      description: 'Ancient Ayurvedic immunity elixirs cooked in traditional iron cauldrons with wild amla and 48 herbs.',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      displayOrder: 3,
    },
    {
      name: 'Sacred Saffron & Botanicals',
      slug: 'saffron-botanicals',
      description: 'GI-tagged Pure Kashmiri Mongra Saffron, hand-plucked crimson stigmas with high crocin potency.',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
      displayOrder: 4,
    },
    {
      name: 'Wild Forest Honey',
      slug: 'wild-forest-honey',
      description: 'Raw, unpasteurized and unfiltered nectar collected sustainably from indigenous forest beehives.',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
      displayOrder: 5,
    },
    {
      name: 'Herbal Churnas & Powders',
      slug: 'herbal-churnas',
      description: 'Sun-dried, stone-ground triphala, ashwagandha, and restorative botanical powders.',
      image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
      displayOrder: 6,
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap[cat.slug] = createdCat.id;
  }

  // 4. Products with Variants and Images
  const products = [
    {
      name: 'Pure Himalayan Shilajit Resin (Gold Grade)',
      slug: 'pure-himalayan-shilajit-resin',
      sku: 'VV-SHJ-001',
      barcode: '8901234560012',
      categoryId: categoryMap['resins-shilajit'],
      shortDescription: '100% pure wild-sourced Himalayan Shilajit resin with >75% Fulvic Acid. Lab-certified heavy metal free.',
      fullDescription: `Harvested at extreme Himalayan altitudes exceeding 16,000 feet, Vedik Vana Himalayan Shilajit is naturally enriched through centuries of botanical decomposition under geothermal pressure.

Each batch is purified following ancient Ayurvedic Shodhana protocols using Triphala decoctions, preserving vital bioactive fulvic acid and over 84 ionic trace minerals.

• Bioactive Fulvic Acid: Guaranteed >75% content
• 100% Free of artificial additives, binders, or fillers
• Third-party batch certified for heavy metals (Lead, Mercury, Arsenic, Cadmium)`,
      regularPricePaise: 169900, // ₹1,699
      sellingPricePaise: 139900, // ₹1,399
      compareAtPricePaise: 189900, // ₹1,899 (Save ₹500)
      inventoryQty: 34,
      lowStockThreshold: 8,
      status: 'PUBLISHED',
      availability: 'IN_STOCK',
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      isSale: true,
      farmOrigin: 'High Altitude Skardu/Kinnaur Valley, Himalayas (16,200 ft)',
      harvestInfo: 'Summer Glacier Melt Harvest 2024, Traditional Hand-Chiseled',
      grade: 'Grade-A Gold Shilajit Resin',
      netWeight: '20g / 50g Glass Jar with Brass Measuring Spoon',
      batchNumber: 'VV-SHJ-24-08A',
      fssaiNumber: '10024011000918',
      expiryDate: '36 Months from Packaging',
      storageInstructions: 'Store in a cool, dry place. Close the amber jar tightly to preserve natural resin texture.',
      shelfLife: '3 Years',
      ingredients: '100% Purified Himalayan Shilajit (Asphaltum punjabianum) Resin',
      images: [
        {
          url: '/images/products/shilajit.jpg',
          alt: 'Pure Himalayan Shilajit Resin in Luxury Amber Glass Jar',
          isPrimary: true,
          sortOrder: 1,
        },
      ],
      variants: [
        {
          name: '20g Amber Glass Jar + Brass Spoon',
          sku: 'VV-SHJ-001-20G',
          pricePaise: 139900,
          compareAtPricePaise: 189900,
          inventoryQty: 22,
          isDefault: true,
        },
        {
          name: '50g Master Reserve Glass Jar (Best Value)',
          sku: 'VV-SHJ-001-50G',
          pricePaise: 279900,
          compareAtPricePaise: 380000,
          inventoryQty: 12,
          isDefault: false,
        },
      ],
      reviews: [
        {
          customerName: 'Aditya Sharma, Pune',
          rating: 5,
          title: 'Unbelievable stamina and pure authenticity',
          comment: 'You can immediately tell by the aroma and water solubility test that this is authentic Grade-A Shilajit. Truly superior to commercial brands.',
        },
        {
          customerName: 'Dr. Meera Nair, Bangalore',
          rating: 5,
          title: 'Impressed by the lab testing transparency',
          comment: 'As an Ayurvedic practitioner, testing parameters matter to me. The batch report and purity are top tier. Recommended to all my patients.',
        },
      ],
    },
    {
      name: 'Organic Kashmiri Mongra Saffron (Grade A+)',
      slug: 'organic-kashmiri-mongra-saffron',
      sku: 'VV-SFR-002',
      barcode: '8901234560029',
      categoryId: categoryMap['saffron-botanicals'],
      shortDescription: 'GI-tagged 100% pure Kashmiri Mongra Saffron. Dark crimson thick stigmas with supreme Crocin aroma and coloring power.',
      fullDescription: `Grown in the legendary saffron terraces of Pampore, Kashmir, our Mongra Saffron represents the highest international ISO 3632 Category I standard.

Only the trumpet-shaped, deep red tips (stigmas) of the Crocus sativus flower are selected, completely free of yellow styles or foreign moisture.

• 100% Authenticity Guaranteed: Characteristic sweet aroma with bitter herbal undertone
• Highest natural Crocin, Safranal, and Picrocrocin concentration
• Perfect for golden milk, expectant mothers, gourmet infusions, and skin brightening rituals`,
      regularPricePaise: 95000, // ₹950
      sellingPricePaise: 79900, // ₹799
      compareAtPricePaise: 110000, // ₹1,100
      inventoryQty: 48,
      lowStockThreshold: 10,
      status: 'PUBLISHED',
      availability: 'IN_STOCK',
      isFeatured: true,
      isBestseller: true,
      isNewArrival: true,
      isSale: true,
      farmOrigin: 'Pampore Terraces, Pulwama, Kashmir Valley',
      harvestInfo: 'October 2024 Fresh Harvest, Dawn Hand-Plucked',
      grade: 'Grade-A+ Super Mongra (Crocin > 260)',
      netWeight: '1g / 2g / 5g Vacuum-Sealed Heritage Tin',
      batchNumber: 'VV-SFR-24-K09',
      fssaiNumber: '10024011000918',
      expiryDate: '24 Months from Packaging',
      storageInstructions: 'Store in airtight tin away from ambient light and heat. Do not refrigerate.',
      shelfLife: '2 Years',
      ingredients: '100% Pure Kashmiri Mongra Saffron (Crocus sativus stigmas)',
      images: [
        {
          url: '/images/products/saffron.jpg',
          alt: 'Pure Kashmiri Mongra Saffron Crimson Threads in Heritage Tin',
          isPrimary: true,
          sortOrder: 1,
        },
      ],
      variants: [
        {
          name: '1 Gram Tin',
          sku: 'VV-SFR-002-1G',
          pricePaise: 79900,
          compareAtPricePaise: 110000,
          inventoryQty: 28,
          isDefault: true,
        },
        {
          name: '2 Grams Tin (Most Popular)',
          sku: 'VV-SFR-002-2G',
          pricePaise: 149900,
          compareAtPricePaise: 210000,
          inventoryQty: 15,
          isDefault: false,
        },
        {
          name: '5 Grams Heritage Wooden Box',
          sku: 'VV-SFR-002-5G',
          pricePaise: 349900,
          compareAtPricePaise: 480000,
          inventoryQty: 5,
          isDefault: false,
        },
      ],
      reviews: [
        {
          customerName: 'Kavita Singhal, Delhi',
          rating: 5,
          title: 'Gorgeous rich color and authentic aroma',
          comment: 'Just 2-3 strands turn a bowl of milk into brilliant liquid gold. Will never buy commercial supermarket saffron again.',
        },
      ],
    },
    {
      name: 'Cold-Pressed Wood-Pressed Virgin Coconut Oil',
      slug: 'cold-pressed-wood-pressed-virgin-coconut-oil',
      sku: 'VV-OIL-003',
      barcode: '8901234560036',
      categoryId: categoryMap['cold-pressed-oils'],
      shortDescription: 'Slowly extracted in traditional Marachekku wooden churns at under 38°C from fresh organic Malabar coconuts.',
      fullDescription: `Pure raw culinary and restorative coconut oil extracted from fresh, sun-dried copra sourced directly from organic groves in coastal Kerala.

Because our wooden mill runs at slow RPM without thermal friction, the rich Lauric acid, natural Vitamin E, and fresh coconut aroma remain completely uncompromised.

• 0% Heat Treatment, 0% Chemical Refining, 0% Bleaching
• Rich in MCTs (Medium Chain Triglycerides) and Lauric Acid
• Multipurpose: Ideal for Ayurvedic oil pulling, holistic cooking, skin nourishment, and hair revitalization`,
      regularPricePaise: 55000, // ₹550
      sellingPricePaise: 45000, // ₹450
      compareAtPricePaise: 62000, // ₹620
      inventoryQty: 50,
      lowStockThreshold: 12,
      status: 'PUBLISHED',
      availability: 'IN_STOCK',
      isFeatured: false,
      isBestseller: true,
      isNewArrival: false,
      isSale: false,
      farmOrigin: 'Single-Estate Organic Coconut Groves, Calicut, Kerala',
      harvestInfo: 'Mature Rain-fed Palms Harvest 2024',
      grade: 'Wood-Pressed Extra Virgin First Extraction',
      netWeight: '500ml / 1000ml UV-Protected Glass Bottle',
      batchNumber: 'VV-WPO-24-C03',
      fssaiNumber: '10024011000918',
      expiryDate: '12 Months from Batch Date',
      storageInstructions: 'Solidifies below 24°C naturally. Place bottle in warm water to liquefy.',
      shelfLife: '1 Year',
      ingredients: '100% Pure Wood-Pressed Virgin Coconut Oil (Cocos nucifera)',
      images: [
        {
          url: '/images/products/coconut_oil.jpg',
          alt: 'Pure Wood-Pressed Virgin Coconut Oil in Glass Bottle',
          isPrimary: true,
          sortOrder: 1,
        },
      ],
      variants: [
        {
          name: '500ml Dark Amber Glass Bottle',
          sku: 'VV-OIL-003-500ML',
          pricePaise: 45000,
          compareAtPricePaise: 62000,
          inventoryQty: 32,
          isDefault: true,
        },
        {
          name: '1 Litre Eco Value Glass Bottle',
          sku: 'VV-OIL-003-1L',
          pricePaise: 82000,
          compareAtPricePaise: 110000,
          inventoryQty: 18,
          isDefault: false,
        },
      ],
    },
    {
      name: 'Vedic Chyawanprash (48 Wild Herbs & Forest Amla)',
      slug: 'vedic-chyawanprash-wild-herbs-amla',
      sku: 'VV-CHW-004',
      barcode: '8901234560043',
      categoryId: categoryMap['chyawanprash-rasayanas'],
      shortDescription: 'Classical Charaka Samhita recipe prepared in pure A2 Gir Cow Ghee, wild amla, raw forest honey, and 48 potent botanicals.',
      fullDescription: `An authentic Ayurvedic rasayana formulated to fortify Ojas (vital immunity), digestive fire (Agni), and respiratory vitality.

Prepared using freshly harvested wild organic Amlaki from the Vindhya forests, simmered gently in Vedic A2 Gir Cow Bilona Ghee and sweet wild nectar instead of processed refined sugar.

• Free from refined cane sugar, glucose syrup, or artificial preservatives
• Prepared strictly according to classical Charak Samhita guidelines
• Powerful seasonal wellness support for adults and children alike`,
      regularPricePaise: 119900, // ₹1,199
      sellingPricePaise: 99900, // ₹999
      compareAtPricePaise: 135000, // ₹1,350
      inventoryQty: 25,
      lowStockThreshold: 6,
      status: 'PUBLISHED',
      availability: 'IN_STOCK',
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      isSale: true,
      farmOrigin: 'Vindhyachal Forest Range & Gujarat Organic A2 Goshalas',
      harvestInfo: 'Winter Amlaki Harvest Season',
      grade: 'Classical Ayurvedic Shastra Grade',
      netWeight: '500g / 1kg Ceramic Apothecary Jar',
      batchNumber: 'VV-CHW-24-V08',
      fssaiNumber: '10024011000918',
      expiryDate: '24 Months from Packaging Date',
      storageInstructions: 'Store in a dry place. Always use a dry spoon.',
      shelfLife: '2 Years',
      ingredients: 'Wild Fresh Amla (Emblica officinalis), A2 Gir Cow Ghee, Raw Forest Honey, Dashmoola, Ashwagandha, Pippali, Shatavari, Cardamom, 41 Botanical Herbs',
      images: [
        {
          url: '/images/products/chyawanprash.jpg',
          alt: 'Vedic Chyawanprash in Ceramic Apothecary Jar',
          isPrimary: true,
          sortOrder: 1,
        },
      ],
      variants: [
        {
          name: '500g Heritage Glass Jar',
          sku: 'VV-CHW-004-500G',
          pricePaise: 99900,
          compareAtPricePaise: 135000,
          inventoryQty: 18,
          isDefault: true,
        },
        {
          name: '1kg Family Saver Pack',
          sku: 'VV-CHW-004-1KG',
          pricePaise: 179900,
          compareAtPricePaise: 240000,
          inventoryQty: 7,
          isDefault: false,
        },
      ],
    },
    {
      name: 'Raw Multifloral Wild Forest Honey',
      slug: 'raw-multifloral-wild-forest-honey',
      sku: 'VV-HNY-005',
      barcode: '8901234560050',
      categoryId: categoryMap['wild-forest-honey'],
      shortDescription: 'Unfiltered, unpasteurized, single-origin raw honey harvested by tribal gatherers from deep Corbett forest canopies.',
      fullDescription: `Retaining all active pollen, natural royal jelly, propolis, and living enzymes, our Raw Forest Honey is the antithesis of mass-market corn-syrup adulterated honeys.

Gently strained through muslin cloth without micro-filtration or high heat pasteurization.

• Unheated (below hive temperature 35°C) to protect vital enzymes
• 0% Added sugar, rice syrup, or C3/C4 commercial additives (NMR Tested)
• Rich, dark amber hue with deep floral and herbal notes`,
      regularPricePaise: 69900, // ₹699
      sellingPricePaise: 54900, // ₹549
      compareAtPricePaise: 79900, // ₹799
      inventoryQty: 40,
      lowStockThreshold: 8,
      status: 'PUBLISHED',
      availability: 'IN_STOCK',
      isFeatured: false,
      isBestseller: false,
      isNewArrival: true,
      isSale: false,
      farmOrigin: 'Jim Corbett & Shivalik Forest Reserve, Uttarakhand',
      harvestInfo: 'Spring Wildflora Bloom Harvest',
      grade: 'Raw Unprocessed Forest Grade (NMR Verified)',
      netWeight: '400g / 800g Glass Bottle',
      batchNumber: 'VV-HNY-24-W02',
      fssaiNumber: '10024011000918',
      expiryDate: 'Pure Honey Does Not Expire; Best within 24 months',
      storageInstructions: 'Natural crystallization is proof of purity. Place jar in warm water to reliquefy.',
      shelfLife: '2 Years',
      ingredients: '100% Pure Raw Forest Honey',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=85',
          alt: 'Golden Raw Wild Forest Honey in Glass Jar with Wooden Dipper',
          isPrimary: true,
          sortOrder: 1,
        },
      ],
      variants: [
        {
          name: '400g Hexagonal Glass Jar',
          sku: 'VV-HNY-005-400G',
          pricePaise: 54900,
          compareAtPricePaise: 79900,
          inventoryQty: 25,
          isDefault: true,
        },
        {
          name: '800g Value Pack Jar',
          sku: 'VV-HNY-005-800G',
          pricePaise: 99900,
          compareAtPricePaise: 145000,
          inventoryQty: 15,
          isDefault: false,
        },
      ],
    },
    {
      name: 'Organic Ashwagandha KSM-66 Root Powder',
      slug: 'organic-ashwagandha-ksm-66-powder',
      sku: 'VV-ASH-006',
      barcode: '8901234560067',
      categoryId: categoryMap['herbal-churnas'],
      shortDescription: 'Full-spectrum organic root powder standardized to 5% withanolides for deep restorative sleep, stress reduction, and vitality.',
      fullDescription: `Crafted exclusively from certified organic Withania somnifera roots cultivated in semi-arid tracts of Madhya Pradesh.

Processed without chemical solvents following classical Ayurvedic decoction principles, ensuring the complete therapeutic matrix of the root is preserved.

• Standardized full-spectrum root extract
• Promotes cortisol balance and nervous system rejuvenation
• Free from heavy metals, pesticides, and microbial contaminants`,
      regularPricePaise: 49900, // ₹499
      sellingPricePaise: 39900, // ₹399
      compareAtPricePaise: 59900, // ₹599
      inventoryQty: 60,
      lowStockThreshold: 10,
      status: 'PUBLISHED',
      availability: 'IN_STOCK',
      isFeatured: false,
      isBestseller: true,
      isNewArrival: false,
      isSale: false,
      farmOrigin: 'Neemuch Certified Organic Farms, Madhya Pradesh',
      harvestInfo: 'Winter Root Harvest 2024',
      grade: 'Full-Spectrum Organic Root Grade',
      netWeight: '250g / 500g Resealable Kraft Pouch',
      batchNumber: 'VV-ASH-24-N04',
      fssaiNumber: '10024011000918',
      expiryDate: '18 Months from Date of Packaging',
      storageInstructions: 'Keep zipper sealed tightly in a dry cabinet away from steam.',
      shelfLife: '18 Months',
      ingredients: '100% Certified Organic Ashwagandha (Withania somnifera) Root Powder',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=1000&q=85',
          alt: 'Pure Ashwagandha Root Powder in ceramic dish',
          isPrimary: true,
          sortOrder: 1,
        },
      ],
      variants: [
        {
          name: '250g Kraft Seal Pouch',
          sku: 'VV-ASH-006-250G',
          pricePaise: 39900,
          compareAtPricePaise: 59900,
          inventoryQty: 38,
          isDefault: true,
        },
        {
          name: '500g Eco Refill Pack',
          sku: 'VV-ASH-006-500G',
          pricePaise: 69900,
          compareAtPricePaise: 99900,
          inventoryQty: 22,
          isDefault: false,
        },
      ],
    },
    {
      name: 'Kumkumadi Tailam Miraculous Beauty Serum',
      slug: 'kumkumadi-tailam-miraculous-beauty-serum',
      sku: 'VV-KUM-007',
      barcode: '8901234560074',
      categoryId: categoryMap['saffron-botanicals'],
      shortDescription: 'Classical 26-herb Ayurvedic night oil formulated with Pure Kashmiri Saffron, Sandalwood, and Goat Milk for luminous skin.',
      fullDescription: `Described in the ancient Ashtanga Hridaya as the quintessential beauty nectar (Kanti Vardhana), Kumkumadi Tailam is traditionally slow-cooked for days over low flame.

Contains pure Kashmiri Saffron, Red Sandalwood, Lotus stamen, Vetiver, and Indian Madder infused into cold-pressed Sesame oil.

• Illuminates complexion and fades blemishes naturally
• 100% Natural, Cruelty-Free, Paraben-Free, Mineral Oil-Free
• Recommended use: 2-3 drops warmed between palms and gently pressed onto face before sleep`,
      regularPricePaise: 189900, // ₹1,899
      sellingPricePaise: 149900, // ₹1,499
      compareAtPricePaise: 219900, // ₹2,199
      inventoryQty: 18,
      lowStockThreshold: 5,
      status: 'PUBLISHED',
      availability: 'IN_STOCK',
      isFeatured: true,
      isBestseller: false,
      isNewArrival: true,
      isSale: true,
      farmOrigin: 'Kerala & Kashmir Herb Collectives',
      harvestInfo: 'Traditional Kashaya Cooking Process',
      grade: 'Ayurvedic Pharmacopoeia Standard',
      netWeight: '15ml / 30ml Frosted Amber Dropper Bottle',
      batchNumber: 'VV-KUM-24-01A',
      fssaiNumber: '10024011000918',
      expiryDate: '24 Months from Mfd',
      storageInstructions: 'Store in cool place. Natural herbal sediment may settle; shake well before use.',
      shelfLife: '2 Years',
      ingredients: 'Kashmiri Saffron, Sandalwood, Manjistha, Yashtimadhu, Padmaka, Ushira, Pure Sesame Oil, Goat Milk',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1608248597359-269666e85741?auto=format&fit=crop&w=1000&q=85',
          alt: 'Kumkumadi Tailam Golden Face Oil with Dropper',
          isPrimary: true,
          sortOrder: 1,
        },
      ],
      variants: [
        {
          name: '15ml Luxury Dropper Bottle',
          sku: 'VV-KUM-007-15ML',
          pricePaise: 149900,
          compareAtPricePaise: 219900,
          inventoryQty: 12,
          isDefault: true,
        },
        {
          name: '30ml Collector Edition',
          sku: 'VV-KUM-007-30ML',
          pricePaise: 259900,
          compareAtPricePaise: 380000,
          inventoryQty: 6,
          isDefault: false,
        },
      ],
    },
    {
      name: 'Triphala Organic Churna (Equal Ratio Myrobalans)',
      slug: 'triphala-organic-churna',
      sku: 'VV-TRP-008',
      barcode: '8901234560081',
      categoryId: categoryMap['herbal-churnas'],
      shortDescription: 'Equal-part blend of wild Haritaki, Bibhitaki, and Amalaki fruits. Gentle daily detox and digestive harmony.',
      fullDescription: `The revered tridoshic balancer of Ayurvedic medicine. Our Triphala is compounded exclusively from fresh fruit rinds, systematically removing the seeds before stone-milling.

• Promotes natural peristalsis and gentle colon cleansing
• High natural antioxidant polyphenols
• Certified organic and heavy metal tested`,
      regularPricePaise: 34900, // ₹349
      sellingPricePaise: 27900, // ₹279
      compareAtPricePaise: 42000, // ₹420
      inventoryQty: 45,
      lowStockThreshold: 10,
      status: 'PUBLISHED',
      availability: 'IN_STOCK',
      isFeatured: false,
      isBestseller: false,
      isNewArrival: false,
      isSale: false,
      farmOrigin: 'Madhya Pradesh Forest Collectives',
      harvestInfo: 'Fresh Season Harvest',
      grade: 'Seedless Fruit Rind Pure Churna',
      netWeight: '200g Eco Pouch',
      batchNumber: 'VV-TRP-24-T01',
      fssaiNumber: '10024011000918',
      expiryDate: '18 Months from Packaging',
      storageInstructions: 'Store in airtight container after opening.',
      shelfLife: '18 Months',
      ingredients: 'Equal parts Organic Haritaki, Bibhitaki, and Amalaki fruit rinds',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=85',
          alt: 'Triphala Churna Botanical Powder',
          isPrimary: true,
          sortOrder: 1,
        },
      ],
      variants: [
        {
          name: '200g Resealable Pouch',
          sku: 'VV-TRP-008-200G',
          pricePaise: 27900,
          compareAtPricePaise: 42000,
          inventoryQty: 45,
          isDefault: true,
        },
      ],
    },
  ];

  for (const prod of products) {
    const { images, variants, reviews, ...prodData } = prod;

    const createdProduct = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: prodData,
      create: prodData,
    });

    // Delete existing images & variants to avoid duplicates on re-seed
    await prisma.productImage.deleteMany({ where: { productId: createdProduct.id } });
    await prisma.productVariant.deleteMany({ where: { productId: createdProduct.id } });
    await prisma.review.deleteMany({ where: { productId: createdProduct.id } });

    // Insert Images
    if (images && images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((img) => ({
          ...img,
          productId: createdProduct.id,
        })),
      });
    }

    // Insert Variants
    if (variants && variants.length > 0) {
      await prisma.productVariant.createMany({
        data: variants.map((v) => ({
          ...v,
          productId: createdProduct.id,
        })),
      });
    }

    // Insert Reviews
    if (reviews && reviews.length > 0) {
      await prisma.review.createMany({
        data: reviews.map((r) => ({
          ...r,
          productId: createdProduct.id,
          isApproved: true,
          isVerifiedPurchase: true,
        })),
      });
    }
  }

  // 5. Coupons
  const couponsData = [
    {
      code: 'VEDIK15',
      description: '15% Off on orders above ₹1,200',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderValuePaise: 120000,
      maxDiscountPaise: 50000, // Max ₹500 off
      isActive: true,
    },
    {
      code: 'HERBAL200',
      description: 'Flat ₹200 Off on orders above ₹1,499',
      discountType: 'FIXED_AMOUNT',
      discountValue: 20000, // ₹200 off
      minOrderValuePaise: 149900,
      isActive: true,
    },
    {
      code: 'FIRST10',
      description: '10% Off for first time botanical seekers',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValuePaise: 69900,
      maxDiscountPaise: 25000,
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  // 6. Homepage Configurable Sections
  const homepageSections = [
    {
      sectionKey: 'HERO_BANNER',
      title: 'Sacred Botanicals. Traceable Harvests.',
      subtitle: 'Pure Himalayan Shilajit, Kashmiri Saffron, and Wood-Pressed Kachi Ghani Oils handcrafted according to classical Vedic Shastras.',
      isEnabled: true,
      displayOrder: 1,
      content: JSON.stringify({
        badge: '100% Farm-Traceable & Lab-Certified',
        ctaPrimaryText: 'Explore Sacred Catalog',
        ctaPrimaryLink: '/shop',
        ctaSecondaryText: 'Our Farm Sourcing Story',
        ctaSecondaryLink: '/about',
        bgImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1600&q=85',
        trustPills: [
          'High Altitude Harvests (16,000+ ft)',
          'Wood-Pressed at Low RPM',
          'Heavy Metal Tested & FSSAI Certified',
          'Direct Fair Farmer Partnerships',
        ],
      }),
    },
    {
      sectionKey: 'BRAND_STORY',
      title: 'Purity Without Compromise',
      subtitle: 'From pristine Himalayan cliffs and indigenous Kerala coastal groves directly to your home.',
      isEnabled: true,
      displayOrder: 2,
      content: JSON.stringify({
        quote: 'Ayurveda is not merely medicine; it is reverence for the intelligence of nature.',
        pillars: [
          {
            title: 'Zero Chemical Extraction',
            description: 'No hexane, petroleum distillates, or artificial stabilizers are ever used.',
          },
          {
            title: 'FSSAI & NABL Lab Verified',
            description: 'Every batch undergoes rigorous ICP-MS testing for heavy metals and pesticide residues.',
          },
          {
            title: 'Sustainably Wildcrafted',
            description: 'Harvested in harmony with seasonal cycles, leaving parent ecosystems intact.',
          },
        ],
      }),
    },
    {
      sectionKey: 'FAQ_SECTION',
      title: 'Frequently Asked Questions',
      subtitle: 'Transparency is our foundational principle. Here is everything you need to know.',
      isEnabled: true,
      displayOrder: 3,
      content: JSON.stringify({
        faqs: [
          {
            q: 'How do I know your Himalayan Shilajit is authentic?',
            a: 'Authentic Shilajit dissolves completely in warm water or milk without leaving gritty sediment, smells earthy with a smoky undertone, and hardens when cold while becoming pliable at body temperature. Each jar comes with a batch lab report showing >75% fulvic acid.',
          },
          {
            q: 'What is the meaning of wood-pressed (Marachekku) oil?',
            a: 'Unlike modern industrial expellers that generate high friction temperatures (up to 120°C) which denature fatty acids, wood-pressing uses slow pestles in wood churns where temperature never exceeds 38°C, preserving all vital micronutrients and aromas.',
          },
          {
            q: 'How long does delivery take across India?',
            a: 'We dispatch all orders within 24 hours. Metro cities receive delivery in 2-3 business days, while other locations typically arrive in 3-5 business days with live SMS and tracking updates.',
          },
          {
            q: 'What is your cancellation and return policy?',
            a: 'Unopened products in their original tamper-evident packaging can be returned within 7 days of delivery. If a product arrives damaged, we offer immediate replacement or full refund.',
          },
        ],
      }),
    },
  ];

  for (const s of homepageSections) {
    await prisma.homepageSection.upsert({
      where: { sectionKey: s.sectionKey },
      update: s,
      create: s,
    });
  }

  // 7. Seed Sample Orders for Admin Analytics
  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    const sampleOrders = [
      {
        orderNumber: 'VV-2024-1001',
        customerName: 'Raghavan Iyer',
        customerEmail: 'raghavan.iyer@example.com',
        customerPhone: '+91 98401 23456',
        shippingAddress: JSON.stringify({
          fullName: 'Raghavan Iyer',
          phone: '+91 98401 23456',
          addressLine1: 'Plot 42, Green Glen Layout, Bellandur',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560103',
        }),
        subtotalPaise: 279800,
        discountPaise: 20000,
        couponCode: 'HERBAL200',
        shippingPaise: 0,
        taxPaise: 12990,
        totalPaise: 272790,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        paymentMethod: 'RAZORPAY',
        razorpayPaymentId: 'pay_demo_9921',
        trackingNumber: 'DELHIVERY-98127391',
        courierName: 'Delhivery Express',
      },
      {
        orderNumber: 'VV-2024-1002',
        customerName: 'Ananya Deshmukh',
        customerEmail: 'ananya.d@example.com',
        customerPhone: '+91 98200 87654',
        shippingAddress: JSON.stringify({
          fullName: 'Ananya Deshmukh',
          phone: '+91 98200 87654',
          addressLine1: 'Flat 9B, Sea View Apts, Worli Sea Face',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400030',
        }),
        subtotalPaise: 139900,
        discountPaise: 0,
        shippingPaise: 0,
        taxPaise: 6995,
        totalPaise: 146895,
        status: 'SHIPPED',
        paymentStatus: 'PAID',
        paymentMethod: 'RAZORPAY',
        razorpayPaymentId: 'pay_demo_9922',
        trackingNumber: 'BLUEDART-5544129',
        courierName: 'Blue Dart',
      },
      {
        orderNumber: 'VV-2024-1003',
        customerName: 'Vikramjit Singh',
        customerEmail: 'vikram.singh@example.com',
        customerPhone: '+91 98111 54321',
        shippingAddress: JSON.stringify({
          fullName: 'Vikramjit Singh',
          phone: '+91 98111 54321',
          addressLine1: 'House 14, Sector 15-A',
          city: 'Chandigarh',
          state: 'Punjab',
          pincode: '160015',
        }),
        subtotalPaise: 99900,
        discountPaise: 0,
        shippingPaise: 0,
        taxPaise: 4995,
        totalPaise: 104895,
        status: 'CONFIRMED',
        paymentStatus: 'PENDING',
        paymentMethod: 'CASH_ON_DELIVERY',
      },
    ];

    for (const ord of sampleOrders) {
      await prisma.order.create({ data: ord });
    }
  }

  console.log('✅ Database successfully seeded with Vedik Vana production catalog!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

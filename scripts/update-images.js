const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updates = [
    { slug: 'pure-himalayan-shilajit-resin', url: '/images/products/shilajit.jpg', alt: 'Pure Himalayan Shilajit Resin in Amber Jar' },
    { slug: 'organic-kashmiri-mongra-saffron', url: '/images/products/saffron.jpg', alt: 'Pure Kashmiri Mongra Saffron Heritage Tin' },
    { slug: 'cold-pressed-wood-pressed-virgin-coconut-oil', url: '/images/products/coconut_oil.jpg', alt: 'Wood-Pressed Virgin Coconut Oil' },
    { slug: 'vedic-chyawanprash-wild-herbs-amla', url: '/images/products/chyawanprash.jpg', alt: 'Vedic Chyawanprash Wild Herbs and Forest Amla' },
  ];
  for (const u of updates) {
    const prod = await prisma.product.findUnique({ where: { slug: u.slug } });
    if (prod) {
      await prisma.productImage.deleteMany({ where: { productId: prod.id } });
      await prisma.productImage.create({
        data: { productId: prod.id, url: u.url, alt: u.alt, isPrimary: true, sortOrder: 0 }
      });
      console.log('Updated image for', prod.name);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

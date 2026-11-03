const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

dotenv.config();

const sampleCategories = [
  { name: 'Elektronika', slug: 'elektronika' },
  { name: 'Kiyim va Moda', slug: 'kiyim-va-moda' },
  { name: 'Uy va Oshxona', slug: 'uy-va-oshxona' },
  { name: 'Gadjetlar va Aksessuarlar', slug: 'gadjetlar-va-aksessuarlar' },
];

const sampleProducts = [
  {
    title: 'Aura Sim-siz Shovqinni Bosuvchi Quloqchinlar',
    description: 'Kristaldek tiniq fazoviy audio, faol shovqinni pasaytirish (ANC), 40 soatlik batareya quvvati va yumshoq xotirali quloq yostiqchalari.',
    price: 199.99,
    categoryName: 'Elektronika',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  },
  {
    title: 'Minimalist Mexanik Klaviatura (RGB)',
    description: 'Hot-swappable taktil tugmalar, aviatsiya darajasidagi alyuminiy korpus va dasturlanadigan RGB chiroqlari.',
    price: 129.50,
    categoryName: 'Gadjetlar va Aksessuarlar',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
  },
  {
    title: 'Artisan Keramik Qahva Qaynatgich va Chini To\'plami',
    description: 'Qora mot qoplamali qo\'lda ishlangan keramik idish, qahvani aniq va maromida damlash uchun maxsus ingichka jo\'mrak.',
    price: 64.00,
    categoryName: 'Uy va Oshxona',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
  },
  {
    title: 'Tabiiy Charmdan Tayyorlangan Zamonaviy Ryukzak',
    description: 'Italiya tabiiy charmi, suv o\'tkazmaydigan qoplama va 16 dyuymli noutbuk uchun himoyalangan maxsus bo\'lma.',
    price: 159.00,
    categoryName: 'Kiyim va Moda',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
  },
  {
    title: 'Ultra-Keng 4K Egri Monitor (Ish va O\'yin uchun)',
    description: '34 dyuymli egri ekran, 144Hz yangilanish tezligi, HDR400 va professional ranglar aniqligi (99% sRGB).',
    price: 499.00,
    categoryName: 'Elektronika',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
  },
  {
    title: '100% Organik Paxtadan Qulay Xudi (Oversize)',
    description: 'GOTS sertifikatiga ega paxta, yuqori sifatli ichki issiq mato va kundalik kiyish uchun qulay bichim.',
    price: 75.00,
    categoryName: 'Kiyim va Moda',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
  },
  {
    title: 'Titan Aqlli Fitnes va Salomatlik Soati',
    description: 'Yurak urishi, SpO2 va uyqu monitoringi, AMOLED sapfir sensorli ekran, 14 kunlik batareya quvvati.',
    price: 249.99,
    categoryName: 'Gadjetlar va Aksessuarlar',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
  },
  {
    title: 'Smart Ambient Quyosh Botishi Chirog\'i va Dinamik',
    description: 'Ilova orqali boshqariladigan quyosh botishi ranglari va 360° stereo Bluetooth dinamik tizimi.',
    price: 48.00,
    categoryName: 'Uy va Oshxona',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
  },
];

const importData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    console.log('[Seeder] Baza tozalandi.');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPassword = await bcrypt.hash('user123', 10);

    await User.create({
      name: 'Tizim Administratori',
      email: 'admin@ministore.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
    });

    await User.create({
      name: 'Demo Xaridor',
      email: 'user@ministore.com',
      password: hashedUserPassword,
      role: 'user',
      isVerified: true,
    });

    console.log('[Seeder] Admin yaratildi: admin@ministore.com / admin123');
    console.log('[Seeder] Xaridor yaratildi: user@ministore.com / user123');

    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`[Seeder] ${createdCategories.length} ta kategoriya yaratildi.`);

    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    const productsToInsert = sampleProducts.map((p) => ({
      title: p.title,
      description: p.description,
      price: p.price,
      stock: p.stock,
      image: p.image,
      category: categoryMap[p.categoryName] || createdCategories[0]._id,
    }));

    await Product.insertMany(productsToInsert);
    console.log(`[Seeder] ${productsToInsert.length} ta mahsulot yaratildi.`);

    console.log('[Seeder] Ma\'lumotlar muvaffaqiyatli yuklandi! 🎉');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Xatosi]: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    console.log('[Seeder] Barcha ma\'lumotlar o\'chirildi.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Xatosi]: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

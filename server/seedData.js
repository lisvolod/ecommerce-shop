import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();

const seedUsers = [
  {
    email: 'admin@shop.com',
    password: 'admin123',
    fullName: 'Адміністратор',
    phone: '+380501234567',
    address: 'Київ, вул. Хрещатик, 1',
    role: 'admin'
  },
  {
    email: 'customer@shop.com',
    password: 'customer123',
    fullName: 'Іван Петренко',
    phone: '+380507654321',
    address: 'Львів, вул. Свободи, 10',
    role: 'customer'
  }
];

const seedCategories = [
  { name: 'Процесори', description: 'Процесори Intel та AMD' },
  { name: 'Відеокарти', description: 'Відеокарти NVIDIA та AMD' },
  { name: 'Материнські плати', description: 'Материнські плати різних виробників' },
  { name: 'Блоки живлення', description: 'Блоки живлення різної потужності' }
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('🗑️  Очищення бази даних...');
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    console.log('Створення користувачів...');
    const users = await User.create(seedUsers);
    console.log(`Створено ${users.length} користувачів`);

    console.log('Створення категорій...');
    const categories = await Category.create(seedCategories);
    console.log(`Створено ${categories.length} категорій`);

    // Продукти по 5 на кожну категорію
    const seedProducts = [
      // Процесори
      { name: 'Intel Core i9-13900K', description: 'Процесор Intel Core i9-13900K, 24 ядра, 32 потоки, 3.0-5.8 ГГц, Socket 1700', price: 18999, discount: 10, stock: 15, image: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400', category: categories[0]._id },
      { name: 'AMD Ryzen 9 7950X', description: 'Процесор AMD Ryzen 9 7950X, 16 ядер, 32 потоки, 4.5-5.7 ГГц, Socket AM5', price: 21999, discount: 0, stock: 8, image: 'https://images.unsplash.com/photo-1591799265444-d66432b91588?w=400', category: categories[0]._id },
      { name: 'Intel Core i7-13700K', description: 'Процесор Intel Core i7-13700K, 16 ядер, 24 потоки, 3.4-5.4 ГГц, Socket 1700', price: 14999, discount: 5, stock: 20, image: 'https://images.unsplash.com/photo-1555680490-e46a76d8d609?w=400', category: categories[0]._id },
      { name: 'AMD Ryzen 7 7700X', description: 'Процесор AMD Ryzen 7 7700X, 8 ядер, 16 потоків, 4.5-5.4 ГГц, Socket AM5', price: 12999, discount: 15, stock: 12, image: 'https://images.unsplash.com/photo-1591238868477-dea5a2c3a42a?w=400', category: categories[0]._id },
      { name: 'Intel Core i5-13600K', description: 'Процесор Intel Core i5-13600K, 14 ядер, 20 потоків, 3.5-5.1 ГГц, Socket 1700', price: 10999, discount: 0, stock: 25, image: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400', category: categories[0]._id },

      // Відеокарти
      { name: 'NVIDIA RTX 4090', description: 'Відеокарта NVIDIA GeForce RTX 4090, 24GB GDDR6X, 384-bit, PCI-E 4.0', price: 65999, discount: 0, stock: 5, image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400', category: categories[1]._id },
      { name: 'AMD Radeon RX 7900 XTX', description: 'Відеокарта AMD Radeon RX 7900 XTX, 24GB GDDR6, 384-bit, PCI-E 4.0', price: 35999, discount: 10, stock: 7, image: 'https://images.unsplash.com/photo-1591238868477-dea5a2c3a42a?w=400', category: categories[1]._id },
      { name: 'NVIDIA RTX 4080', description: 'Відеокарта NVIDIA GeForce RTX 4080, 16GB GDDR6X, 256-bit, PCI-E 4.0', price: 44999, discount: 5, stock: 10, image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400', category: categories[1]._id },
      { name: 'NVIDIA RTX 4070 Ti', description: 'Відеокарта NVIDIA GeForce RTX 4070 Ti, 12GB GDDR6X, 192-bit, PCI-E 4.0', price: 29999, discount: 0, stock: 15, image: 'https://images.unsplash.com/photo-1591238868477-dea5a2c3a42a?w=400', category: categories[1]._id },
      { name: 'AMD Radeon RX 7800 XT', description: 'Відеокарта AMD Radeon RX 7800 XT, 16GB GDDR6, 256-bit, PCI-E 4.0', price: 19999, discount: 20, stock: 18, image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400', category: categories[1]._id },

      // Материнські плати
      { name: 'ASUS ROG MAXIMUS Z790 HERO', description: 'Материнська плата ASUS ROG MAXIMUS Z790 HERO, Socket 1700, Intel Z790, DDR5', price: 17999, discount: 0, stock: 6, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400', category: categories[2]._id },
      { name: 'MSI MPG X670E CARBON', description: 'Материнська плата MSI MPG X670E CARBON WIFI, Socket AM5, AMD X670E, DDR5', price: 15999, discount: 10, stock: 8, image: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400', category: categories[2]._id },
      { name: 'GIGABYTE Z790 AORUS MASTER', description: 'Материнська плата GIGABYTE Z790 AORUS MASTER, Socket 1700, Intel Z790, DDR5', price: 19999, discount: 5, stock: 4, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400', category: categories[2]._id },
      { name: 'ASRock B650 Pro RS', description: 'Материнська плата ASRock B650 Pro RS, Socket AM5, AMD B650, DDR5', price: 6999, discount: 0, stock: 20, image: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400', category: categories[2]._id },
      { name: 'ASUS TUF Gaming B760', description: 'Материнська плата ASUS TUF Gaming B760-PLUS WIFI, Socket 1700, Intel B760, DDR5', price: 7999, discount: 15, stock: 15, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400', category: categories[2]._id },

      // Блоки живлення
      { name: 'Corsair RM1000x', description: 'Блок живлення Corsair RM1000x, 1000W, 80+ Gold, Modular', price: 5999, discount: 0, stock: 12, image: 'https://images.unsplash.com/photo-1555680490-e46a76d8d609?w=400', category: categories[3]._id },
      { name: 'be quiet! Dark Power Pro 12', description: 'Блок живлення be quiet! Dark Power Pro 12, 1200W, 80+ Titanium, Modular', price: 8999, discount: 10, stock: 7, image: 'https://images.unsplash.com/photo-1591238868477-dea5a2c3a42a?w=400', category: categories[3]._id },
      { name: 'Seasonic PRIME TX-1000', description: 'Блок живлення Seasonic PRIME TX-1000, 1000W, 80+ Titanium, Modular', price: 9499, discount: 0, stock: 5, image: 'https://images.unsplash.com/photo-1555680490-e46a76d8d609?w=400', category: categories[3]._id },
      { name: 'EVGA SuperNOVA 850 G6', description: 'Блок живлення EVGA SuperNOVA 850 G6, 850W, 80+ Gold, Modular', price: 4499, discount: 5, stock: 18, image: 'https://images.unsplash.com/photo-1591238868477-dea5a2c3a42a?w=400', category: categories[3]._id },
      { name: 'Thermaltake Toughpower GF1', description: 'Блок живлення Thermaltake Toughpower GF1, 750W, 80+ Gold, Modular', price: 3999, discount: 20, stock: 22, image: 'https://images.unsplash.com/photo-1555680490-e46a76d8d609?w=400', category: categories[3]._id }
    ];

    console.log('Створення товарів...');
    const products = await Product.create(seedProducts);
    console.log(`Створено ${products.length} товарів`);

    console.log(`
      SEED УСПІШНО ЗАВЕРШЕНО!                           
      Користувачі:                                      
      admin@shop.com / admin123 (admin)                
      customer@shop.com / customer123 (customer)       
                                                       
      Категорії: ${categories.length}                                     
      Товари: ${products.length}                                        
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Помилка seed:', error);
    process.exit(1);
  }
};

seedData();

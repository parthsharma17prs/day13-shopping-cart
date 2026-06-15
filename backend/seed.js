import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const products = [
  {
    name: 'AURA Ring Gen 3',
    description: 'Track your sleep, activity, readiness, and heart rate with premium accuracy and design.',
    price: 299.99,
    category: 'Electronics',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1628149455678-16f37bc392f4?auto=format&fit=crop&q=80&w=400',
    isActive: true
  },
  {
    name: 'Nordic Knit Sweater',
    description: 'Cozy, warm woolen knit sweater perfect for winter seasons and outdoor comfort.',
    price: 79.50,
    category: 'Clothing',
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1574164904299-3a102b110380?auto=format&fit=crop&q=80&w=400',
    isActive: true
  },
  {
    name: 'Noise Cancelling Headphones',
    description: 'Experience deep, immersive sound and advanced active noise control.',
    price: 199.99,
    category: 'Electronics',
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
    isActive: true
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Eco-friendly vacuum insulated water bottle keeping drinks cold for 24 hours.',
    price: 24.99,
    category: 'Home',
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400',
    isActive: true
  },
  {
    name: 'Organic Matcha Green Tea',
    description: 'Premium ceremonial grade matcha green tea powder sourced directly from Uji, Japan.',
    price: 29.99,
    category: 'Food',
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=400',
    isActive: true
  }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/day11_auth')
  .then(async () => {
    console.log('Connected to DB for seeding...');
    await Product.deleteMany({});
    console.log('Cleared existing products.');
    await Product.insertMany(products);
    console.log('Successfully seeded products!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error seeding data:', err);
    process.exit(1);
  });

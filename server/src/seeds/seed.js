require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

const sampleProducts = [
  {
    name: 'Classic Linen Blazer',
    description: 'Tailored breathable linen blazer designed for sharp summer layering and effortless smart-casual styling.',
    price: 3499,
    category: 'blazers',
    brand: 'FitKart Atelier',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Beige', 'White'],
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=700&auto=format&fit=crop'],
    stockQuantity: 50,
  },
  {
    name: 'Double-Breasted Wool Blazer',
    description: 'Structured wool-blend blazer with peak lapels and satin lining for formal and evening occasions.',
    price: 4999,
    category: 'blazers',
    brand: 'Modern Classics',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Charcoal', 'Black', 'Camel'],
    images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=700&auto=format&fit=crop'],
    stockQuantity: 35,
  },
  {
    name: 'Silk Evening Dress',
    description: 'Fluid mulberry-silk midi dress with a subtle bias cut that drapes gracefully on every silhouette.',
    price: 4599,
    category: 'dresses',
    brand: 'Elegance',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Burgundy', 'Emerald'],
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700&auto=format&fit=crop'],
    stockQuantity: 40,
  },
  {
    name: 'Floral Summer Dress',
    description: 'Light and breezy floral wrap dress crafted from breathable viscose for warm-weather outings.',
    price: 2499,
    category: 'dresses',
    brand: 'FitKart Studio',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Floral Pink', 'Floral Blue'],
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&auto=format&fit=crop'],
    stockQuantity: 30,
  },
  {
    name: 'Pleated Satin Midi Dress',
    description: 'Refined pleated satin dress with a cinched waist and soft movement from day to dinner.',
    price: 3799,
    category: 'dresses',
    brand: 'Elegance',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Cream', 'Navy', 'Olive'],
    images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=700&auto=format&fit=crop'],
    stockQuantity: 28,
  },
  {
    name: 'Tailored Wool Trousers',
    description: 'Precision-cut wool-blend trousers with clean front pleats and a comfortable mid-rise waist.',
    price: 2699,
    category: 'trousers',
    brand: 'Modern Classics',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Charcoal', 'Navy', 'Black'],
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=700&auto=format&fit=crop'],
    stockQuantity: 60,
  },
  {
    name: 'Slim Fit Chinos',
    description: 'Stretch-cotton twill chinos engineered for all-day comfort and a crisp tapered leg.',
    price: 1899,
    category: 'trousers',
    brand: 'Essential',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Khaki', 'Navy', 'Olive'],
    images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=700&auto=format&fit=crop'],
    stockQuantity: 55,
  },
  {
    name: 'High-Waist Wide-Leg Trousers',
    description: 'Elongating high-rise wide-leg trousers with fluid drape for polished office or weekend wear.',
    price: 2399,
    category: 'trousers',
    brand: 'FitKart Atelier',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Beige', 'Black', 'Brown'],
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=700&auto=format&fit=crop'],
    stockQuantity: 42,
  },
  {
    name: 'Cotton Casual Shirt',
    description: 'Soft combed-cotton Oxford shirt with a relaxed collar and breathable weave for everyday wear.',
    price: 1499,
    category: 'shirts',
    brand: 'Essential',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Light Blue', 'Pink'],
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=700&auto=format&fit=crop'],
    stockQuantity: 80,
  },
  {
    name: 'Formal White Shirt',
    description: 'Crisp Egyptian-cotton poplin dress shirt tailored for boardrooms and formal events.',
    price: 1799,
    category: 'shirts',
    brand: 'Modern Classics',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White'],
    images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=700&auto=format&fit=crop'],
    stockQuantity: 70,
  },
  {
    name: 'Relaxed Linen Resort Shirt',
    description: 'Airy short-sleeve linen shirt with mother-of-pearl buttons for warm weekends.',
    price: 1699,
    category: 'shirts',
    brand: 'FitKart Studio',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Olive', 'Navy'],
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&auto=format&fit=crop'],
    stockQuantity: 48,
  },
  {
    name: 'Cashmere Crewneck Sweater',
    description: 'Ultra-soft brushed cashmere knit with ribbed cuffs for refined cold-weather warmth.',
    price: 3999,
    category: 'sweaters',
    brand: 'Luxe Knit',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Gray', 'Camel'],
    images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=700&auto=format&fit=crop'],
    stockQuantity: 35,
  },
  {
    name: 'Merino Turtleneck Knit',
    description: 'Fine-gauge merino wool turtleneck that layers cleanly under blazers and overcoats.',
    price: 2899,
    category: 'sweaters',
    brand: 'Luxe Knit',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Charcoal', 'Burgundy'],
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=700&auto=format&fit=crop'],
    stockQuantity: 40,
  },
  {
    name: 'Selvedge Denim Jacket',
    description: 'Classic trucker-cut denim jacket crafted from 12oz washed cotton with antique brass hardware.',
    price: 2999,
    category: 'jackets',
    brand: 'FitKart Studio',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Light Wash', 'Dark Wash', 'Black'],
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&auto=format&fit=crop'],
    stockQuantity: 45,
  },
  {
    name: 'Suede Bomber Jacket',
    description: 'Supple faux-suede bomber with rib-knit trim and dual welt pockets for elevated street style.',
    price: 4299,
    category: 'jackets',
    brand: 'Edge',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Camel', 'Olive', 'Black'],
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&auto=format&fit=crop'],
    stockQuantity: 25,
  },
  {
    name: 'Wool Blend Overcoat',
    description: 'Full-length tailored overcoat in double-faced wool blend for timeless winter sophistication.',
    price: 5999,
    category: 'outerwear',
    brand: 'FitKart Atelier',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Camel', 'Charcoal', 'Black'],
    images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=700&auto=format&fit=crop'],
    stockQuantity: 20,
  },
  {
    name: 'Classic Trench Coat',
    description: 'Water-resistant cotton gabardine trench coat with storm flap and belted waist.',
    price: 5499,
    category: 'outerwear',
    brand: 'Modern Classics',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Beige', 'Khaki', 'Navy'],
    images: ['https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=700&auto=format&fit=crop'],
    stockQuantity: 22,
  },
  {
    name: 'Pima Cotton Polo T-Shirt',
    description: 'Breathable pique-knit polo with a tailored collar and clean three-button placket.',
    price: 1299,
    category: 'tops',
    brand: 'Essential',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Navy', 'Black', 'Red'],
    images: ['https://images.unsplash.com/photo-1625910513413-5fc421e3e681?w=700&auto=format&fit=crop'],
    stockQuantity: 120,
  },
  {
    name: 'Ribbed Mock-Neck Top',
    description: 'Fitted stretch-modal mock-neck top that pairs effortlessly with high-waist trousers or skirts.',
    price: 1199,
    category: 'tops',
    brand: 'FitKart Studio',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Cream', 'Burgundy'],
    images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=700&auto=format&fit=crop'],
    stockQuantity: 65,
  },
  {
    name: 'Full-Grain Leather Belt',
    description: 'Hand-finished full-grain leather belt with a brushed brass buckle.',
    price: 1199,
    category: 'accessories',
    brand: 'FitKart Atelier',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Brown', 'Black'],
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&auto=format&fit=crop'],
    stockQuantity: 100,
  },
  {
    name: 'Cashmere Blend Scarf',
    description: 'Soft fringed winter scarf woven from a warm cashmere-wool blend.',
    price: 1599,
    category: 'accessories',
    brand: 'Luxe Knit',
    sizes: ['One Size'],
    colors: ['Camel', 'Gray', 'Navy'],
    images: ['https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=700&auto=format&fit=crop'],
    stockQuantity: 45,
  },
  {
    name: 'Structured Leather Tote',
    description: 'Minimalist everyday leather tote with padded laptop sleeve and reinforced shoulder straps.',
    price: 4499,
    category: 'accessories',
    brand: 'FitKart Atelier',
    sizes: ['One Size'],
    colors: ['Black', 'Brown', 'Beige'],
    images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=700&auto=format&fit=crop'],
    stockQuantity: 30,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Seed admin (only if not exists)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@fitkart.com';
    const adminPassword = process.env.ADMIN_PASSWORD || '1234';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({ email: adminEmail, password: adminPassword, fullName: 'Fitkart Admin', role: 'admin' });
      console.log(`Admin created: ${adminEmail}`);
    } else {
      console.log('Admin already exists, skipping');
    }

    // Upsert sample products by name so new items are added cleanly without duplicating existing ones
    let inserted = 0;
    for (const p of sampleProducts) {
      const exists = await Product.findOne({ name: p.name });
      if (!exists) {
        await Product.create({ ...p, isActive: true });
        inserted++;
      }
    }
    console.log(`${inserted} new sample products inserted (${sampleProducts.length} total catalog items checked)`);

    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();

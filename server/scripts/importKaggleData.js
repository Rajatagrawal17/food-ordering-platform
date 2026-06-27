/**
 * server/scripts/importKaggleData.js
 *
 * Imports real restaurant + dish data from two CSVs placed at:
 *   server/data/restaurants.csv
 *   server/data/dishes.csv
 *
 * Run via:  npm run seed:kaggle  (from repo root)
 *           node scripts/importKaggleData.js  (from server/)
 *
 * The script INSPECTS the actual CSV headers before mapping — it does NOT
 * assume specific column names, since Kaggle datasets vary by version.
 */

import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { Restaurant } from '../models/Restaurant.js';
import { Food } from '../models/Food.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { Review } from '../models/Review.js';
import { Category } from '../models/Category.js';
import { PaymentTransaction } from '../models/PaymentTransaction.js';
import { getRedisClient } from '../config/redis.js';
import { cacheService } from '../services/cacheService.js';
import { foodService } from '../services/foodService.js';
import { restaurantService } from '../services/restaurantService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Paths ──────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, '../data');
const RESTAURANTS_CSV = path.join(DATA_DIR, 'restaurants.csv');
const DISHES_CSV = path.join(DATA_DIR, 'dishes.csv');

// ─── Limits ─────────────────────────────────────────────────────────────────

const MAX_RESTAURANTS = 40;
const MAX_DISHES_PER_RESTAURANT = 8;

// ─── Static assets (Unsplash) ───────────────────────────────────────────────

const RESTAURANT_BANNER_URLS = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1508424757105-b6d5ad9329d0?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3df1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
];

const CATEGORY_IMAGES = {
  Biryani: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d6e?auto=format&fit=crop&w=900&q=80',
  Pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
  Burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
  Dessert: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80',
  Beverage: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80',
  Salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
  Wrap: 'https://images.unsplash.com/photo-1621518848576-998a6b0f40b6?auto=format&fit=crop&w=900&q=80',
  Breakfast: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
  Noodles: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80',
  Bowls: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
};

const KNOWN_CATEGORIES = Object.keys(CATEGORY_IMAGES);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Inline slug generator — no extra dependency needed.
 * "Spice Route Kitchen" → "spice-route-kitchen"
 */
const toSlug = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const parseFloat2 = (val, fallback = 0) => {
  const n = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? Math.min(5, Math.max(0, n)) : fallback;
};

const parsePrice = (val) => {
  // Strip currency symbols, commas, spaces; keep digits and decimal point
  const cleaned = String(val ?? '')
    .replace(/[₹$£€,\s]/g, '')
    .trim();
  const n = parseFloat(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
};

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.round(min + Math.random() * (max - min));

/**
 * Infer a category from dish name and/or cuisine string.
 * Maps into the fixed KNOWN_CATEGORIES list.
 */
const inferCategory = (dishName = '', cuisine = '') => {
  const text = `${dishName} ${cuisine}`.toLowerCase();

  if (/biryani|rice|pulao|dum/.test(text)) return 'Biryani';
  if (/pizza/.test(text)) return 'Pizza';
  if (/burger|smash|patty|bun/.test(text)) return 'Burger';
  if (/cake|dessert|ice.?cream|sweet|halwa|gulab|kheer|brownie|pastry|mousse|cheesecake|tiramisu|lava/.test(text)) return 'Dessert';
  if (/coffee|tea|juice|lassi|smoothie|shake|lemonade|drink|beverage|mocktail|chai|cola|soda/.test(text)) return 'Beverage';
  if (/salad/.test(text)) return 'Salad';
  if (/wrap|roll|shawarma|frankie|kathi/.test(text)) return 'Wrap';
  if (/breakfast|paratha|idli|dosa|omelette|toast|pancake|waffle|upma|poha|egg/.test(text)) return 'Breakfast';
  if (/noodle|ramen|chow.?mein|hakka|pad.?thai|udon|lo.?mein|pasta|spaghetti/.test(text)) return 'Noodles';
  if (/bowl|poke|teriyaki|buddha|chipotle|quinoa/.test(text)) return 'Bowls';

  // Fallback based on cuisine
  if (/north.?indian|mughal|punjabi/.test(text)) return 'Biryani';
  if (/chinese|asian/.test(text)) return 'Noodles';
  if (/continental|european|italian/.test(text)) return 'Pizza';
  if (/fast.?food|american/.test(text)) return 'Burger';
  if (/south.?indian/.test(text)) return 'Breakfast';

  return randomFrom(KNOWN_CATEGORIES);
};

// ─── CSV header detection ─────────────────────────────────────────────────────

/**
 * Given a list of candidate names (in priority order) and an array of actual
 * headers, return the first candidate that exactly or partially matches.
 */
const findColumn = (headers, candidates) => {
  const lowerHeaders = headers.map((h) => h.toLowerCase().trim());
  for (const candidate of candidates) {
    const exact = lowerHeaders.findIndex((h) => h === candidate.toLowerCase());
    if (exact !== -1) return headers[exact];
    const partial = lowerHeaders.findIndex((h) => h.includes(candidate.toLowerCase()));
    if (partial !== -1) return headers[partial];
  }
  return null;
};

// ─── CSV parsing ──────────────────────────────────────────────────────────────

const readCSV = (filepath) => {
  const content = fs.readFileSync(filepath, 'utf8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    bom: true,
  });
};

// ─── Column mapping: restaurants ─────────────────────────────────────────────

const detectRestaurantColumns = (headers) => {
  process.stdout.write(`\n[restaurants.csv] Headers detected:\n  ${headers.join(', ')}\n`);

  const cols = {
    name:     findColumn(headers, ['name', 'restaurant_name', 'restaurant', 'title']),
    city:     findColumn(headers, ['city', 'location', 'town']),
    area:     findColumn(headers, ['area', 'locality', 'address', 'neighborhood', 'neighbourhood', 'zone', 'region']),
    cuisine:  findColumn(headers, ['cuisine', 'cuisines', 'cuisine_type', 'food_type', 'category', 'type']),
    rating:   findColumn(headers, ['rating', 'rate', 'avg_rating', 'stars', 'score']),
    prepTime: findColumn(headers, ['delivery_time', 'avg_delivery_time', 'delivery_min', 'prep_time', 'time']),
    cost:     findColumn(headers, ['cost', 'cost_for_two', 'average_cost', 'approx_cost', 'price_for_two']),
  };

  process.stdout.write(`[restaurants.csv] Column mapping:\n${JSON.stringify(cols, null, 2)}\n`);
  return cols;
};

// ─── Column mapping: dishes ───────────────────────────────────────────────────

const detectDishColumns = (headers) => {
  process.stdout.write(`\n[dishes.csv] Headers detected:\n  ${headers.join(', ')}\n`);

  const cols = {
    restaurantName: findColumn(headers, ['restaurant', 'restaurant_name', 'name', 'outlet', 'branch']),
    dishName:       findColumn(headers, ['item_name', 'dish_name', 'name', 'food_name', 'dish', 'menu_item']),
    price:          findColumn(headers, ['price', 'cost', 'amount', 'rate']),
    description:    findColumn(headers, ['description', 'desc', 'details', 'ingredients', 'info']),
    category:       findColumn(headers, ['category', 'menu_category', 'type', 'course', 'section']),
    rating:         findColumn(headers, ['rating', 'rate', 'avg_rating', 'stars', 'score']),
  };

  process.stdout.write(`[dishes.csv] Column mapping:\n${JSON.stringify(cols, null, 2)}\n`);
  return cols;
};

// ─── Seeding helpers shared with seed.js ─────────────────────────────────────

const categories = [
  { name: 'Biryani', slug: 'biryani', description: 'Aromatic rice bowls with slow-cooked spices.' },
  { name: 'Pizza', slug: 'pizza', description: 'Wood-fired pizzas with rich toppings.' },
  { name: 'Burger', slug: 'burger', description: 'Stacked burgers with crisp textures.' },
  { name: 'Dessert', slug: 'dessert', description: 'Sweet finishes for every meal.' },
  { name: 'Beverage', slug: 'beverage', description: 'Cooling and energizing drinks.' },
  { name: 'Salad', slug: 'salad', description: 'Fresh bowls and light meals.' },
  { name: 'Wrap', slug: 'wrap', description: 'Folded meals with bold fillings.' },
  { name: 'Breakfast', slug: 'breakfast', description: 'Early-day comfort dishes.' },
  { name: 'Noodles', slug: 'noodles', description: 'Stir-fried and saucy favorites.' },
  { name: 'Bowls', slug: 'bowls', description: 'Balanced bowls with layered ingredients.' },
];

const adminPassword = await bcrypt.hash('Admin@1234', 12);
const customerPassword = await bcrypt.hash('Customer@1234', 12);

const clearCollections = async () => {
  await Promise.all([
    User.deleteMany({}),
    Food.deleteMany({}),
    Restaurant.deleteMany({}),
    Order.deleteMany({}),
    Cart.deleteMany({}),
    Review.deleteMany({}),
    Category.deleteMany({}),
    PaymentTransaction.deleteMany({}),
  ]);
  const client = getRedisClient();
  await client.flushdb();
};

const createCategories = async () => {
  await Category.insertMany(categories);
};

const createUsers = async () => {
  const users = [];

  const admin = await User.create({
    name: 'Platform Admin',
    email: 'admin@emberbites.com',
    password: adminPassword,
    role: 'admin',
    phone: '+91 90000 00001',
    addresses: [],
  });

  const customers = await User.insertMany(
    Array.from({ length: 12 }, (_, i) => ({
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@emberbites.com`,
      password: customerPassword,
      role: 'customer',
      phone: `+91 90000 1${String(i + 1).padStart(4, '0')}`,
      addresses: [
        {
          label: 'Home',
          street: `${i + 10} Market Street`,
          city: randomFrom(['Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Chennai']),
          state: randomFrom(['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu']),
          postalCode: `56${String(1000 + i)}`,
          country: 'India',
          isDefault: true,
        },
      ],
    }))
  );

  users.push(admin, ...customers);
  return users;
};

const createReviews = async (users, foods) => {
  const reviewDocuments = Array.from({ length: 48 }, (_, i) => {
    const food = randomFrom(foods);
    const user = randomFrom(users.slice(1));
    return {
      user: user._id,
      food: food._id,
      rating: randomInt(4, 5),
      comment: `Review ${i + 1}: ${food.name} delivered with great quality and consistent flavor.`,
      isFeatured: i < 6,
    };
  });
  await Review.insertMany(reviewDocuments);
};

const createSampleCarts = async (users, foods) => {
  const cartUsers = users.slice(1, 6);
  const cartDocuments = cartUsers.map((user, i) => ({
    user: user._id,
    items: [
      { food: foods[i]._id, quantity: 2, name: foods[i].name, image: foods[i].image, price: foods[i].price },
      { food: foods[i + 5]._id, quantity: 1, name: foods[i + 5].name, image: foods[i + 5].image, price: foods[i + 5].price },
    ],
  }));
  await Cart.insertMany(cartDocuments);
};

const createSampleOrders = async (users, foods) => {
  const orderUsers = users.slice(1, 9);
  for (let i = 0; i < 20; i++) {
    const user = randomFrom(orderUsers);
    const selectedFoods = [randomFrom(foods), randomFrom(foods), randomFrom(foods)].filter(Boolean);
    const items = selectedFoods.map((food) => ({
      food: food._id, name: food.name, image: food.image, price: food.price, quantity: randomInt(1, 3),
    }));
    const amount = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const orderStatus = randomFrom(['confirmed', 'preparing', 'out_for_delivery', 'delivered']);
    const paymentStatus = randomFrom(['paid', 'paid', 'paid', 'refunded']);
    const order = await Order.create({
      user: user._id, items, amount, paymentStatus, orderStatus,
      address: user.addresses[0],
      trackingEvents: [
        { status: 'placed', note: 'Order placed successfully' },
        { status: orderStatus, note: 'Latest delivery progress update' },
      ],
    });
    const transaction = await PaymentTransaction.create({
      user: user._id, cart: items, address: user.addresses[0], amount, currency: 'INR',
      razorpayOrderId: `seed_order_${i + 1}`,
      razorpayPaymentId: `pay_seed_${i + 1}`,
      razorpaySignature: `sig_seed_${i + 1}`,
      status: 'successful', order: order._id,
    });
    await Order.findByIdAndUpdate(order._id, { paymentTransaction: transaction._id });
  }
};

const warmCache = async (foods) => {
  const data = await foodService.list({});
  await cacheService.set('cache:/api/v1/foods', { success: true, data: JSON.parse(JSON.stringify(data)) }, 3600);

  for (const food of foods) {
    const plain = JSON.parse(JSON.stringify(food));
    await cacheService.set(`cache:/api/v1/foods/${food._id}`, { success: true, data: plain }, 3600);
  }

  const rData = await restaurantService.list({});
  await cacheService.set('cache:/api/v1/restaurants', { success: true, data: JSON.parse(JSON.stringify(rData)) }, 3600);

  const allRestaurants = await Restaurant.find({ isDeleted: { $ne: true } });
  for (const r of allRestaurants) {
    const foodsResult = await foodService.list({ restaurant: r._id.toString(), limit: 100 });
    const plainR = JSON.parse(JSON.stringify({ restaurant: r, foods: foodsResult.foods }));
    await cacheService.set(`cache:/api/v1/restaurants/${r._id}`, { success: true, data: plainR }, 3600);
  }
};

// ─── Main import logic ────────────────────────────────────────────────────────

const importRestaurantsFromCSV = async () => {
  // Read and inspect
  const rows = readCSV(RESTAURANTS_CSV);
  const headers = Object.keys(rows[0]);
  const cols = detectRestaurantColumns(headers);

  if (!cols.name) {
    throw new Error('Could not detect restaurant name column in restaurants.csv. Check the file header row.');
  }
  if (!cols.city) {
    throw new Error('Could not detect city column in restaurants.csv. Check the file header row.');
  }

  // Print sample rows
  process.stdout.write('\n[restaurants.csv] Sample rows (first 3):\n');
  rows.slice(0, 3).forEach((r, i) => process.stdout.write(`  [${i}] ${JSON.stringify(r)}\n`));

  // Map + deduplicate
  const seenKeys = new Set();
  const documents = [];
  let skippedMissing = 0;
  let skippedDuplicate = 0;

  for (const row of rows) {
    const name = String(row[cols.name] ?? '').trim();
    const city = String(row[cols.city] ?? '').trim();

    if (!name || !city) { skippedMissing++; continue; }

    const dedupKey = `${name.toLowerCase()}|${city.toLowerCase()}`;
    if (seenKeys.has(dedupKey)) { skippedDuplicate++; continue; }
    seenKeys.add(dedupKey);

    const area = cols.area ? String(row[cols.area] ?? '').trim() || city : city;
    const cuisineRaw = cols.cuisine ? String(row[cols.cuisine] ?? '').trim() : '';
    const cuisines = cuisineRaw
      ? cuisineRaw.split(/[,|\/]/).map((c) => c.trim()).filter(Boolean)
      : ['Multi-cuisine'];

    const rawRating = cols.rating ? row[cols.rating] : null;
    const rating = parseFloat2(rawRating, 0);

    // Delivery time: parse if available, else default 25-35
    let avgPrepTime = randomInt(25, 35);
    if (cols.prepTime) {
      const pt = parseInt(String(row[cols.prepTime] ?? '').replace(/\D/g, ''), 10);
      if (Number.isFinite(pt) && pt > 0 && pt < 120) avgPrepTime = pt;
    }

    documents.push({
      name,
      slug: toSlug(name),
      description: `${name} serves ${cuisines.join(', ')} cuisine from ${area}, ${city}.`,
      cuisines,
      image: RESTAURANT_BANNER_URLS[documents.length % RESTAURANT_BANNER_URLS.length],
      logo: RESTAURANT_BANNER_URLS[documents.length % RESTAURANT_BANNER_URLS.length],
      rating,
      avgPrepTime,
      address: { city, area },
      isOpen: true,
      isFeatured: documents.length < 5,
    });

    if (documents.length >= MAX_RESTAURANTS) break;
  }

  process.stdout.write(`\n[restaurants.csv] Mapped: ${documents.length}, skipped (missing fields): ${skippedMissing}, skipped (duplicates): ${skippedDuplicate}\n`);

  // Insert — handle slug conflicts gracefully
  const inserted = [];
  for (const doc of documents) {
    try {
      // Ensure slug uniqueness
      const existing = await Restaurant.findOne({ slug: doc.slug });
      if (existing) doc.slug = `${doc.slug}-${Date.now()}`;
      const r = await Restaurant.create(doc);
      inserted.push(r);
    } catch (err) {
      process.stdout.write(`  [WARN] Skipped restaurant "${doc.name}": ${err.message}\n`);
    }
  }

  process.stdout.write(`[restaurants] Inserted: ${inserted.length}\n`);
  return inserted;
};

const importDishesFromCSV = async (insertedRestaurants) => {
  // Build a name → restaurant map (lowercase, trimmed, for case-insensitive matching)
  const restaurantMap = new Map(
    insertedRestaurants.map((r) => [r.name.toLowerCase().trim(), r])
  );

  const rows = readCSV(DISHES_CSV);
  const headers = Object.keys(rows[0]);
  const cols = detectDishColumns(headers);

  if (!cols.restaurantName) {
    throw new Error('Could not detect restaurant name column in dishes.csv. Check the file header row.');
  }
  if (!cols.dishName) {
    throw new Error('Could not detect dish name column in dishes.csv. Check the file header row.');
  }

  process.stdout.write('\n[dishes.csv] Sample rows (first 3):\n');
  rows.slice(0, 3).forEach((r, i) => process.stdout.write(`  [${i}] ${JSON.stringify(r)}\n`));

  // Count dishes per restaurant so we can cap at MAX_DISHES_PER_RESTAURANT
  const dishCountByRestaurant = new Map();
  const documents = [];
  let skippedNoMatch = 0;
  let skippedCapped = 0;

  for (const row of rows) {
    const restaurantName = String(row[cols.restaurantName] ?? '').trim().toLowerCase();
    const restaurant = restaurantMap.get(restaurantName);

    if (!restaurant) {
      skippedNoMatch++;
      continue;
    }

    const currentCount = dishCountByRestaurant.get(restaurant._id.toString()) ?? 0;
    if (currentCount >= MAX_DISHES_PER_RESTAURANT) {
      skippedCapped++;
      continue;
    }

    const dishName = String(row[cols.dishName] ?? '').trim();
    if (!dishName) { skippedNoMatch++; continue; }

    const rawPrice = cols.price ? row[cols.price] : null;
    let price = parsePrice(rawPrice);

    // If price looks like it could be in a non-INR currency (e.g. < 20) or
    // is absurdly high, normalise to a plausible INR range (80-800)
    if (!price || price < 20) {
      price = randomInt(120, 450);
    } else if (price > 2000) {
      // Likely "cost for two" — halve it and round
      price = Math.round(price / 2);
    }
    // Clamp
    price = Math.min(1200, Math.max(50, price));

    const description = cols.description
      ? String(row[cols.description] ?? '').trim() || `${dishName} — a specialty at ${restaurant.name}.`
      : `${dishName} — a specialty at ${restaurant.name}.`;

    const rawCat = cols.category ? String(row[cols.category] ?? '').trim() : '';
    // Map to known category; fall back to inference from dish name + cuisine
    const category = KNOWN_CATEGORIES.includes(rawCat)
      ? rawCat
      : inferCategory(dishName, restaurant.cuisines.join(' '));

    const rawRating = cols.rating ? row[cols.rating] : null;
    const rating = rawRating ? parseFloat2(rawRating, restaurant.rating) : restaurant.rating;

    const prepTime = restaurant.avgPrepTime + randomInt(-5, 8);

    documents.push({
      name: dishName,
      description,
      category,
      image: CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES.Bowls,
      price,
      rating,
      availability: true,
      prepTime: Math.max(8, prepTime),
      tags: [category.toLowerCase(), 'fresh', restaurant.cuisines[0]?.toLowerCase() ?? 'local'].slice(0, 3),
      restaurant: restaurant._id,
    });

    dishCountByRestaurant.set(restaurant._id.toString(), currentCount + 1);
  }

  process.stdout.write(`\n[dishes.csv] Matched: ${documents.length}, skipped (no matching restaurant): ${skippedNoMatch}, skipped (per-restaurant cap): ${skippedCapped}\n`);

  const inserted = await Food.insertMany(documents);
  process.stdout.write(`[dishes] Inserted: ${inserted.length}\n`);

  return inserted;
};

// ─── Entry point ──────────────────────────────────────────────────────────────

const runImport = async () => {
  // Pre-flight checks
  if (!fs.existsSync(RESTAURANTS_CSV)) {
    throw new Error(`restaurants.csv not found at ${RESTAURANTS_CSV}\n  → Place the file there and re-run.`);
  }
  if (!fs.existsSync(DISHES_CSV)) {
    throw new Error(`dishes.csv not found at ${DISHES_CSV}\n  → Place the file there and re-run.`);
  }

  await connectDatabase();
  process.stdout.write('\n── Clearing existing data ──\n');
  await clearCollections();

  process.stdout.write('── Creating categories ──\n');
  await createCategories();

  process.stdout.write('── Creating users ──\n');
  const users = await createUsers();

  process.stdout.write('\n── Importing restaurants from CSV ──\n');
  const insertedRestaurants = await importRestaurantsFromCSV();

  if (insertedRestaurants.length === 0) {
    throw new Error('No restaurants were imported. Cannot continue without data. Check CSV and column mapping.');
  }

  process.stdout.write('\n── Importing dishes from CSV ──\n');
  const insertedFoods = await importDishesFromCSV(insertedRestaurants);

  if (insertedFoods.length < insertedRestaurants.length) {
    process.stdout.write(`\n[WARN] Only ${insertedFoods.length} dishes for ${insertedRestaurants.length} restaurants. Some restaurants will appear empty in the UI.\n`);
  }

  process.stdout.write('\n── Creating reviews, carts, orders ──\n');
  if (insertedFoods.length >= 10) {
    await createReviews(users, insertedFoods);
    await createSampleCarts(users, insertedFoods);
    await createSampleOrders(users, insertedFoods);
  } else {
    process.stdout.write('[WARN] Too few dishes to seed carts/orders — skipping.\n');
  }

  process.stdout.write('\n── Warming cache ──\n');
  await warmCache(insertedFoods);

  // ── Final summary ──
  const totalRestaurants = await Restaurant.countDocuments({});
  const totalFoods = await Food.countDocuments({});
  const totalUsers = await User.countDocuments({});

  process.stdout.write(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Kaggle Import Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Restaurants in DB : ${totalRestaurants}
 Dishes in DB      : ${totalFoods}
 Users in DB       : ${totalUsers}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
};

runImport()
  .then(async () => {
    await getRedisClient().quit();
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    process.stderr.write(`\n[ERROR] ${error.message}\n`);
    try { await getRedisClient().quit(); } catch {}
    await mongoose.disconnect();
    process.exit(1);
  });

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { User } from '../models/User.js';
import { Food } from '../models/Food.js';
import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { Review } from '../models/Review.js';
import { Category } from '../models/Category.js';
import { PaymentTransaction } from '../models/PaymentTransaction.js';
import { getRedisClient } from '../config/redis.js';
import { cacheService } from '../services/cacheService.js';
import { foodService } from '../services/foodService.js';

dotenv.config();

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

const categoryImages = {
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

const dishDescriptors = [
  'Smoked',
  'Charred',
  'Crispy',
  'Loaded',
  'Herbed',
  'Zesty',
  'Spiced',
  'Golden',
  'Crunchy',
  'Fiery',
  'Velvet',
  'Garden',
];

const dishNouns = {
  Biryani: ['Paneer Biryani', 'Chicken Biryani', 'Mutton Biryani', 'Veg Biryani', 'Egg Biryani', 'Hyderabadi Biryani', 'Lucknowi Biryani', 'Soya Biryani', 'Kebab Biryani', 'Shahi Biryani', 'Rice Bowl', 'Royal Rice'],
  Pizza: ['Margherita', 'Pepperoni', 'Truffle Mushroom', 'Tandoori Paneer', 'Farmhouse', 'Cheese Burst', 'Four Cheese', 'BBQ Chicken', 'Supreme', 'Mediterranean', 'Hawaiian', 'Sourdough'],
  Burger: ['Spicy Stack', 'Double Cheese', 'Chicken Smash', 'Paneer Crunch', 'BBQ Supreme', 'Mushroom Melt', 'Classic Beef', 'Crispy Filet', 'Jalapeno Heat', 'Smoked Bacon', 'Veg Deluxe', 'American Classic'],
  Dessert: ['Chocolate Lava', 'New York Cheesecake', 'Tiramisu', 'Caramel Pudding', 'Brownie Sundae', 'Fruit Tart', 'Gulab Jamun', 'Rasmalai', 'Dark Mousse', 'Banoffee Pie', 'Kunafa', 'Ice Cream Jar'],
  Beverage: ['Cold Brew', 'Mango Shake', 'Iced Lemon Tea', 'Masala Chai', 'Fresh Lime Soda', 'Berry Cooler', 'Vanilla Frappe', 'Green Smoothie', 'Coconut Water', 'Mocktail', 'Sparkling Water', 'Orange Juice'],
  Salad: ['Caesar', 'Greek', 'Quinoa', 'Kale Crunch', 'Mediterranean', 'Avocado', 'Pomegranate', 'Protein', 'Farmer', 'Citrus', 'Rainbow', 'Pickled'],
  Wrap: ['Chicken Wrap', 'Paneer Wrap', 'Falafel Wrap', 'Peri Peri Wrap', 'BBQ Wrap', 'Hummus Wrap', 'Crispy Wrap', 'Tikka Wrap', 'Mushroom Wrap', 'Veggie Wrap', 'Steak Wrap', 'Spicy Shawarma'],
  Breakfast: ['Masala Omelette', 'Aloo Paratha', 'Pancake Stack', 'Avocado Toast', 'Idli Platter', 'Poha Bowl', 'Upma Bowl', 'French Toast', 'Dosa', 'Bagel Sandwich', 'Granola Bowl', 'Egg Muffin'],
  Noodles: ['Hakka Noodles', 'Schezwan Noodles', 'Ramen Bowl', 'Chow Mein', 'Pad Thai', 'Udon Bowl', 'Veg Stir Fry', 'Chicken Lo Mein', 'Spicy Glass Noodles', 'Sesame Noodles', 'Garlic Noodles', 'Sesame Ramen'],
  Bowls: ['Teriyaki Bowl', 'Power Bowl', 'Chipotle Bowl', 'Rice Bowl', 'Poke Bowl', 'Buddha Bowl', 'Katsu Bowl', 'Falafel Bowl', 'Paneer Bowl', 'Chicken Bowl', 'Nourish Bowl', 'Harvest Bowl'],
};

const categoriesByName = Object.fromEntries(categories.map((item) => [item.name, item]));
const adminPassword = await bcrypt.hash('Admin@1234', 12);
const customerPassword = await bcrypt.hash('Customer@1234', 12);
const users = [];
const foods = [];

const randomFrom = (items) => items[Math.floor(Math.random() * items.length)];
const randomBoolean = (chance = 0.8) => Math.random() < chance;
const randomPrice = (min, max) => Math.round(min + Math.random() * (max - min));
const randomRating = () => Number((3.8 + Math.random() * 1.2).toFixed(1));

const buildFoodName = (categoryName, index) => {
  const descriptor = dishDescriptors[index % dishDescriptors.length];
  const noun = dishNouns[categoryName][index % dishNouns[categoryName].length];
  return `${descriptor} ${noun}`;
};

const buildFoodDescription = (name, categoryName) => {
  return `${name} from our ${categoryName.toLowerCase()} menu is crafted for consistency, speed, and a premium finish.`;
};

const clearCollections = async () => {
  await Promise.all([
    User.deleteMany({}),
    Food.deleteMany({}),
    Order.deleteMany({}),
    Cart.deleteMany({}),
    Review.deleteMany({}),
    Category.deleteMany({}),
    PaymentTransaction.deleteMany({}),
  ]);
  const client = getRedisClient();
  await client.flushdb();
};

const createUsers = async () => {
  const admin = await User.create({
    name: 'Platform Admin',
    email: 'admin@emberbites.com',
    password: adminPassword,
    role: 'admin',
    phone: '+91 90000 00001',
    addresses: [],
  });

  const customers = await User.insertMany(
    Array.from({ length: 12 }, (_, index) => ({
      name: `Customer ${index + 1}`,
      email: `customer${index + 1}@emberbites.com`,
      password: customerPassword,
      role: 'customer',
      phone: `+91 90000 1${String(index + 1).padStart(4, '0')}`,
      addresses: [
        {
          label: 'Home',
          street: `${index + 10} Market Street`,
          city: randomFrom(['Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Chennai']),
          state: randomFrom(['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Karnataka']),
          postalCode: `56${String(1000 + index)}`,
          country: 'India',
          isDefault: true,
        },
      ],
    }))
  );

  users.push(admin, ...customers);
};

const createCategories = async () => {
  await Category.insertMany(categories);
};

const createFoods = async () => {
  const documents = [];

  Object.keys(categoriesByName).forEach((categoryName) => {
    for (let index = 0; index < 12; index += 1) {
      const name = buildFoodName(categoryName, index);
      documents.push({
        name,
        description: buildFoodDescription(name, categoryName),
        category: categoryName,
        image: categoryImages[categoryName],
        price: randomPrice(120, 780),
        rating: randomRating(),
        availability: randomBoolean(0.9),
        prepTime: randomPrice(8, 28),
        tags: [categoryName.toLowerCase(), 'fresh', 'chef-special', 'fast-delivery'].slice(0, 4),
      });
    }
  });

  const createdFoods = await Food.insertMany(documents);
  foods.push(...createdFoods);
};

const createReviews = async () => {
  const reviewDocuments = Array.from({ length: 48 }, (_, index) => {
    const food = randomFrom(foods);
    const user = randomFrom(users.slice(1));

    return {
      user: user._id,
      food: food._id,
      rating: randomPrice(4, 5),
      comment: `Review ${index + 1}: ${food.name} delivered with great quality and consistent flavor.`,
      isFeatured: index < 6,
    };
  });

  await Review.insertMany(reviewDocuments);
};

const createSampleCarts = async () => {
  const cartUsers = users.slice(1, 6);
  const cartDocuments = cartUsers.map((user, index) => ({
    user: user._id,
    items: [
      {
        food: foods[index]._id,
        quantity: 2,
        name: foods[index].name,
        image: foods[index].image,
        price: foods[index].price,
      },
      {
        food: foods[index + 5]._id,
        quantity: 1,
        name: foods[index + 5].name,
        image: foods[index + 5].image,
        price: foods[index + 5].price,
      },
    ],
  }));

  await Cart.insertMany(cartDocuments);
};

const createSampleOrders = async () => {
  const orderUsers = users.slice(1, 9);

  for (let index = 0; index < 20; index += 1) {
    const user = randomFrom(orderUsers);
    const selectedFoods = [randomFrom(foods), randomFrom(foods), randomFrom(foods)].filter(Boolean);
    const items = selectedFoods.map((food) => ({
      food: food._id,
      name: food.name,
      image: food.image,
      price: food.price,
      quantity: randomPrice(1, 3),
    }));
    const amount = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const orderStatus = randomFrom(['confirmed', 'preparing', 'out_for_delivery', 'delivered']);
    const paymentStatus = randomFrom(['paid', 'paid', 'paid', 'refunded']);
    const order = await Order.create({
      user: user._id,
      items,
      amount,
      paymentStatus,
      orderStatus,
      address: user.addresses[0],
      trackingEvents: [
        { status: 'placed', note: 'Order placed successfully' },
        { status: orderStatus, note: 'Latest delivery progress update' },
      ],
    });

    const transaction = await PaymentTransaction.create({
      user: user._id,
      cart: items,
      address: user.addresses[0],
      amount,
      currency: 'INR',
      razorpayOrderId: `seed_order_${index + 1}`,
      razorpayPaymentId: `pay_seed_${index + 1}`,
      razorpaySignature: `sig_seed_${index + 1}`,
      status: 'successful',
      order: order._id,
    });

    await Order.findByIdAndUpdate(order._id, { paymentTransaction: transaction._id });
  }
};

const seedDatabase = async () => {
  await connectDatabase();
  await clearCollections();
  await createCategories();
  await createUsers();
  await createFoods();
  await createReviews();
  await createSampleCarts();
  await createSampleOrders();

  const data = await foodService.list({});
  const plainData = JSON.parse(JSON.stringify(data));
  await cacheService.set('cache:/api/v1/foods', { success: true, data: plainData }, 3600);

  const foods = await Food.find({ isActive: true });
  for (const food of foods) {
    const plainFood = JSON.parse(JSON.stringify(food));
    await cacheService.set(`cache:/api/v1/foods/${food._id.toString()}`, { success: true, data: plainFood }, 3600);
  }
};

seedDatabase()
  .then(async () => {
    process.stdout.write('Seed completed\n');
    await getRedisClient().quit();
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    process.stderr.write(`${error.message}\n`);
    try {
      await getRedisClient().quit();
    } catch {}
    await mongoose.disconnect();
    process.exit(1);
  });
import { expect, test } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { restaurantService } from '../services/restaurantService.js';
import { foodService } from '../services/foodService.js';
import { Restaurant } from '../models/Restaurant.js';
import { Food } from '../models/Food.js';

test('restaurant endpoints and food relationship works correctly', async () => {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const restaurant = await Restaurant.create({
    name: 'Spice Route Kitchen',
    slug: 'spice-route-kitchen',
    description: 'Aromatic Biryanis.',
    cuisines: ['North Indian', 'Biryani'],
    image: 'spice.png',
    avgPrepTime: 35,
    address: { city: 'Bengaluru', area: 'Indiranagar' },
    isOpen: true,
  });

  await Food.create({
    name: 'Charred Chicken Biryani',
    description: 'Aromatic chicken biryani.',
    category: 'Biryani',
    image: 'biryani.png',
    price: 350,
    prepTime: 25,
    restaurant: restaurant._id,
  });

  // 1. List restaurants
  const listResult = await restaurantService.list({});
  expect(listResult.restaurants).toHaveLength(1);
  expect(listResult.restaurants[0].name).toBe('Spice Route Kitchen');

  // 2. Get restaurant by id
  const detail = await restaurantService.getById(restaurant._id.toString());
  expect(detail.slug).toBe('spice-route-kitchen');

  // 3. List foods by restaurant ID
  const foodsResult = await foodService.list({ restaurant: restaurant._id.toString() });
  expect(foodsResult.foods).toHaveLength(1);
  expect(foodsResult.foods[0].name).toBe('Charred Chicken Biryani');
  expect(foodsResult.foods[0].restaurant.name).toBe('Spice Route Kitchen');

  await mongoose.disconnect();
  await mongoServer.stop();
}, 20000);

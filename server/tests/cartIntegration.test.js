import { expect, test } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { cartService } from '../services/cartService.js';
import { Cart } from '../models/Cart.js';
import { Food } from '../models/Food.js';
import { User } from '../models/User.js';

test('cart operations work correctly with null food item in database', async () => {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  const user = await User.create({
    name: 'Test',
    email: 'test@example.com',
    password: 'password',
    phone: '1234567890',
    role: 'customer',
  });

  // Try to create a cart with a null food field
  // The pre-validate hook should clean it up automatically
  const createdCart = await Cart.create({
    user: user._id,
    items: [
      {
        food: null,
        name: 'Corrupt Food',
        image: 'corrupt.png',
        price: 100,
        quantity: 2,
      }
    ]
  });
  expect(createdCart.items).toHaveLength(0);

  // 1. Get cart
  const cart1 = await cartService.getCart(user._id);
  expect(cart1.items).toHaveLength(0);

  // 2. Try to update cart item (should succeed and save the cart)
  const food = await Food.create({
    name: 'Pizza',
    price: 100,
    image: 'pizza.png',
    description: 'Yummy pizza',
    category: 'Pizza',
    isAvailable: true,
  });

  const cart2 = await cartService.updateItem(user._id, food._id.toString(), 3);
  expect(cart2.items).toHaveLength(1);
  expect(cart2.items[0].quantity).toBe(3);

  await mongoose.disconnect();
  await mongoServer.stop();
}, 20000);

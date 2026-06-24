import { ApiError } from '../utils/ApiError.js';
import { cartRepository } from '../repositories/cartRepository.js';
import { foodRepository } from '../repositories/foodRepository.js';

const populateCart = async (cart) => {
  if (!cart) {
    return cart;
  }

  return cart.populate('items.food');
};

export const cartService = {
  getCart: async (userId) => {
    let cart = await cartRepository.findByUser(userId);

    if (!cart) {
      cart = await cartRepository.createOrReplace(userId, { items: [] });
    }

    return populateCart(cart);
  },
  updateItem: async (userId, foodId, quantity) => {
    const food = await foodRepository.findById(foodId);

    if (!food) {
      throw new ApiError(404, 'Food item not found');
    }

    const cart = (await cartRepository.findByUserRaw(userId)) ?? (await cartRepository.createOrReplace(userId, { items: [] }));
    const existingItem = cart.items.find((item) => item.food.toString() === foodId);

    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      cart.items.push({
        food: food._id,
        quantity,
        name: food.name,
        image: food.image,
        price: food.price,
      });
    }

    await cartRepository.save(cart);
    return populateCart(cart);
  },
  removeItem: async (userId, itemId) => {
    const cart = await cartRepository.deleteItem(userId, itemId);

    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    return populateCart(cart);
  },
  clear: async (userId) => {
    const cart = await cartRepository.clear(userId);
    return populateCart(cart);
  },
};
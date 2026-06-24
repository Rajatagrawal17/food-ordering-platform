import { Cart } from '../models/Cart.js';

export const cartRepository = {
  findByUser: (userId) => Cart.findOne({ user: userId }).populate('items.food'),
  findByUserRaw: (userId) => Cart.findOne({ user: userId }),
  createOrReplace: async (userId, payload) => {
    return Cart.findOneAndUpdate({ user: userId }, { user: userId, ...payload }, { new: true, upsert: true });
  },
  save: (cart) => cart.save(),
  deleteItem: async (userId, itemId) => {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return null;
    }

    cart.items = cart.items.filter((item) => item.food.toString() !== itemId);
    return cart.save();
  },
  clear: async (userId) => Cart.findOneAndUpdate({ user: userId }, { items: [] }, { new: true }),
};
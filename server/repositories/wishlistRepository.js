import { Wishlist } from '../models/Wishlist.js';

export const wishlistRepository = {
  findByUser: (userId) => Wishlist.findOne({ user: userId }).populate('foods'),
  create: (userId) => Wishlist.create({ user: userId, foods: [] }),
  addFood: async (userId, foodId) => {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, foods: [] });
    }
    if (!wishlist.foods.includes(foodId)) {
      wishlist.foods.push(foodId);
      await wishlist.save();
    }
    return wishlist.populate('foods');
  },
  removeFood: async (userId, foodId) => {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (wishlist) {
      wishlist.foods = wishlist.foods.filter((id) => id.toString() !== foodId.toString());
      await wishlist.save();
    }
    return wishlist ? wishlist.populate('foods') : null;
  },
};

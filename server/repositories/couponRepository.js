import { Coupon } from '../models/Coupon.js';
import { cacheService } from '../services/cacheService.js';

export const couponRepository = {
  findByCode: async (code) => {
    const key = `coupon:code:${code.toUpperCase()}`;
    const cached = await cacheService.get(key);
    if (cached) {
      cached.expirationDate = new Date(cached.expirationDate);
      if (cached.createdAt) cached.createdAt = new Date(cached.createdAt);
      if (cached.updatedAt) cached.updatedAt = new Date(cached.updatedAt);
      return cached;
    }
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (coupon) {
      await cacheService.set(key, coupon.toObject ? coupon.toObject() : coupon, 3600);
    }
    return coupon;
  },
  create: async (payload) => {
    const coupon = await Coupon.create(payload);
    const key = `coupon:code:${coupon.code.toUpperCase()}`;
    await cacheService.del(key);
    return coupon;
  },
  incrementUsedCount: async (id) => {
    const coupon = await Coupon.findByIdAndUpdate(id, { $inc: { usedCount: 1 } }, { new: true });
    if (coupon) {
      const key = `coupon:code:${coupon.code.toUpperCase()}`;
      await cacheService.del(key);
    }
    return coupon;
  },
  findMany: () => Coupon.find().sort({ createdAt: -1 }),
};

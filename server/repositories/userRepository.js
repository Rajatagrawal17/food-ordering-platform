import { User } from '../models/User.js';

export const userRepository = {
  findByEmail: (email) => User.findOne({ email }),
  findById: (id) => User.findById(id),
  findByIdWithPassword: (id) => User.findById(id).select('+password'),
  create: (payload) => User.create(payload),
  updateById: (id, payload) => User.findByIdAndUpdate(id, payload, { new: true }),
  findMany: ({ page, limit, role, search }) => {
    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    return User.find(filter)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  },
  count: (filter = {}) => User.countDocuments(filter),
};
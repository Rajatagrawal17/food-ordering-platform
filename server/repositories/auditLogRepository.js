import { AuditLog } from '../models/AuditLog.js';

export const auditLogRepository = {
  create: (payload) => AuditLog.create(payload),
  findMany: ({ page = 1, limit = 50, action, userId }) => {
    const filter = {};
    if (action) {
      filter.action = action;
    }
    if (userId) {
      filter.user = userId;
    }
    return AuditLog.find(filter)
      .populate('user', 'name email role')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  },
  count: (filter = {}) => AuditLog.countDocuments(filter),
};

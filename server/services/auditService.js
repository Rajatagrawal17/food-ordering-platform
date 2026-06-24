import { auditLogRepository } from '../repositories/auditLogRepository.js';
import { logger } from '../config/logger.js';

export const auditService = {
  log: async ({ req, user, action, details, status, error }) => {
    try {
      const payload = {
        user: user?._id ?? req?.user?._id ?? null,
        action,
        method: req?.method ?? 'SYSTEM',
        url: req?.originalUrl ?? 'SYSTEM',
        ip: req?.ip ?? null,
        userAgent: req?.headers?.['user-agent'] ?? null,
        details,
        status,
        error: error instanceof Error ? error.message : error ?? null,
      };

      await auditLogRepository.create(payload);
    } catch (err) {
      logger.error({ error: err }, 'Failed to write audit log');
    }
  },
};

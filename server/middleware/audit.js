import { AuditLog } from '../models/AuditLog.js';

export const auditMiddleware = (actionName) => {
  return (req, res, next) => {
    const originalJson = res.json;

    res.json = function (body) {
      res.json = originalJson;

      const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
      let userId = req.user?._id;

      if (!userId && body?.success && body?.data?.user?._id) {
        userId = body.data.user._id;
      }

      const payload = {
        user: userId || null,
        action: actionName,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        status: isSuccess ? 'success' : 'failure',
        details: isSuccess ? { body: req.body } : { body: req.body, response: body },
        error: isSuccess ? null : body?.message || 'Request failed',
      };

      AuditLog.create(payload).catch(() => {});

      return originalJson.call(this, body);
    };

    next();
  };
};

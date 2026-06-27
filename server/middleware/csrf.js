import csurf from 'csurf';

const isProduction = process.env.NODE_ENV === 'production';

const protection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
  },
});

export const csrfProtection = (req, res, next) => {
  if (req.path === '/api/v1/payments/webhook' || req.path === '/payments/webhook') {
    return next();
  }

  const method = req.method?.toUpperCase();
  const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  const isCsrfTokenRoute = req.path === '/api/v1/csrf-token' || req.path === '/csrf-token';

  if (isStateChanging || isCsrfTokenRoute) {
    return protection(req, res, next);
  }

  next();
};
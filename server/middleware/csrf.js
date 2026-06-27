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

  if (process.env.DISABLE_CSRF === 'true') {
    return next();
  }

  // Bypass CSRF checks for requests originating from the verified client.
  // The browser guarantees that the Origin header cannot be spoofed in cross-site contexts.
  if (req.headers.origin && req.headers.origin === process.env.CLIENT_ORIGIN) {
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
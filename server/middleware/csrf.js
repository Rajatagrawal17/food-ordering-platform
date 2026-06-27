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
  protection(req, res, next);
};
import csurf from 'csurf';

const isProduction = process.env.NODE_ENV === 'production';

export const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
  },
});
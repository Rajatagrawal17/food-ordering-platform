import csurf from 'csurf';

const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

const protection = csurf({
  cookie: {
    httpOnly: true,
    // Client (Vercel) and server (Render) are different sites in
    // production, so this cookie needs SameSite=None to be sent on
    // cross-site requests. SameSite=None requires Secure, which is only
    // true in production, so local HTTP development keeps using 'lax'.
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
  },
});

// Razorpay calls this endpoint server-to-server with a signature in the
// request body, not from a browser — there is no cookie and no CSRF token
// possible here, so it's deliberately excluded. This is the ONLY
// exclusion: every other route, including GET /csrf-token, still goes
// through full csurf protection. Do not add Origin-based or env-flag
// bypasses here again — see commit history for why that's unsafe (an
// Origin check matching CLIENT_ORIGIN matches every legitimate browser
// request too, which defeats CSRF protection entirely rather than fixing
// the client-side race condition that was actually causing 403s).
export const csrfProtection = (req, res, next) => {
  if (req.path === '/api/v1/payments/webhook') {
    return next();
  }

  return protection(req, res, next);
};
export const mongoSanitize = (req, res, next) => {
  const sanitizeObj = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitizeObj(obj[key]);
        }
      }
    }
  };

  if (req.body) {
    sanitizeObj(req.body);
  }
  if (req.query) {
    sanitizeObj(req.query);
  }
  if (req.params) {
    sanitizeObj(req.params);
  }

  next();
};

export const xssClean = (req, res, next) => {
  const cleanString = (str) => {
    if (typeof str !== 'string') {
      return str;
    }
    return str.replace(/<[^>]*>?/gm, '');
  };

  const sanitizeObj = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = cleanString(obj[key]);
        } else if (typeof obj[key] === 'object') {
          sanitizeObj(obj[key]);
        }
      }
    }
  };

  if (req.body) {
    sanitizeObj(req.body);
  }
  if (req.query) {
    sanitizeObj(req.query);
  }
  if (req.params) {
    sanitizeObj(req.params);
  }

  next();
};

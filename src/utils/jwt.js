import jwt from 'jsonwebtoken';

const DEV_FALLBACK_SECRET = 'your-super-secret-jwt-key-change-in-production';

// Resolve the secret lazily (at call time, not module load) so that
// `next build` can safely import this module for static analysis while a
// misconfigured production deployment still fails fast on the first request.
const getSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'JWT_SECRET is not set. Configure it in your Vercel project environment variables.',
      );
    }
    // Development / test fallback only.
    return DEV_FALLBACK_SECRET;
  }

  return secret;
};

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (payload) => {
  return jwt.sign(payload, getSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, getSecret());
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

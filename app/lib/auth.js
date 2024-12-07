// lib/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '7d'
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Middleware to protect routes
export async function authMiddleware(request) {
    const token = request.cookies.get('token');
    
    if (!token) {
      return null;
    }
  
    const decoded = verifyToken(token.value);
    if (!decoded) {
      return null;
    }
  
    return decoded;
  }
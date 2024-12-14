// lib/auth.js
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

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

export function getToken(request) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return null;
  }

  return verifyToken(token.value);
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

// Helper function to set auth token
export function setAuthToken(response, token) {
  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
}

// Helper function to remove auth token
export function removeAuthToken(response) {
  response.cookies.delete('token');
}

// Check if user has required role
export function checkRole(user, allowedRoles) {
  return user && allowedRoles.includes(user.role);
}
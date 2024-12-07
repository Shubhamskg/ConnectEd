// context/AuthContext.js
"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      
      if (response.ok) {
        const data = await response.json();
        console.log("data",data)
        setUser(data);
      } else {
        console.log("no user",response)
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const registerStudent = async (userData) => {
    try {
      const response = await fetch('/api/auth/student/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      if (response.ok) {
        return { success: true };
      }
      return { success: false, error: data.message };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const registerTeacher = async (userData) => {
    try {
      const response = await fetch('/api/auth/teacher/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      if (response.ok) {
        return { success: true };
      }
      return { success: false, error: data.message };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const loginStudent = async (credentials) => {
    try {
      const response = await fetch('/api/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        router.push(data.user.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student');
        return { success: true };
      }
      return { success: false, error: data.message };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };
  const loginTeacher = async (credentials) => {
    try {
      const response = await fetch('/api/auth/teacher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        router.push(data.user.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student');
        return { success: true };
      }
      return { success: false, error: data.message };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logoutStudent = async () => {
    try {
      await fetch('/api/auth/studentlogout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  const logoutTeacher = async () => {
    try {
      await fetch('/api/auth/teacher/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const resetPassword = async (email) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      return { success: response.ok, message: data.message };
    } catch (error) {
      return { success: false, error: 'Password reset failed' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      if (response.ok) {
        setUser(prev => ({ ...prev, ...data }));
        return { success: true };
      }
      return { success: false, error: data.message };
    } catch (error) {
      return { success: false, error: 'Profile update failed' };
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        loginStudent,
        loginTeacher,
        logoutStudent, 
        logoutTeacher,
        checkAuth,
        registerStudent,
        registerTeacher,
        resetPassword,
        updateProfile,
        isAuthenticated: !!user,
        isTeacher: user?.role === 'teacher',
        isStudent: user?.role === 'student'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
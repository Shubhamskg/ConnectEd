// components/Notifications/NotificationContext.js
"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';

const NotificationContext = createContext({});

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      initializeWebSocket();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        updateUnreadCount(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const initializeWebSocket = () => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/notifications`);
    
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    return () => ws.close();
  };

  const updateUnreadCount = (notifs) => {
    setUnreadCount(notifs.filter(n => !n.read).length);
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead,
        fetchNotifications 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);


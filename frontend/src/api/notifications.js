// src/api/notifications.js
import client from './client';

export const notificationsAPI = {
  list: (params) => client.get('/notifications/', { params }),
  markAllRead: () => client.post('/notifications/mark-all-read/'),
  markRead: (id) => client.post(`/notifications/${id}/mark-read/`),
  unreadCount: () => client.get('/notifications/unread-count/'),
};

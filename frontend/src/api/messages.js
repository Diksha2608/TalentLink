import client from './client';

export const messagesAPI = {
  list: (params) => client.get('/messages/', { params }),
  send: (data) => client.post('/messages/', data),
  getConversations: () => client.get('/messages/conversations/'),
  getWithUser: (userId) => client.get('/messages/with_user/', { params: { user_id: userId } }),
};
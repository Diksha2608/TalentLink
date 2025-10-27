import client from './client';

export const proposalsAPI = {
  list: (params) => client.get('/proposals/', { params }),
  create: (data) => client.post('/proposals/', data),
  accept: (id) => client.post(`/proposals/${id}/accept/`),
  reject: (id) => client.post(`/proposals/${id}/reject/`),
};
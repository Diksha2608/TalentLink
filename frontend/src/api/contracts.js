import client from './client';

export const contractsAPI = {
  list: () => client.get('/contracts/'),
  get: (id) => client.get(`/contracts/${id}/`),
  sign: (id) => client.post(`/contracts/${id}/sign/`),
  complete: (id) => client.post(`/contracts/${id}/complete/`),
};
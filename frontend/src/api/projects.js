import client from './client';

export const projectsAPI = {
  list: (params) => client.get('/projects/', { params }),
  get: (id) => client.get(`/projects/${id}/`),
  create: (data) => client.post('/projects/', data),
  update: (id, data) => client.put(`/projects/${id}/`, data),
  delete: (id) => client.delete(`/projects/${id}/`),
  getProposals: (projectId) => client.get(`/projects/${projectId}/proposals/`),
};
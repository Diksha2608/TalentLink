import client from './client';

// Persist tokens
function setTokens({ access, refresh }) {
  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
}

export function logoutRedirect() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/signin';
}

export const authAPI = {
  // Registration
  register: (data) => client.post('/users/register/', data),

  // Login with guarded response shape and clear errors
  login: async (email, password) => {
    try {
      const resp = await client.post('/token/', { email, password });
      const data = resp?.data;
      const access = data?.access;
      const refresh = data?.refresh;

      if (!access || !refresh) {
        throw new Error('Token pair missing in response');
      }

      setTokens({ access, refresh });
      return data;
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Login failed';
      throw new Error(message);
    }
  },

  // Current user
  me: () => client.get('/users/me/'),

  // Update user profile
  updateUser: (data) =>
    data instanceof FormData
      ? client.put('/users/update_me/', data)
      : client.put('/users/update_me/', data),

  // Freelancer profile CRUD
  updateProfile: (data) =>
    data instanceof FormData
      ? client.put('/profiles/freelancer/me/', data)
      : client.put('/profiles/freelancer/me/', data),
  getFreelancerProfile: () => client.get('/profiles/freelancer/me/'),

  // Client profile CRUD
  getClientProfile: () => client.get('/profiles/client/me/'),
  updateClientProfile: (data) =>
    data instanceof FormData
      ? client.put('/profiles/client/me/', data)
      : client.put('/profiles/client/me/', data),

  // User resources
  getMyProposals: () => client.get('/proposals/'),
  getMyContracts: () => client.get('/contracts/'),

  // Portfolio files
  uploadPortfolioFiles: (formData) =>
    client.post('/profiles/freelancer/me/upload-portfolio-files/', formData),
  deletePortfolioFile: (fileId) =>
    client.delete(`/profiles/freelancer/me/delete-portfolio-file/${fileId}/`),

  // Password reset request - send reset email
  forgotPassword: (email) => client.post('/users/forgot-password/', { email }),

  // Password reset confirm - submit token and new password
  resetPasswordConfirm: (data) => client.post('/users/reset-password/', data),

  deleteAccount: async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("Not authenticated");
    }

    return client.delete("/users/delete-account/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Logout
  logout: () => logoutRedirect(),
};

import client from "./client";

export const authAPI = {
  register: (data) => client.post("/users/register/", data),

  login: (email, password) => client.post("/token/", { email, password }),

  me: () => client.get("/users/me/"),

  updateProfile: (data) => client.put("/profiles/freelancer/me/", data),

  updateUser: (data) => client.put("/users/update_me/", data),

  getFreelancerProfile: () => client.get("/profiles/freelancer/me/"),

  // Forgot Password (sends reset link to email)
  forgotPassword: (email) =>
    client.post("/password_reset/", { email: email.trim().toLowerCase() }),

  // Reset Password (called when user clicks link in email)
  resetPassword: (uid, token, new_password) =>
    client.post("/password_reset/confirm/", {
      uid,
      token,
      new_password,
    }),
};

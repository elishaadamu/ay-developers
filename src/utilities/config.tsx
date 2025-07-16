export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  ENDPOINTS: {
    AUTH: {
      SIGNUP: "/api/auth/register",
      SIGNIN: "/api/auth/login",
      UserData: "/api/users/profile/",
      UserUpdate: "/api/auth/updateProfile",
      AddProducts: "/api/products/add",
      AddUsers: "/api/auth/register",
    },
  },
};

export const apiUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`;

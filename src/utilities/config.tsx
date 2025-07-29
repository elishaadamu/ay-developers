export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  ENDPOINTS: {
    AUTH: {
      SIGNUP: "/api/auth/register",
      SIGNIN: "/api/auth/login",
      UserData: "/api/users/profile/",
      UserUpdate: "/api/auth/updateProfile",
      AddProducts: "/api/products/create",
      GetProducts: "/api/products/",
      AddUsers: "/api/auth/register",
      UpdateProduct: "/api/products/",
      DeleteProduct: "/api/products/",
      SuspendUser: "/api/users/suspend/",
      ActivateUser: "/api/users/activate/",
      GetUsers: "/api/users",
      UpdateUser: "/api/users/",
      DeleteUser: "/api/users/",
    },
  },
};

export const apiUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`;

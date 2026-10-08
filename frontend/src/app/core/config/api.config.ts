export const API_CONFIG = {
  baseUrl: 'http://localhost:5178/api',
  endpoints: {
    products: '/products',
    users: '/users',
    carts: '/carts'
  }
} as const;
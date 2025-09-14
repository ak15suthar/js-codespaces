// Dynamic API URL constructor with Codespaces support
const getApiUrl = () => {
  // Check if running in Codespaces environment
  if (process.env.REACT_APP_CODESPACES === 'true' && process.env.REACT_APP_CODESPACE_NAME) {
    const domain = process.env.REACT_APP_GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev';
    return `https://${process.env.REACT_APP_CODESPACE_NAME}-8081.${domain}/api`;
  }

  // Use environment variable or fallback to localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:8081/api';
};

const API_URL = getApiUrl();

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
  }
  return await response.json();
};

const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  signup: async (userData) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },
};

const pizzaAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/pizzas`);
    return handleResponse(response);
  },

  getAllWithQuery: async (queryParams) => {
    const params = new URLSearchParams(queryParams);
    const response = await fetch(`${API_URL}/pizzas?${params}`);
    return handleResponse(response);
  },
};

const orderAPI = {
  create: async (orderData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  },

  getUserOrders: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders/mine`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getAll: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};

export { authAPI, pizzaAPI, orderAPI };
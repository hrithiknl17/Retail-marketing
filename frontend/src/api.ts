import type { UserRole } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const DATA_CHANGED_EVENT = 'freshsync:data-changed';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string | null;
}

export interface AuthSession {
  access_token: string;
  refresh_token?: string | null;
  user: AuthUser;
}

let authToken: string | null = null;

const parseJson = async (res: Response) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.detail ||
      data?.error_description ||
      data?.error ||
      'Request failed.';
    throw new Error(message);
  }

  return data;
};

const authHeaders = (headers: Record<string, string> = {}) => ({
  ...headers,
  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
});

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const api = {
  signIn: async (email: string, password: string): Promise<AuthSession> => {
    const res = await fetch(`${API_URL}/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    return parseJson(res);
  },

  signUp: async (payload: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthSession> => {
    const res = await fetch(`${API_URL}/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return parseJson(res);
  },

  getSession: async (): Promise<AuthUser> => {
    const res = await fetch(`${API_URL}/auth/session`, {
      headers: authHeaders(),
    });

    return parseJson(res);
  },

  getProducts: async () => {
    const res = await fetch(`${API_URL}/products`, {
      headers: authHeaders(),
    });
    return parseJson(res);
  },

  getVendors: async () => {
    const res = await fetch(`${API_URL}/vendors`, {
      headers: authHeaders(),
    });
    return parseJson(res);
  },

  getCustomers: async () => {
    const res = await fetch(`${API_URL}/customers`, {
      headers: authHeaders(),
    });
    return parseJson(res);
  },

  createCustomer: async (payload: { name: string; email?: string; phone: string }) => {
    const res = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return parseJson(res);
  },

  getDiscounts: async () => {
    const res = await fetch(`${API_URL}/discounts`, {
      headers: authHeaders(),
    });
    return parseJson(res);
  },

  getSales: async () => {
    const res = await fetch(`${API_URL}/sales`, {
      headers: authHeaders(),
    });
    return parseJson(res);
  },

  createSale: async (payload: {
    items: { productId: string; quantity: number; price: number }[];
    total: number;
    paymentMethod: string;
    customerId?: string;
    discountCode?: string;
    discountAmount?: number;
  }) => {
    const res = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return parseJson(res);
  },

  getDeliveries: async () => {
    const res = await fetch(`${API_URL}/deliveries`, {
      headers: authHeaders(),
    });
    return parseJson(res);
  },

  getDashboard: async () => {
    const res = await fetch(`${API_URL}/dashboard`, {
      headers: authHeaders(),
    });
    return parseJson(res);
  },

  askAssistant: async (message: string) => {
    const res = await fetch(`${API_URL}/ai/assistant`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ message }),
    });
    return parseJson(res);
  },
};

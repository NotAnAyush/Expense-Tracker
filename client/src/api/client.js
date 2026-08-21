export const API_BASE_URL = import.meta.env?.VITE_API_URL || (
  typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? `http://${window.location.hostname}:5000/api`
      : '/api'
    : 'http://localhost:5000/api'
);

export const getLocalDateString = (date = new Date()) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const normalizedEndpoint = endpoint.startsWith('/api/')
    ? endpoint.slice(4)
    : endpoint.startsWith('/api')
    ? endpoint.slice(4)
    : endpoint;

  try {
    const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    // If 401 Unauthorized and not already retried or calling auth endpoints, attempt token refresh
    if (response.status === 401 && !options._retry && !endpoint.includes('/auth/')) {
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedRefreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            localStorage.setItem('token', refreshData.token);
            if (refreshData.refreshToken) {
              localStorage.setItem('refreshToken', refreshData.refreshToken);
            }

            // Retry the original failed request with the new access token
            return apiFetch(endpoint, {
              ...options,
              _retry: true,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${refreshData.token}`,
              },
            });
          }
        } catch (refreshErr) {
          console.error('[Auth Refresh Error]', refreshErr);
        }
      }

      // If refresh failed or no refresh token, trigger global logout
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    if (!response.ok) {
      let errorMessage = 'API request failed';
      if (data.error?.details && Array.isArray(data.error.details) && data.error.details.length > 0) {
        errorMessage = data.error.details.map((d) => d.message).join(' • ');
      } else if (typeof data.error === 'string') {
        errorMessage = data.error;
      } else if (data.error?.message) {
        errorMessage = data.error.message;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (response.status === 401) {
        errorMessage = data.message || data.error?.message || 'Invalid email or password.';
      } else if (response.status === 404) {
        errorMessage = data.message || data.error?.message || 'Requested resource not found (404).';
      } else if (response.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (response.status === 500) {
        errorMessage = data.error?.message || 'Internal server error. Please try again.';
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && String(error.message).toLowerCase().includes('fetch')) {
      error.message = 'Unable to connect to backend server. Please verify the server is running on port 5000.';
    }
    throw error;
  }
};

// ========================
// UPI & Account Aggregator API Helpers
// ========================
export const upiApi = {
  getLinkedAccounts: () => apiFetch('/integrations/upi/accounts'),
  initiateAccountLink: (payload) => apiFetch('/integrations/upi/accounts/link-initiate', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  verifyAccountOtp: (payload) => apiFetch('/integrations/upi/accounts/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  unlinkAccount: (accountId) => apiFetch(`/integrations/upi/accounts/${accountId}`, {
    method: 'DELETE',
  }),
  verifyVpa: (vpa) => apiFetch(`/integrations/upi/verify-vpa?vpa=${encodeURIComponent(vpa)}`),
  generateUpiIntent: (payload) => apiFetch('/integrations/upi/generate-intent', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};

// ========================
// Confidential Secret Vault API Helpers
// ========================
export const vaultApi = {
  getSecrets: () => apiFetch('/vault/secrets'),
  getSecretById: (id) => apiFetch(`/vault/secrets/${id}`),
  createSecret: (payload) => apiFetch('/vault/secrets', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  testSecret: (id) => apiFetch(`/vault/secrets/${id}/test`, {
    method: 'POST',
  }),
  rotateSecret: (id, payload) => apiFetch(`/vault/secrets/${id}/rotate`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  deleteSecret: (id) => apiFetch(`/vault/secrets/${id}`, {
    method: 'DELETE',
  }),
  purgeVault: () => apiFetch('/vault/purge', {
    method: 'POST',
  }),
};



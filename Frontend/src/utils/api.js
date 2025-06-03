import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`
});

// Initialize axios with token if it exists in localStorage
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Function to refresh the access token using refresh token
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('Attempting to refresh access token...');
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/refresh-token`, {
      refreshToken
    });

    if (response.data.success && response.data.accessToken) {
      console.log('Token refresh successful');
      localStorage.setItem('accessToken', response.data.accessToken);
      
      // If a new refresh token is also provided, update it
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return response.data.accessToken;
    } else {
      throw new Error('Failed to refresh token');
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear all auth data and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw error;
  }
};

// Function to check if token needs refresh
export const checkAndRefreshToken = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    
    // Decode token to check expiration
    // Note: This is a simple check without using a library
    // In production, consider using jwt-decode or a similar library
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    // If token is about to expire in the next 5 minutes, refresh it
    if (expirationTime - currentTime < 5 * 60 * 1000) {
      console.log('Token is about to expire, refreshing...');
      await refreshAccessToken();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return false;
  }
};

// Add a request interceptor with token refresh check
api.interceptors.request.use(
  async (config) => {
    // Skip token refresh for auth endpoints to avoid infinite loops
    const isAuthEndpoint = config.url.includes('/auth/login') || 
                          config.url.includes('/auth/register') || 
                          config.url.includes('/auth/refresh-token');
    
    if (!isAuthEndpoint) {
      // Check if token needs refresh before making the request
      try {
        await checkAndRefreshToken();
      } catch (error) {
        console.error('Token refresh check failed:', error);
        // Continue with the request even if refresh fails
      }
    }
    
    // Always attach the latest token
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor with token refresh capability
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const newAccessToken = await refreshAccessToken();
        
        // Update the authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        return Promise.reject(refreshError);
      }
    }
    
    // For other errors, just reject with the error message
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data.error || error.message);
    }
    return Promise.reject(error.message);
  }
);

export const login = async (email, password) => {
  try {
    console.log('Login Debug - Attempting login for:', email);
    
    // Make API call to the backend
    const response = await api.post('/auth/login', { email, password });
    console.log('Login Debug - Response status:', response.status);
    console.log('Login Debug - Response data:', {
      success: response.data.success,
      hasAccessToken: !!response.data.accessToken,
      hasRefreshToken: !!response.data.refreshToken,
      userData: response.data.user ? 'present' : 'missing'
    });
    
    // If login is successful, store tokens and user data
    if (response.data.success && response.data.accessToken) {
      console.log('Login Debug - Storing tokens in localStorage');
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set the default Authorization header for all axios requests
      console.log('Login Debug - Setting axios default headers');
      const authHeader = `Bearer ${response.data.accessToken}`;
      axios.defaults.headers.common['Authorization'] = authHeader;
      api.defaults.headers.common['Authorization'] = authHeader;
      
      return response.data;
    } else {
      console.log('Login Debug - Login failed, no token in response');
      throw new Error(response.data.error || 'Login failed');
    }
  } catch (error) {
    console.log('Login Debug - Error during login:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response'
    });
    throw error;
  }
};

export const register = async (userData) => {
  try {
    // Split fullName into firstName and lastName
    let firstName = userData.firstName;
    let lastName = userData.lastName;
    
    // If only fullName is provided, split it
    if (!firstName && !lastName && userData.fullName) {
      const nameParts = userData.fullName.split(' ');
      firstName = nameParts[0];
      lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    }
    
    const response = await api.post('/auth/register', {
      firstName,
      lastName,
      name: userData.fullName, // For backward compatibility
      email: userData.email,
      password: userData.password,
      role: userData.role || 'user'
    });
    
    if (response.data.success && response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set the default Authorization header for all axios requests
      const authHeader = `Bearer ${response.data.accessToken}`;
      axios.defaults.headers.common['Authorization'] = authHeader;
      api.defaults.headers.common['Authorization'] = authHeader;
      
      return response.data;
    } else {
      throw new Error(response.data.error || 'Registration failed');
    }
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data.error || error.response.data.details || 'Registration failed';
    }
    throw error;
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken');
};

export const logout = async () => {
  try {
    // Call the logout endpoint (optional, since JWT is stateless)
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout API call failed:', error);
    // Continue with client-side logout even if API call fails
  } finally {
    // Remove tokens and user data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear authorization headers
    delete axios.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['Authorization'];
    
    // Redirect to login page
    window.location.href = '/login';
  }
};

export default api;

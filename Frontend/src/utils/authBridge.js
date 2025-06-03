/**
 * Authentication Bridge - Connects Firebase Auth with Backend JWT Auth
 * 
 * This utility creates a bridge between Firebase authentication and the backend's
 * JWT authentication system. It obtains Firebase ID tokens and exchanges them
 * for backend JWT tokens to maintain compatibility with existing API endpoints.
 */

import axios from 'axios';
import { getCurrentUser } from './firebase';

// Base URL for API calls
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

/**
 * Exchange a Firebase ID token for a backend JWT token
 * @returns {Promise<Object>} Object containing accessToken and refreshToken
 */
export const exchangeFirebaseTokenForJWT = async () => {
  try {
    const firebaseUser = getCurrentUser();
    
    if (!firebaseUser) {
      throw new Error('No Firebase user found');
    }
    
    // Get the Firebase ID token
    const firebaseToken = await firebaseUser.getIdToken(true);
    
    if (!firebaseToken) {
      throw new Error('Failed to get Firebase ID token');
    }
    
    // Call the backend endpoint to exchange the token
    // This endpoint needs to be implemented on the backend
    const response = await axios.post(`${API_BASE_URL}/auth/firebase-exchange`, {
      firebaseToken,
      email: firebaseUser.email,
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || ''
    });
    
    if (response.data.success && response.data.accessToken) {
      // Store the JWT tokens
      localStorage.setItem('accessToken', response.data.accessToken);
      
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      // Set auth headers for future requests
      const authHeader = `Bearer ${response.data.accessToken}`;
      axios.defaults.headers.common['Authorization'] = authHeader;
      
      return {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      };
    } else {
      throw new Error('Failed to exchange Firebase token for JWT');
    }
  } catch (error) {
    console.error('Token exchange failed:', error);
    throw error;
  }
};

/**
 * Temporary solution: Create a compatible JWT token based on Firebase user
 * This is a fallback if you can't modify the backend immediately
 * @returns {Object} Object containing a compatible JWT token
 */
export const createCompatibleJWT = async () => {
  try {
    const firebaseUser = getCurrentUser();
    
    if (!firebaseUser) {
      throw new Error('No Firebase user found');
    }
    
    // Get user data from Firebase
    const userData = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      fullName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL,
      role: 'user', // Default role
    };
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Get Firebase ID token to use as access token (force refresh to ensure it's valid)
    console.log('Getting fresh Firebase ID token');
    const idToken = await firebaseUser.getIdToken(true);
    console.log('Got Firebase ID token:', idToken.substring(0, 10) + '...');
    
    // Store tokens in localStorage
    localStorage.setItem('accessToken', idToken);
    localStorage.setItem('refreshToken', idToken); // Use same token for both temporarily
    localStorage.setItem('token', idToken); // For backward compatibility
    
    // Set auth headers for all axios instances
    const authHeader = `Bearer ${idToken}`;
    axios.defaults.headers.common['Authorization'] = authHeader;
    console.log('Set Authorization header for axios');
    
    // Try to exchange token with backend (but continue even if this fails)
    try {
      await exchangeFirebaseTokenForJWT();
      console.log('Successfully exchanged Firebase token with backend');
    } catch (exchangeError) {
      console.warn('Token exchange with backend failed, using Firebase token directly:', exchangeError);
    }
    
    return {
      accessToken: idToken,
      refreshToken: idToken,
      user: userData
    };
  } catch (error) {
    console.error('Failed to create compatible JWT:', error);
    throw error;
  }
};

/**
 * Update authentication headers with current tokens
 * This ensures all axios instances use the same token
 */
export const updateAuthHeaders = () => {
  const accessToken = localStorage.getItem('accessToken');
  
  if (accessToken) {
    console.log('Setting auth headers with token:', accessToken.substring(0, 10) + '...');
    const authHeader = `Bearer ${accessToken}`;
    
    // Set for both default axios instance and any custom instances
    axios.defaults.headers.common['Authorization'] = authHeader;
    
    // Also set token in localStorage as 'token' for backward compatibility
    localStorage.setItem('token', accessToken);
    
    return true;
  }
  
  return false;
};

export default {
  exchangeFirebaseTokenForJWT,
  createCompatibleJWT,
  updateAuthHeaders
};

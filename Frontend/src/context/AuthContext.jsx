import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/api';
import { 
  loginWithFirebase, 
  signupWithFirebase, 
  logoutFromFirebase, 
  getCurrentUser,
  onAuthStateChange
} from '../utils/firebase';
import { createCompatibleJWT, updateAuthHeaders } from '../utils/authBridge';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
export { AuthContext };

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    
    // Initialize state from localStorage if available
    const storedUser = localStorage.getItem('user');
    const initialUser = storedUser ? JSON.parse(storedUser) : null;
    const initialAuthState = !!localStorage.getItem('accessToken') || !!localStorage.getItem('token');
    const storedOrganization = localStorage.getItem('organization');
    const initialOrganization = storedOrganization ? JSON.parse(storedOrganization) : null;
    
    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(true); // Start with loading true
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(initialAuthState);
    const [organization, setOrganization] = useState(initialOrganization);
    const [subscriptionStatus, setSubscriptionStatus] = useState(
        initialOrganization?.subscription?.status || 'unknown'
    );

    // Function to check authentication status using Firebase
    const checkAuthStatus = async () => {
        try {
            console.log('Checking authentication status...');
            setLoading(true);
            
            // Check if Firebase has a current user
            const firebaseUser = getCurrentUser();
            
            if (firebaseUser) {
                console.log('Firebase user found, verifying token');
                try {
                    // Create a compatible JWT token for backend API calls
                    const authData = await createCompatibleJWT();
                    
                    // Set user data from the auth response
                    setUser(authData.user);
                    setIsAuthenticated(true);
                    
                    // Fetch organization data
                    try {
                        const orgResponse = await api.get('/api/organization/current');
                        if (orgResponse.data && orgResponse.data.success) {
                            const orgData = orgResponse.data.data;
                            setOrganization(orgData);
                            setSubscriptionStatus(orgData.subscription.status);
                            localStorage.setItem('organization', JSON.stringify(orgData));
                            
                            // Check subscription status
                            if (orgData.subscription.status === 'expired' || orgData.subscription.status === 'cancelled') {
                                console.warn('Subscription expired or cancelled');
                                // Redirect to subscription page if needed
                                if (window.location.pathname !== '/subscription') {
                                    navigate('/subscription', { state: { expired: true } });
                                }
                            }
                        }
                    } catch (orgError) {
                        console.error('Failed to fetch organization data:', orgError);
                        // If 404, user might not be associated with an organization yet
                        if (orgError.response && orgError.response.status === 404) {
                            // Redirect to organization creation if needed
                            if (window.location.pathname !== '/register-organization') {
                                navigate('/register-organization');
                            }
                        }
                    }
                    
                    console.log('Authentication successful, tokens created for backend compatibility');
                    return true;
                } catch (tokenError) {
                    console.error('Failed to create compatible tokens:', tokenError);
                    
                    // Fallback to using Firebase user data directly
                    const idToken = await firebaseUser.getIdToken(true);
                    
                    // Store tokens in localStorage for both new and legacy keys
                    localStorage.setItem('accessToken', idToken);
                    localStorage.setItem('token', idToken);
                    
                    // Update auth headers
                    const authHeader = `Bearer ${idToken}`;
                    axios.defaults.headers.common['Authorization'] = authHeader;
                    api.defaults.headers.common['Authorization'] = authHeader;
                    
                    // Update user data
                    const userData = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        fullName: firebaseUser.displayName || '',
                        photoURL: firebaseUser.photoURL,
                    };
                    
                    setUser(userData);
                    setIsAuthenticated(true);
                    localStorage.setItem('user', JSON.stringify(userData));
                    
                    // Try to fetch organization data
                    try {
                        const orgResponse = await api.get('/api/organization/current');
                        if (orgResponse.data && orgResponse.data.success) {
                            const orgData = orgResponse.data.data;
                            setOrganization(orgData);
                            setSubscriptionStatus(orgData.subscription.status);
                            localStorage.setItem('organization', JSON.stringify(orgData));
                            
                            // Check subscription status
                            if (orgData.subscription.status === 'expired' || orgData.subscription.status === 'cancelled') {
                                console.warn('Subscription expired or cancelled');
                                // Redirect to subscription page if needed
                                if (window.location.pathname !== '/subscription') {
                                    navigate('/subscription', { state: { expired: true } });
                                }
                            }
                        }
                    } catch (orgError) {
                        console.error('Failed to fetch organization data:', orgError);
                    }
                    
                    return true;
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                return false;
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setIsAuthenticated(false);
            setUser(null);
            return false;
        } finally {
            setLoading(false);
        }
    };
    
    // Initialize auth on page load
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                console.log('Initializing authentication state...');
                // Check if we have tokens in localStorage
                const accessToken = localStorage.getItem('accessToken');
                const legacyToken = localStorage.getItem('token');
                const hasToken = !!accessToken || !!legacyToken;
                
                if (hasToken) {
                    console.log('Found existing tokens, restoring auth state');
                    // Ensure both token locations are synchronized
                    if (accessToken && !legacyToken) {
                        localStorage.setItem('token', accessToken);
                    } else if (legacyToken && !accessToken) {
                        localStorage.setItem('accessToken', legacyToken);
                    }
                    
                    // Update auth headers with existing tokens
                    updateAuthHeaders();
                    
                    // Manually set authenticated state if we have tokens
                    // This prevents flashing login screen on refresh
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                        setIsAuthenticated(true);
                    }
                }
                
                // Always check Firebase auth status regardless of localStorage
                await checkAuthStatus();
            } catch (error) {
                console.error('Error initializing auth:', error);
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        
        initializeAuth();
    }, []);

    // Set up Firebase auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChange(async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    console.log('Firebase auth state changed: User signed in');
                    // User is signed in - create compatible JWT tokens for backend
                    await checkAuthStatus();
                    
                    // Update auth headers with the tokens
                    updateAuthHeaders();
                } else {
                    console.log('Firebase auth state changed: User signed out');
                    // User is signed out
                    setUser(null);
                    setIsAuthenticated(false);
                    
                    // Clear all auth data
                    localStorage.removeItem('user');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('token'); // Also remove legacy token
                    
                    // Clear auth headers
                    delete axios.defaults.headers.common['Authorization'];
                    delete api.defaults.headers.common['Authorization'];
                }
            } catch (error) {
                console.error('Error in auth state change handler:', error);
            } finally {
                setLoading(false);
            }
        });
        
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            
            // Use Firebase authentication
            const response = await loginWithFirebase(email, password);
            
            if (response.success && response.user) {
                try {
                    // Create compatible JWT tokens for backend API calls
                    await createCompatibleJWT();
                    
                    // Fetch organization data
                    try {
                        const orgResponse = await api.get('/api/organization/current');
                        if (orgResponse.data && orgResponse.data.success) {
                            const orgData = orgResponse.data.data;
                            setOrganization(orgData);
                            setSubscriptionStatus(orgData.subscription.status);
                            localStorage.setItem('organization', JSON.stringify(orgData));
                            
                            // Check subscription status
                            if (orgData.subscription.status === 'expired' || orgData.subscription.status === 'cancelled') {
                                console.warn('Subscription expired or cancelled');
                                // We'll handle the redirect after login completes
                            }
                        }
                    } catch (orgError) {
                        console.error('Failed to fetch organization data:', orgError);
                        // If 404, user might not be associated with an organization yet
                        if (orgError.response && orgError.response.status === 404) {
                            // We'll handle the redirect after login completes
                        }
                    }
                    
                    // Manually set authenticated state for immediate feedback
                    setIsAuthenticated(true);
                    
                    // Get user data from Firebase user
                    const userData = {
                        id: response.user.uid,
                        email: response.user.email,
                        fullName: response.user.displayName || '',
                        photoURL: response.user.photoURL,
                    };
                    
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    
                    console.log('Login successful, tokens created for backend compatibility');
                    return true;
                } catch (tokenError) {
                    console.error('Failed to create compatible tokens:', tokenError);
                    // Still return success as Firebase auth worked
                    return true;
                }
            } else {
                throw new Error(response.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(typeof err === 'string' ? err : 'Login failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            
            // Use Firebase authentication
            const response = await signupWithFirebase(
                userData.email, 
                userData.password, 
                userData.fullName
            );
            
            if (response.success && response.user) {
                // Firebase auth state change will trigger the useEffect
                // which will update the user state
                return true;
            } else {
                throw new Error(response.error || 'Registration failed');
            }
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Registration failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            // Use Firebase logout
            await logoutFromFirebase();
            // Firebase auth state change will handle the rest
            
            // Clear organization data
            setOrganization(null);
            setSubscriptionStatus('unknown');
            localStorage.removeItem('organization');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if Firebase logout fails, clear the local state
            setUser(null);
            setIsAuthenticated(false);
            setOrganization(null);
            setSubscriptionStatus('unknown');
            localStorage.removeItem('organization');
        } finally {
            setLoading(false);
        }
    };
    
    // Function to refresh user data from Firebase
    const refreshUserData = async () => {
        try {
            setLoading(true);
            const firebaseUser = getCurrentUser();
            
            if (firebaseUser) {
                try {
                    // Create compatible JWT tokens for backend API calls
                    const authData = await createCompatibleJWT();
                    
                    // Update user data
                    
                    // Fetch organization data
                    try {
                        const orgResponse = await api.get('/api/organization/current');
                        if (orgResponse.data && orgResponse.data.success) {
                            const orgData = orgResponse.data.data;
                            setOrganization(orgData);
                            setSubscriptionStatus(orgData.subscription.status);
                            localStorage.setItem('organization', JSON.stringify(orgData));
                        }
                    } catch (orgError) {
                        console.error('Failed to fetch organization data:', orgError);
                    }
                    setUser(authData.user);
                    
                    console.log('User data refreshed, tokens updated for backend compatibility');
                } catch (tokenError) {
                    console.error('Failed to create compatible tokens during refresh:', tokenError);
                    
                    // Fallback to using Firebase user data directly
                    const idToken = await firebaseUser.getIdToken(true);
                    
                    // Update auth headers
                    const authHeader = `Bearer ${idToken}`;
                    axios.defaults.headers.common['Authorization'] = authHeader;
                    api.defaults.headers.common['Authorization'] = authHeader;
                    localStorage.setItem('accessToken', idToken);
                    localStorage.setItem('token', idToken); // Also set legacy token
                    
                    // Update user data
                    const userData = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        fullName: firebaseUser.displayName || '',
                        photoURL: firebaseUser.photoURL,
                    };
                    
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                }
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // This function was removed to fix duplicate declaration

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            error, 
            login, 
            signup, 
            logout,
            refreshUserData,
            checkAuthStatus,
            isAuthenticated,
            organization,
            subscriptionStatus,
            hasActiveSubscription: subscriptionStatus === 'active'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
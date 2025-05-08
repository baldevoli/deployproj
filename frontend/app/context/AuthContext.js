/**
 * Authentication Context
 * 
 * This file implements the authentication context for the application,
 * providing sign-in and sign-out functionality along with user state management.
 * It serves as a central place to manage authentication state that can be
 * accessed throughout the application.
 */

'use client';

import { createContext, useState, useContext, useEffect } from 'react';

// Create the auth context with default values
const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  signIn: () => {},
  signOut: () => {},
});

/**
 * AuthProvider Component
 * 
 * This component wraps around parts of the application that need access to
 * authentication state. It manages authentication state and provides methods
 * to sign in and sign out.
 */
export function AuthProvider({ children }) {
  // State for tracking authentication status and user data
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load authentication state from localStorage on component mount
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('auth');
      
      if (auth) {
        try {
          const authData = JSON.parse(auth);
          if (authData.user && authData.token) {
            setIsAuthenticated(true);
            setUser(authData.user);
          } else {
            // Clear invalid auth data
            localStorage.removeItem('auth');
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          // Handle parsing error by clearing invalid auth data
          console.error('Error parsing auth data:', error);
          localStorage.removeItem('auth');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  /**
   * Sign in a user with the provided user data and token
   * Stores authentication data in localStorage and updates state
   */
  const signIn = (userData, token = 'admin-token') => {
    if (!userData) {
      console.error('No user data provided to signIn');
      return;
    }

    // Store the authentication data in localStorage
    const authData = {
      user: userData,
      token: token
    };
    localStorage.setItem('auth', JSON.stringify(authData));
    
    // Update the authentication state
    setIsAuthenticated(true);
    setUser(userData);
  };
  
  /**
   * Sign out the current user
   * Removes authentication data from localStorage and updates state
   */
  const signOut = () => {
    // Remove authentication data from localStorage
    localStorage.removeItem('auth');
    
    // Update the authentication state
    setIsAuthenticated(false);
    setUser(null);
  };

  // Provide the auth context to child components
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to access the auth context
export const useAuth = () => useContext(AuthContext); 
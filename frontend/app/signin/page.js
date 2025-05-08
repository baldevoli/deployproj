/**
 * Sign In Page Component
 * 
 * This component handles user authentication by providing a sign-in form
 * and verifying credentials against the backend API. It supports both regular
 * user authentication and a special admin login path.
 */
'use client';

// Import necessary React hooks and Next.js components
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../../styles/SignIn.module.css';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {
  // Initialize Next.js router for navigation
  const router = useRouter();
  // Get signIn function from auth context
  const { signIn } = useAuth();
  // State for form data (email and password)
  const [formData, setFormData] = useState({ email: '', password: '' });
  // State for error messages
  const [error, setError] = useState('');
  // State to track loading status during authentication
  const [isLoading, setIsLoading] = useState(false);

  // Effect to hide navbar on the sign-in page
  useEffect(() => {
    document.body.classList.add('hide-navbar');
    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('hide-navbar');
    };
  }, []);

  /**
   * Handle input changes in the form fields
   * Updates the form state with the new values
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Validate email format using regular expression
   * @param {string} email - Email address to validate
   * @returns {boolean} - True if email format is valid
   */
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  /**
   * Handle form submission for user authentication
   * Validates inputs, checks credentials, and redirects on success
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    
    console.log('Login attempt:', { email, password });
    setError('');
    
    // Basic validation - check if fields are filled
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    // Special case for admin login (hardcoded credentials)
    // Note: In production, this should be replaced with proper authentication
    if (email === 'admin' && password === 'admin') {
      console.log('Admin credentials matched');
      // Set admin user in auth context with persistent data
      const adminUser = {
        user_id: 'ADMIN-123',
        role: 'admin',
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@example.com'
      };
      // Sign in with admin token
      signIn(adminUser, 'admin-token');
      // Redirect to admin page
      router.push('/admin/dashboard');
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Fetch user data from the backend API
      const response = await fetch(`http://localhost:8000/api/users?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error('Failed to connect to authentication service');
      }
      
      const users = await response.json();
      
      // Find user with matching email and password
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      console.log('User authenticated:', user);
      // Store user data in auth context with a token
      signIn(user, 'user-token');
      
      // Redirect based on user role
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/inventory');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.signinContainer} no-navbar`}>
      {/* App title banner */}
      <div className={styles.titleBanner}>
        <Link href="/" className={styles.titleLink}>Retriever&apos;s Essentials</Link>
      </div>

      <div className={styles.signinContent}>
        <div className={styles.signinFormContainer}>
          <h2>Sign In</h2>
          {/* Display error message if authentication fails */}
          {error && <div className={styles.errorMessage}>{error}</div>}

          {/* Sign-in form */}
          <form onSubmit={handleSubmit} className={styles.signinForm}>
            {/* Email input field */}
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            {/* Password input field */}
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            {/* Submit button with loading state */}
            <button 
              type="submit" 
              className={styles.signinButton}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Link to sign up page for new users */}
          <div className={styles.signupLink}>
            Don't have an account? <Link href="/signup">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

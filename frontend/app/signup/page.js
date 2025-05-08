/**
 * Signup Page Component
 * 
 * This component handles user registration by providing a signup form
 * and submitting user data to the backend API. It includes form validation,
 * error handling, and success notifications.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../styles/Signup.module.css';

export default function Signup() {
  // Initialize Next.js router for navigation after signup
  const router = useRouter();
  
  // State for form data with all required user registration fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''  
  });

  // State for validation errors
  const [errors, setErrors] = useState({});
  // State to show success message after successful registration
  const [showSuccess, setShowSuccess] = useState(false);
  // State to store the generated user ID
  const [userId, setUserId] = useState('');

  // Use environment variable for API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Effect to hide navbar on the signup page
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
   * Validate all form fields before submission
   * Checks for required fields, email format, password strength, etc.
   * @returns {boolean} - True if form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};
    // Check required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    // Email validation
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    // Password validation
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    // Password confirmation validation
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    // Phone validation - optional field but validate format if provided
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // Status validation
    if (!formData.status) newErrors.status = 'Please select a status';
    
    // Update error state
    setErrors(newErrors);
    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Generate unique user ID based on user's name
   * Creates an ID with initials and random numbers
   * @param {string} firstName - User's first name
   * @param {string} lastName - User's last name
   * @returns {string} - Generated user ID
   */
  const generateUserId = (firstName, lastName) => {
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    const randomNumbers = Math.floor(10000 + Math.random() * 90000);
    return `${firstInitial}${lastInitial}${randomNumbers}`;
  };

  /**
   * Handle form submission for user registration
   * Validates form, prepares user data, and sends to API
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Format the data for the API
        const userData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || null,  // Include phone in the request
          status: formData.status,
          role: 'student', // Default role for new users
          // Generate user_id in frontend to ensure it's present
          user_id: generateUserId(formData.firstName, formData.lastName)
        };
        
        console.log('Sending signup data to API:', userData);
        
        // Send data to the backend API
        const response = await fetch(`${API_URL}/api/users/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        // Handle API error responses
        if (!response.ok) {
          console.error('Server error:', data);
          throw new Error(data.error || data.details || 'Failed to create account');
        }
        
        console.log('Signup successful:', data);
        // Store the user ID from the response
        setUserId(data.user_id || userData.user_id);
        // Show success message
        setShowSuccess(true);
        // Redirect to sign-in page after a delay
        setTimeout(() => {
          setShowSuccess(false);
          router.push('/signin');
        }, 3000);
      } catch (error) {
        console.error('Signup error:', error);
        let errorMessage = 'Failed to create account. Please try again.';
        
        // Handle different error types
        if (error.message) {
          if (error.message.includes('duplicate') || error.message.includes('already registered')) {
            errorMessage = 'This email is already registered. Please use a different email.';
          } else {
            errorMessage = error.message;
          }
        }
        
        // Set general error message
        setErrors({
          ...errors,
          general: errorMessage
        });
      }
    }
  };

  return (
    <div className={`${styles.signupContainer} no-navbar`}>
      {/* App title banner */}
      <div className={styles.titleBanner}>
        <Link href="/" className={styles.titleLink}>Retriever&apos;s Essentials</Link>
      </div>

      <div className={styles.signupContent}>
        <div className={styles.signupFormContainer}>
          <h2>Create Account</h2>
          
          {/* Display general error message if present */}
          {errors.general && (
            <div className={styles.errorMessage} style={{marginBottom: '1rem'}}>
              {errors.general}
            </div>
          )}
          
          {/* User registration form */}
          <form onSubmit={handleSubmit} className={styles.signupForm}>
            {/* First name field */}
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? styles.error : ''}
              />
              {errors.firstName && <div className={styles.errorMessage}>{errors.firstName}</div>}
            </div>

            {/* Last name field */}
            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? styles.error : ''}
              />
              {errors.lastName && <div className={styles.errorMessage}>{errors.lastName}</div>}
            </div>

            {/* Email field */}
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? styles.error : ''}
              />
              {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
            </div>

            {/* Password field */}
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? styles.error : ''}
              />
              {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}
            </div>

            {/* Confirm password field */}
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? styles.error : ''}
              />
              {errors.confirmPassword && <div className={styles.errorMessage}>{errors.confirmPassword}</div>}
            </div>

            {/* Phone number field (optional) */}
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                name="phone"
                id="phone"
                placeholder=" "
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? styles.error : ''}
              />
              {errors.phone && <div className={styles.errorMessage}>{errors.phone}</div>}
            </div>

            {/* Status selection dropdown */}
            <div className={styles.formGroup}>
              <label htmlFor="status">Select Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={errors.status ? styles.error : ''}
              >
                <option value="">-- Select Status --</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Graduate">Graduate</option>
              </select>
              {errors.status && <div className={styles.errorMessage}>{errors.status}</div>}
            </div>

            {/* Submit button */}
            <button type="submit" className={styles.signupButton}>Sign Up</button>
          </form>

          {/* Link to sign in page for existing users */}
          <p className={styles.signinLink}>
            Already have an account? <Link href="/signin">Sign In</Link>
          </p>
        </div>
      </div>

      {showSuccess && (
        <div className={styles.successPopup}>
          <div className={styles.successMessage}>
            Signup Successful
            {userId && <div>Your User ID: {userId}</div>}
            <div className={styles.smallText}>Redirecting to login page...</div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Add Vendor Page
 * 
 * This page provides a form to add new vendors to the system.
 * It includes form validation, error handling, and success notifications.
 */
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Vendors.module.css';
import Link from 'next/link';

export default function AddVendor() {
  // Router initialization for navigation
  const router = useRouter();
  
  // Form data state
  const [formData, setFormData] = useState({
    vendor_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
  });

  // Submission and UI states
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  /**
   * Handles form input changes and clears errors for the changed field
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validates the vendor form before submission
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    const errors = {};
    if (!formData.vendor_name.trim()) errors.vendor_name = 'Vendor name is required';
    
    // Simple email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handles vendor form submission (create)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL_DEV;
      const url = `${API_URL}/api/vendors`;
      
      // Create data object for API request
      const submissionData = {
        // Include admin role to pass the authorizeAdmin middleware check
        role: 'admin',
        vendor_name: formData.vendor_name,
        contact_person: formData.contact_person,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      };
      
      console.log('Submitting vendor data:', submissionData);
      
      // Send request to API with improved error handling
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Role': 'admin', // Add role in header for extra authorization method
        },
        body: JSON.stringify(submissionData),
        credentials: 'include'
      });
      
      let responseData;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        responseData = { error: text || 'Unknown error occurred' };
      }
      
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || `Error ${response.status}: Failed to save vendor`);
      }
      
      // Display success message
      setActionMessage({
        type: 'success',
        text: `Vendor "${formData.vendor_name}" added successfully!`
      });
      
      // Reset form
      setFormData({
        vendor_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: ''
      });
      
      // Redirect after successful submission
      setTimeout(() => {
        router.push('/vendors');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting vendor:', error);
      setActionMessage({
        type: 'error',
        text: error.message || 'Failed to add vendor. Please try again.'
      });
    } finally {
      setSubmitLoading(false);
      
      // Clear error/success message after 5 seconds
      setTimeout(() => {
        setActionMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  return (
    <div className={styles.vendorFormContainer}>
      <div className={styles.formHeader}>
        <h1>Add New Vendor</h1>
        <Link href="/vendors" className={styles.backLink}>
          Back to Vendors
        </Link>
      </div>

      {/* Success/Error message */}
      {actionMessage.text && (
        <div className={`${styles.message} ${styles[actionMessage.type]}`}>
          {actionMessage.text}
        </div>
      )}

      <div className={styles.formWrapper}>
        <form onSubmit={handleSubmit} className={styles.vendorForm}>
          {/* Vendor name field */}
          <div className={styles.formGroup}>
            <label htmlFor="vendor_name">Vendor Name*</label>
            <input
              type="text"
              id="vendor_name"
              name="vendor_name"
              value={formData.vendor_name}
              onChange={handleInputChange}
              className={formErrors.vendor_name ? styles.errorInput : ''}
            />
            {formErrors.vendor_name && <p className={styles.errorText}>{formErrors.vendor_name}</p>}
          </div>
          
          {/* Contact person field */}
          <div className={styles.formGroup}>
            <label htmlFor="contact_person">Contact Person</label>
            <input
              type="text"
              id="contact_person"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleInputChange}
            />
          </div>
          
          {/* Email field */}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={formErrors.email ? styles.errorInput : ''}
            />
            {formErrors.email && <p className={styles.errorText}>{formErrors.email}</p>}
          </div>
          
          {/* Phone field */}
          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          
          {/* Address field */}
          <div className={styles.formGroup}>
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
            ></textarea>
          </div>
          
          {/* Form action buttons */}
          <div className={styles.actionButtons}>
            <Link href="/vendors">
              <button
                type="button"
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitLoading}
            >
              {submitLoading ? 'Saving...' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
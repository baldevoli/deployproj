/**
 * Admin Vendors Management Page
 * 
 * This page allows admin users to manage vendors in the system.
 * It provides functionality to view, search, add, edit, and delete vendors.
 * Admin authorization is required to access this page.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useVendors } from '@/app/context/VendorsContext';
import styles from '@/styles/Vendors.module.css';
import Navbar from '@/app/components/Navbar';

export default function AdminVendors() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { vendors, loading, error, fetchVendors } = useVendors();
  
  // State for UI management
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState(null);
  const [currentViewVendor, setCurrentViewVendor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [formData, setFormData] = useState({
    vendor_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
  });

  // API URL
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Check authentication and admin role
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/signin');
    }
  }, [isAuthenticated, user, router]);

  // Filter vendors based on search query
  const filteredVendors = vendors.filter((vendor) => {
    return (
      vendor.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  /**
   * Opens the modal for adding a new vendor or editing an existing one
   * @param {Object|null} vendor - Vendor to edit or null for a new vendor
   */
  const handleOpenModal = (vendor = null) => {
    if (vendor) {
      // Edit mode - populate form with vendor data
      setCurrentVendor(vendor);
      setFormData({
        vendor_name: vendor.vendor_name || '',
        contact_person: vendor.contact_person || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || ''
      });
    } else {
      // Add mode - reset form data
      setCurrentVendor(null);
      setFormData({
        vendor_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: ''
      });
    }
    // Clear any previous errors
    setApiError('');
    // Show the modal
    setIsModalOpen(true);
  };

  /**
   * Closes the vendor form modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  /**
   * Handles clicks outside the modal to close it
   * @param {Event} e - Click event
   */
  const handleOutsideClick = (e) => {
    // Make sure we're clicking on the modal backdrop, not its children
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  /**
   * Handles form input changes and clears errors for changed fields
   * @param {Event} e - Change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Update form data
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (apiError[name]) {
      setApiError(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validates the vendor form before submission
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    const errors = {};
    // Vendor name is required
    if (!formData.vendor_name.trim()) errors.vendor_name = 'Vendor name is required';
    
    // Simple email validation if provided
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setApiError(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handles vendor form submission (create or update)
   * Validates input, submits to API, and handles response
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError('');

      // Determine if we're creating a new vendor or updating an existing one
      const isNewVendor = !currentVendor;
      const url = isNewVendor 
        ? `${API_URL}/api/vendors`
        : `${API_URL}/api/vendors/${currentVendor.vendor_id}`;
      
      // Make the API request
      const response = await fetch(url, {
        method: isNewVendor ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Handle the response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save vendor');
      }

      // Close the modal and reset form
      handleCloseModal();
      
      // Show success message
      setSuccessMessage(
        isNewVendor 
          ? 'Vendor added successfully!' 
          : 'Vendor updated successfully!'
      );
      
      // Refresh the vendors list
      await fetchVendors();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error saving vendor:', error);
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show items for a specific vendor
  const showVendorItems = async (vendor) => {
    try {
      setIsSubmitting(true);
      setApiError('');

      console.log(`Showing items for vendor: ${vendor.vendor_name} (ID: ${vendor.vendor_id})`);
      
      // Fetch items for this vendor
      const response = await fetch(`${API_URL}/api/vendors/${vendor.vendor_id}/items`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendor items');
      }
      
      const items = await response.json();
      console.log(`Fetched ${items.length} items for vendor ${vendor.vendor_name}`);
      
      // Calculate totals
      const totals = items.reduce((acc, item) => {
        // Add to quantity total
        acc.totalQuantity += parseInt(item.quantity || 0);
        
        // Add to weight total if weight_amount exists
        if (item.weight_amount) {
          acc.totalWeight += parseFloat(item.weight_amount) * parseInt(item.quantity || 1);
        }
        
        return acc;
      }, { totalQuantity: 0, totalWeight: 0 });
      
      // Update the current view vendor with its items and totals
      setCurrentViewVendor({
        ...vendor,
        items: items || [],
        totals
      });
      
    } catch (error) {
      console.error('Error showing vendor items:', error);
      setApiError(error.message || 'Failed to load vendor items');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close the items view
  const handleCloseItemsView = () => {
    setCurrentViewVendor(null);
  };

  /**
   * Handles vendor deletion with confirmation
   * Validates admin access and prevents deletion of vendors with associated items
   * @param {Object} vendor - The vendor to delete
   */
  const handleDelete = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError('');

      const response = await fetch(`${API_URL}/api/vendors/${vendorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete vendor');
      }

      // Show success message
      setSuccessMessage('Vendor deleted successfully!');
      
      // Refresh the vendors list
      await fetchVendors();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error deleting vendor:', error);
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Main component render for authorized admin users
  return (
    <>
      <Navbar />
      <main className={styles.vendorsContainer}>
        <h2>{currentViewVendor ? `${currentViewVendor?.vendor_name}'s Items` : 'Vendor Management (Admin)'}</h2>
        
        {/* Global action message that displays in any view */}
        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}
        {apiError && (
          <div className={styles.errorMessage}>{apiError}</div>
        )}

        {/* Conditional rendering based on current view */}
        {currentViewVendor ? (
          // Vendor items view
          <>
            <div className={styles.backButtonContainer || ''}>
              <button 
                className={styles.backButton}
                onClick={handleCloseItemsView}
              >
                ← Back to Vendors
              </button>
            </div>
            
            {isSubmitting ? (
              <div className={styles.loadingMessage}>
                <p>Loading items...</p>
              </div>
            ) : (
              <div className={styles.itemsGrid}>
                {currentViewVendor.items.map(item => (
                  <div key={item.product_id || Math.random()} className={styles.itemCard}>
                    <h3 className={styles.itemName}>{item.product_name}</h3>
                    <p className={styles.itemDetail}><strong>Type:</strong> {item.type}</p>
                    {item.weight_amount ? (
                      <p className={styles.itemDetail}>
                        <strong>Stock:</strong> {item.weight_amount} lbs
                      </p>
                    ) : (
                      <p className={styles.itemDetail}>
                        <strong>Stock:</strong> {item.order_quantity || 0} units
                      </p>
                    )}
                    <p className={styles.itemDetail}><strong>Description:</strong> {item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Vendors list view
          <>
            {/* Search and add controls */}
            <div className={styles.controls}>
              <input
                type="text"
                placeholder="Search vendors..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                className={styles["add-vendor-button"]} 
                onClick={() => handleOpenModal()}
              >
                Add Vendor
              </button>
            </div>

            {/* Display loading, error, or vendors grid */}
            {loading ? (
              <p className={styles.loadingMessage}>Loading vendors...</p>
            ) : (
              <div className={styles.vendorsGrid}>
                {/* Show message if no vendors found */}
                {filteredVendors.length === 0 ? (
                  <p className={styles.noVendorsMessage}>No vendors found. Add your first vendor!</p>
                ) : (
                  /* Map over filtered vendors to display cards */
                  filteredVendors.map((vendor) => (
                    <div key={vendor.vendor_id} className={styles.vendorCard}>
                      <h3 className={styles.vendorName}>{vendor.vendor_name}</h3>
                      
                      {/* Vendor details section */}
                      <div className={styles.vendorDetails}>
                        {vendor.contact_person && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Contact:</span>
                            <span>{vendor.contact_person}</span>
                          </div>
                        )}
                        {vendor.email && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Email:</span>
                            <span>{vendor.email}</span>
                          </div>
                        )}
                        {vendor.phone && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Phone:</span>
                            <span>{vendor.phone}</span>
                          </div>
                        )}
                        {vendor.address && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Address:</span>
                            <span>{vendor.address}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Vendor action buttons */}
                      <div className={styles.vendorCardActions}>
                        <button 
                          className={styles.viewItemsButton}
                          onClick={() => showVendorItems(vendor)}
                        >
                          View Items
                        </button>
                        <button
                          className={styles.editButton}
                          onClick={() => handleOpenModal(vendor)}
                        >
                          Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(vendor.vendor_id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* Modal for adding/editing vendors */}
        {isModalOpen && (
          <div 
            className={styles.modal} 
            onClick={handleOutsideClick}
            aria-modal="true"
            role="dialog"
          >
            <div className={styles.modalContent}>
              {/* Modal header */}
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>
                  {currentVendor ? 'Edit Vendor' : 'Add New Vendor'}
                </h3>
                <button 
                  className={styles.closeButton}
                  onClick={handleCloseModal}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>
              
              {/* Vendor form */}
              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Vendor name input field */}
                <div className={styles.formGroup}>
                  <label htmlFor="vendor_name">Vendor Name *</label>
                  <input
                    type="text"
                    id="vendor_name"
                    name="vendor_name"
                    value={formData.vendor_name}
                    onChange={handleInputChange}
                    required
                  />
                  {apiError.vendor_name && <div className={styles.error}>{apiError.vendor_name}</div>}
                </div>
                
                {/* Contact person input field */}
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
                
                {/* Email input field */}
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {apiError.email && <div className={styles.error}>{apiError.email}</div>}
                </div>
                
                {/* Phone input field */}
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Address input field */}
                <div className={styles.formGroup}>
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Form action buttons */}
                <div className={styles.buttonGroup}>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {/* Dynamic button text based on state */}
                    {isSubmitting ? 'Saving...' : currentVendor ? 'Update' : 'Add'} Vendor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
} 
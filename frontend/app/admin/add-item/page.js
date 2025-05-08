'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from '../../../styles/AddItem.module.css';
import Navbar from '../../components/Navbar';
import { useVendors } from '../../context/VendorsContext';

export default function AdminAddItem() {
  // Initialize router for navigation
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { vendors } = useVendors();
  
  // Check if user is admin on component load
  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!isAuthenticated) {
      router.push('/signin');
    } else if (user?.role !== 'admin') {
      router.push('/admin/add-item');
    }
  }, [isAuthenticated, user, router]);

  // Handle URL parameters and pre-fill form
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const itemId = searchParams.get('id');
    
    if (itemId && isAuthenticated && user?.role === 'admin') {
      setIsUpdateMode(true); // Set update mode when ID is in URL
      const fetchItemData = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_DEV || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/items/${itemId}`);
          if (response.ok) {
            const existingItem = await response.json();
            setFormData({
              product_id: itemId,
              product_name: existingItem.product_name || '',
              description: existingItem.description || '',
              type: existingItem.type || '',
              vendor_id: existingItem.vendor_id?.toString() || '',
              price_per_unit: existingItem.price_per_unit?.toString() || '',
              order_quantity: '',
              weight_amount: ''
            });
            setSuccess('Item data loaded for updating. Modify values as needed.');
          } else {
            setError('Failed to load item data. Please try again.');
          }
        } catch (err) {
          console.error('Error fetching item data:', err);
          setError('Error loading item data: ' + err.message);
        }
      };
      
      fetchItemData();
    }
  }, [isAuthenticated, user]);
  
  // State for form data with initial empty values
  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    description: '',
    type: '', // Default type
    vendor_id: '',
    order_quantity: '',
    price_per_unit: '',
    weight_amount: ''
  });

  // State for vendors list
  const [loadingVendors, setLoadingVendors] = useState(true);

  // State for error and success messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  
  // Use environment variable for API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL_DEV || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Fetch vendors on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(`${API_URL}/api/vendors`);
        if (!response.ok) {
          throw new Error('Failed to fetch vendors');
        }
        const data = await response.json();
        setVendors(data);
      } catch (err) {
        console.error('Error fetching vendors:', err);
      } finally {
        setLoadingVendors(false);
      }
    };
    
    // Only fetch if user is authenticated and admin
    if (isAuthenticated && user?.role === 'admin') {
      fetchVendors();
    }
  }, [isAuthenticated, user]);

  // Handle input changes and update form state
  const handleChange = async (e) => {
    const { name, value } = e.target;
    console.log('Input changed:', name, value);
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // If product_id is being changed, check if it exists
    if (name === 'product_id' && value.trim()) {
      try {
        console.log('Checking product ID:', value.trim());
        const response = await fetch(`${API_URL}/api/items/${value.trim()}`);
        console.log('API Response:', response.status);
        
        let existingItem = null;
        try {
          existingItem = await response.json();
        } catch (err) {
          // JSON parse error means no valid item data
          existingItem = null;
        }
        
        if (response.ok && existingItem && Object.keys(existingItem).length > 0) {
          console.log('Found existing item:', existingItem);
          
          // Auto-fill the form with existing item data
          const updatedFormData = {
            ...formData,
            product_id: value.trim(), // Keep the product_id
            product_name: existingItem.product_name || '',
            description: existingItem.description || '',
            type: existingItem.type || '',
            vendor_id: existingItem.vendor_id?.toString() || '',
            price_per_unit: existingItem.price_per_unit?.toString() || '',
            order_quantity: '', // Reset quantity to empty
            weight_amount: '' // Reset weight to empty
          };
          
          console.log('Updating form with:', updatedFormData);
          setFormData(updatedFormData);
          setSuccess('Existing item found. Fields have been auto-filled. Update values as needed.');
          // Clear message after 2 seconds
          setTimeout(() => {
            setSuccess('');
          }, 1000);
        } else {
          console.log('No existing item found');
          setSuccess('Entering new item in the inventory. Please fill in the details.');
          setError('');
          // Clear message after 2 seconds
          setTimeout(() => {
            setSuccess('');
          }, 1000);
        }
      } catch (err) {
        // Network or other errors
        console.error('Error checking item:', err);
        setSuccess('Entering new item in the inventory. Please fill in the details.');
        setError('');
        // Clear message after 2 seconds
        setTimeout(() => {
          setSuccess('');
        }, 2000);
      }
    }
  };

  // Validate form inputs before submission
  const validateForm = () => {
    const errors = {};
    
    // Check if product name is provided
    if (!formData.product_name.trim()) {
      errors.product_name = 'Product name is required';
    }
    
    // Check if description is provided
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    // Validate vendor ID
    if (!formData.vendor_id) {
      errors.vendor_id = 'Vendor selection is required';
    }
    
    // Validate price
    if (!formData.price_per_unit || isNaN(formData.price_per_unit)) {
      errors.price_per_unit = 'Valid price is required';
    }

    // Validate quantity if provided
    if (formData.order_quantity && isNaN(formData.order_quantity)) {
      errors.order_quantity = 'Quantity must be a number';
    }

    // Validate weight if provided
    if (formData.weight_amount && isNaN(formData.weight_amount)) {
      errors.weight_amount = 'Weight must be a number';
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        console.log('Original form data:', formData);
        
        // Create item data object with correct field names
        const itemData = {
          product_id: formData.product_id.trim(),
          product_name: formData.product_name.trim(),
          description: formData.description.trim(),
          vendor_id: parseInt(formData.vendor_id),
          order_quantity: formData.order_quantity ? parseInt(formData.order_quantity) : null,
          price_per_unit: parseFloat(formData.price_per_unit),
          weight_amount: formData.weight_amount ? parseFloat(formData.weight_amount) : null,
          type: formData.type.trim()
        };
        
        console.log('Sending item data to server:', itemData);

        // Check if item exists to determine if we should update or create
        const checkResponse = await fetch(`${API_URL}/api/items/${itemData.product_id}`);
        let itemExists = false;
        let existingItemData = null;
        
        try {
          existingItemData = await checkResponse.json();
          // Consider it an update only if we get valid data back
          itemExists = checkResponse.ok && existingItemData && Object.keys(existingItemData).length > 0;
        } catch (err) {
          itemExists = false;
        }

        let finalItemData = { ...itemData };

        // Only add quantities if we're in update mode (coming from Update button)
        if (itemExists && isUpdateMode) {
          // Get current item data
          const currentItem = existingItemData;
          console.log('Current item data:', currentItem);

          // Add new quantities to existing values
          finalItemData = {
            ...itemData,
            order_quantity: itemData.order_quantity 
              ? (currentItem.order_quantity || 0) + parseInt(itemData.order_quantity)
              : currentItem.order_quantity,
            weight_amount: itemData.weight_amount
              ? (currentItem.weight_amount || 0) + parseFloat(itemData.weight_amount)
              : currentItem.weight_amount
          };

          console.log('Updated quantities:', {
            oldQuantity: currentItem.order_quantity,
            newQuantity: finalItemData.order_quantity,
            oldWeight: currentItem.weight_amount,
            newWeight: finalItemData.weight_amount
          });
        }
        
        // Send request to add/update item
        const response = await fetch(
          itemExists 
            ? `${API_URL}/api/items/${itemData.product_id}`
            : `${API_URL}/api/items`,
          {
            method: itemExists ? 'PUT' : 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(finalItemData),
            mode: 'cors',
            credentials: 'omit'
          }
        );
        
        console.log('Server response status:', response.status);
        let responseData;
        try {
          responseData = await response.json();
          console.log('Server response data:', responseData);
        } catch (e) {
          console.error('Error parsing response:', e);
          responseData = { error: 'Invalid server response' };
        }

        // Check if request was successful
        if (!response.ok) {
          throw new Error(
            responseData.error || 
            responseData.details || 
            responseData.sqlMessage || 
            'Failed to add/update item'
          );
        }

        // Show success message
        setSuccess(itemExists ? 'Item updated successfully!' : 'Item added successfully!');
        setError('');

        // Reset form and update mode
        setFormData({
          product_id: '',
          product_name: '',
          description: '',
          type: '',
          vendor_id: '',
          order_quantity: '',
          price_per_unit: '',
          weight_amount: ''
        });
        setIsUpdateMode(false); // Reset update mode after successful submission

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } catch (err) {
        // Handle errors with more detail
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          response: err.response
        });
        
        let errorMessage = 'Failed to add/update item: ';
        if (err.message.includes('Duplicate entry')) {
          errorMessage = 'This item ID already exists. Please use a different ID or update the existing item.';
        } else if (err.message.includes('Database error')) {
          errorMessage += 'There was a problem with the database. Please try again.';
        } else {
          errorMessage += err.message || 'Please try again.';
        }
        
        setError(errorMessage);
      }
    } else {
      // Show validation errors
      const errorList = Object.entries(validationErrors)
        .map(([field, error]) => `${field}: ${error}`)
        .join(', ');
      setError(`Please correct the following errors: ${errorList}`);
      console.log('Validation errors:', validationErrors);
    }
  };

  // If not authenticated or not admin, show loading state
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <>
        <Navbar />
        <div className={styles['add-item-container']}>
          <div className={styles['add-item-form-container']}>
            <h2>Checking authorization...</h2>
          </div>
        </div>
      </>
    );
  }

  // Render the form
  return (
    <>
      <Navbar />
      <div className={styles['add-item-container']}>
        <div className={styles['add-item-form-container']}>
          <h2>{isUpdateMode ? 'Update Item' : 'Add New Item'} (Admin)</h2>
          {/* Display success/error messages */}
          {success && <div className={styles['success-message']}>{success}</div>}
          {error && <div className={styles['error-message']}>{error}</div>}
          
          {/* Main form */}
          <form onSubmit={handleSubmit} className={styles['add-item-form']}>
            {/* Item ID Input */}
            <div className={styles['form-group']}>
              <label htmlFor="product_id">Item ID*</label>
              <input
                type="text"
                id="product_id"
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                required
                className={styles['form-input']}
                placeholder="Enter item ID"
                disabled={isUpdateMode}
              />
            </div>

            {/* Item Name Input */}
            <div className={styles['form-group']}>
              <label htmlFor="product_name">Product Name*</label>
              <input
                type="text"
                id="product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Description Input */}
            <div className={styles['form-group']}>
              <label htmlFor="description">Description*</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Enter item description"
              />
            </div>

            {/* Item Type Input */}
            <div className={styles['form-group']}>
              <label htmlFor="type">Item Type*</label>
              <input
                type="text"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className={styles['form-input']}
                placeholder="(e.g., Snack, Instant, Grain)"
              />
            </div>
        

            {/* Vendor Select */}
            <div className={styles['form-group']}>
              <label htmlFor="vendor_id">Vendor*</label>
              <select
                id="vendor_id"
                name="vendor_id"
                value={formData.vendor_id}
                onChange={handleChange}
                required
                className={styles['form-select']}
                disabled={loadingVendors}
              >
                <option value="">-- Select Vendor --</option>
                {vendors.map(vendor => (
                  <option key={vendor.vendor_id} value={vendor.vendor_id}>
                    {vendor.vendor_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity and Price Inputs (in a row) */}
            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="order_quantity">Quantity <span className={styles['required-asterisk']}></span></label>
                <input
                  type="number"
                  id="order_quantity"
                  name="order_quantity"
                  value={formData.order_quantity}
                  onChange={handleChange}
                  min="0"
                  placeholder="Enter quantity"
                  className={styles['number-input']}
                />
              </div>

              <div className={styles['form-group']}>
                <label htmlFor="price_per_unit">Price ($) <span className={styles['required-asterisk']}>*</span></label>
                <input
                  type="number"
                  id="price_per_unit"
                  name="price_per_unit"
                  value={formData.price_per_unit}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={styles['number-input']}
                />
              </div>
            </div>

            {/* Weight Input */}
            <div className={styles['form-group']}>
              <label htmlFor="weight_amount">Weight (lbs) <span className={styles['required-asterisk']}></span></label>
              <input
                type="number"
                id="weight_amount"
                name="weight_amount"
                value={formData.weight_amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter weight in pounds"
                className={styles['number-input']}
              />
            </div>

            {/* Buttons Container */}
            <div className={styles['button-container']}>
              <button type="submit" className={styles['submit-button']}>
                {isUpdateMode ? 'Update Item' : 'Add Item'}
              </button>
              
              <button 
                type="button" 
                className={styles['cancel-button']}
                onClick={() => router.push('/admin/browse-items')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import styles from '@/styles/Limits.module.css';

export default function LimitsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [globalLimit, setGlobalLimit] = useState({ quantity: 2, weight: 10 });
  const [editingItem, setEditingItem] = useState(null);
  const [showGlobalLimitModal, setShowGlobalLimitModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/items');
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateItemLimit = async (itemId, newLimits) => {
    try {
      const response = await fetch(`http://localhost:8000/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_signout_quantity: newLimits.quantity,
          max_signout_weight: newLimits.weight,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item limits');
      }

      // Refresh items list
      await fetchItems();
      setEditingItem(null);
      setSuccessMessage('Item limits updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateGlobalLimits = async () => {
    try {
      // Validate input
      if (globalLimit.quantity === undefined && globalLimit.weight === undefined) {
        setError('Please set either quantity or weight limit');
        return;
      }

      // Convert values to numbers and validate
      const quantity = globalLimit.quantity ? Number(globalLimit.quantity) : undefined;
      const weight = globalLimit.weight ? Number(globalLimit.weight) : undefined;

      if ((quantity !== undefined && isNaN(quantity)) || (weight !== undefined && isNaN(weight))) {
        setError('Please enter valid numbers for limits');
        return;
      }

      console.log('Sending request to update global limits:', { quantity, weight });

      const response = await fetch('http://localhost:8000/api/items/update-global-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Role': 'admin'
        },
        credentials: 'include',
        body: JSON.stringify({
          quantity: quantity,
          weight: weight
        })
      });

      console.log('Response status:', response.status);
      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);

      if (!response.ok) {
        let errorMessage;
        try {
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || 'Failed to update global limits';
          } else {
            const text = await response.text();
            console.error('Server response:', text);
            errorMessage = 'Server returned an invalid response';
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          errorMessage = 'Failed to parse server response';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Success response:', data);

      // Refresh items list
      await fetchItems();
      setShowGlobalLimitModal(false);
      setError(null);
      setSuccessMessage('Global limits updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating global limits:', err);
      setError(err.message);
    }
  };

  const filteredItems = items.filter(item =>
    item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={styles.container}>
          <div className={styles.loading}>Loading...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={styles.container}>
          <div className={styles.error}>Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>Item Limits Management</h1>
        
        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button 
            className={styles.globalLimitButton}
            onClick={() => setShowGlobalLimitModal(true)}
          >
            Set Global Limits
          </button>
        </div>

        <div className={styles.itemsGrid}>
          {filteredItems.map((item) => (
            <div key={item.product_id} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <h3>{item.product_name}</h3>
                <span className={styles.availableAmount}>
                  {(!item.weight_amount || item.weight_amount === 0) ? (
                    `Available: ${item.order_quantity || 0} units`
                  ) : (
                    `Available: ${item.weight_amount || 0} lbs`
                  )}
                </span>
              </div>
              <p className={styles.itemType}>{item.type}</p>
              
              {editingItem === item.product_id ? (
                <div className={styles.editForm}>
                  {(!item.weight_amount || item.weight_amount === 0) && (
                    <div className={styles.inputGroup}>
                      <label>Quantity Limit:</label>
                      <input
                        type="number"
                        min="0"
                        value={item.max_signout_quantity ?? ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseInt(e.target.value);
                          if (!isNaN(value)) {
                            const newItems = items.map(i => 
                              i.product_id === item.product_id 
                                ? {...i, max_signout_quantity: value}
                                : i
                            );
                            setItems(newItems);
                          }
                        }}
                      />
                    </div>
                  )}
                  {(!item.order_quantity || item.order_quantity === 0) && (
                    <div className={styles.inputGroup}>
                      <label>Weight Limit:</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.max_signout_weight ?? ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            const newItems = items.map(i => 
                              i.product_id === item.product_id 
                                ? {...i, max_signout_weight: value}
                                : i
                            );
                            setItems(newItems);
                          }
                        }}
                      />
                    </div>
                  )}
                  <div className={styles.buttonGroup}>
                    <button
                      className={styles.saveButton}
                      onClick={() => updateItemLimit(item.product_id, {
                        quantity: item.max_signout_quantity,
                        weight: item.max_signout_weight
                      })}
                    >
                      Save
                    </button>
                    <button
                      className={styles.cancelButton}
                      onClick={() => setEditingItem(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.limitInfo}>
                  {item.weight_amount > 0 ? (
                    <p>
                      Weight Limit: {item.max_signout_weight || 'Not set'}
                    </p>
                  ) : (
                    <p>
                      Quantity Limit: {item.max_signout_quantity || 'Not set'}
                    </p>
                  )}
                  <button
                    className={styles.editButton}
                    onClick={() => setEditingItem(item.product_id)}
                  >
                    Edit Limits
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {showGlobalLimitModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Set Global Limits</h2>
              <div className={styles.inputGroup}>
                <label>Default Quantity Limit:</label>
                <input
                  type="number"
                  min="0"
                  value={globalLimit.quantity ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                    if (!isNaN(value) || e.target.value === '') {
                      setGlobalLimit({
                        ...globalLimit,
                        quantity: value
                      });
                    }
                  }}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Default Weight Limit:</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={globalLimit.weight ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                    if (!isNaN(value) || e.target.value === '') {
                      setGlobalLimit({
                        ...globalLimit,
                        weight: value
                      });
                    }
                  }}
                />
              </div>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.saveButton}
                  onClick={updateGlobalLimits}
                >
                  Apply to All Items
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowGlobalLimitModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 
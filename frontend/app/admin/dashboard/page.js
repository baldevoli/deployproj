'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import styles from '@/styles/AdminDashboard.module.css';

export default function AdminDashboard() {
  const [mostTakenItems, setMostTakenItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [studentCounts, setStudentCounts] = useState({
    undergraduate: 0,
    graduate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  
  // Initialize alert settings from localStorage or use defaults
  const [alertSettings, setAlertSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('alertSettings');
      return savedSettings ? JSON.parse(savedSettings) : { quantity: 5, weight: 10 };
    }
    return { quantity: 5, weight: 10 };
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch student counts
        const studentCountsResponse = await fetch('http://localhost:8000/api/transactions/unique-students');
        if (!studentCountsResponse.ok) {
          throw new Error(`Failed to fetch student counts: ${studentCountsResponse.status}`);
        }
        const studentCountsData = await studentCountsResponse.json();
        setStudentCounts({
          undergraduate: studentCountsData.undergraduate_count,
          graduate: studentCountsData.graduate_count
        });

        // Fetch most taken items
        const transactionsResponse = await fetch('http://localhost:8000/api/transactions/most-taken');
        if (!transactionsResponse.ok) {
          throw new Error(`Failed to fetch most taken items: ${transactionsResponse.status}`);
        }
        const transactionsData = await transactionsResponse.json();
        setMostTakenItems(Array.isArray(transactionsData) ? transactionsData : []);

        // Fetch low stock items
        const itemsResponse = await fetch(`http://localhost:8000/api/items/low-stock?quantity=${alertSettings.quantity}&weight=${alertSettings.weight}`);
        if (!itemsResponse.ok) {
          throw new Error(`Failed to fetch low stock items: ${itemsResponse.status}`);
        }
        const itemsData = await itemsResponse.json();
        setLowStockItems(Array.isArray(itemsData) ? itemsData : []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [alertSettings]);

  const handleAlertSettingsSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Send request to update alert settings
      const response = await fetch('http://localhost:8000/api/items/update-global-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertSettings)
      });

      if (!response.ok) {
        throw new Error('Failed to update alert thresholds');
      }

      // Save settings to localStorage
      localStorage.setItem('alertSettings', JSON.stringify(alertSettings));
      
      // Close the modal
      setShowAlertSettings(false);
    } catch (err) {
      setError('Failed to update alert thresholds');
    }
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={styles.dashboardContainer}>
          <div className={styles.loadingSpinner}>Loading...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <main className={styles.dashboardContainer}>
          <div className={styles.error}>Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <main className={styles.dashboardContainer}>
        <h1 className={styles.dashboardTitle}>Admin Dashboard</h1>
        
        <div className={styles.dashboardGrid}>
          {/* Most Taken Items Section */}
          <div className={styles.dashboardCard}>
            <h2 className={styles.cardTitle}>Most Taken Items</h2>
            <div className={styles.listContainer}>
              {mostTakenItems.length > 1 ? (
                <ul className={styles.itemsList}>
                  {[...mostTakenItems]
                    .sort((a, b) => b.total_transactions - a.total_transactions)
                    .map((item, index) => (
                    <li key={item.product_id} className={styles.itemRow}>
                      <div className={styles.itemInfo}>
                        <span className={styles.ranking}>#{index + 1}</span>
                        <div>
                          <h3>{item.product_name}</h3>
                          <p className={styles.itemType}>{item.type}</p>
                        </div>
                      </div>
                      <div className={styles.itemStats}>
                        <span className={styles.statBadge}>
                          <strong>{item.total_transactions}</strong> Times
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.noData}>No transaction data available</p>
              )}
            </div>
          </div>

          {/* Low Stock Items Section  dashboard*/}
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Low Stock Items</h2>
              <button 
                className={styles.alertSettingsButton}
                onClick={() => setShowAlertSettings(true)}
              >
                Set Alert Threshold
              </button>
            </div>
            
            {/* Alert Settings Modal */}
            {showAlertSettings && (
              <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                  <h3>Set Low Stock Alert Thresholds</h3>
                  <form onSubmit={handleAlertSettingsSubmit}>
                    <div className={styles.formGroup}>
                      <label>Quantity Alert Threshold:</label>
                      <input
                        type="number"
                        min="0"
                        value={alertSettings.quantity ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setAlertSettings(prev => ({
                            ...prev,
                            quantity: value === '' ? null : parseInt(value)
                          }));
                        }}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Weight Alert Threshold (lbs):</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={alertSettings.weight ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setAlertSettings(prev => ({
                            ...prev,
                            weight: value === '' ? null : parseFloat(value)
                          }));
                        }}
                      />
                    </div>
                    <div className={styles.modalButtons}>
                      <button type="submit" className={styles.saveButton}>Save</button>
                      <button 
                        type="button" 
                        className={styles.cancelButton}
                        onClick={() => setShowAlertSettings(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className={styles.listContainer}>
              {lowStockItems.length > 0 ? (
                <ul className={styles.itemsList}>
                  {lowStockItems.map((item) => (
                    <li key={item.product_id} className={styles.itemRow}>
                      <div className={styles.itemInfo}>
                        <h3>{item.product_name}</h3>
                        <p className={styles.itemType}>{item.type}</p>
                      </div>
                      <div className={styles.itemStats}>
                        <span className={`${styles.statBadge} ${styles.warning}`}>
                          {item.item_type === 'weight'
                            ? `${item.weight_amount} lbs left`
                            : `${item.order_quantity} units left`
                          }
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.noData}>No low stock items</p>
              )}
            </div>
          </div>

          {/* Student Counts Section */}
          <div className={styles.dashboardCard}>
            <h2 className={styles.cardTitle}>Student Statistics</h2>
            <div className={styles.listContainer}>
              <div className={styles.studentStats}>
                <div className={styles.statItem}>
                  <h3>Undergraduate Students</h3>
                  <span className={styles.statNumber}>
                    {studentCounts.undergraduate}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <h3>Graduate Students</h3>
                  <span className={styles.statNumber}>
                    {studentCounts.graduate}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <h3>Total Students</h3>
                  <span className={styles.statNumber}>
                    {studentCounts.undergraduate + studentCounts.graduate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
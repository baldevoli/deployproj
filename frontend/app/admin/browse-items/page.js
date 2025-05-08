'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useItems } from '@/app/context/ItemsContext';
import Navbar from '@/app/components/Navbar';
import styles from '@/styles/AdminBrowseItems.module.css';

export default function AdminBrowseItems() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { items, loading, error } = useItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  // Check authentication and admin role
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/signin');
    }
  }, [isAuthenticated, user, router]);

  // Get unique types from items
  const types = ['All', ...new Set(items.map(item => item.type))];

  // Filter items based on search and type
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>Browse Items</h1>

        <div className={styles.controls}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={styles.typeSelect}
          >
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading items...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Max Limit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.product_id}>
                    <td>{item.product_id}</td>
                    <td>{item.product_name}</td>
                    <td>{item.type}</td>
                    <td>{item.description}</td>
                    <td>
                      {item.weight_amount !== null && item.weight_amount > 0
                        ? `${item.weight_amount} lbs`
                        : `${item.order_quantity || 0} units`}
                    </td>
                    <td>${item.price_per_unit}</td>
                    <td>
                      {item.weight_amount !== null && item.weight_amount > 0
                        ? `${item.max_signout_weight} lbs`
                        : `${item.max_signout_quantity} units`}
                    </td>
                    <td>
                      <button 
                        className={styles.updateButton}
                        onClick={() => router.push(`/admin/add-item?id=${item.product_id}`)}
                      >
                        Update Item
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
} 
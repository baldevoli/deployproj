'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useItems } from '../context/ItemsContext';
import styles from '../../styles/AvailableItems.module.css';

export default function AvailableItems() {
  const { items, loading, error } = useItems();

  useEffect(() => {
    document.body.classList.add(styles.hideNavbar);
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    return () => {
      document.body.classList.remove(styles.hideNavbar);
    };
  }, []);

  return (
    <div className={`${styles.availableItemsContainer} no-navbar`}>
      <div className={styles.titleBanner}>
        <Link href="/" className={styles.titleLink}>Retriever&apos;s Essentials</Link>
      </div>

      <div className={styles.loginBanner}>
        <p>Login to checkout items</p>
        <Link href="/signin" className={styles.loginButton}>Sign In</Link>
      </div>

      <div className={styles.availableItemsContent}>
        <h2>Available Items</h2>
        {loading ? (
          <div className={styles.loadingMessage}>Loading...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : items.length === 0 ? (
          <div className={styles.errorMessage}>No items found. Please check your database connection.</div>
        ) : (
          <div className={styles.itemsGrid}>
            {items
              .filter(item => !(
                (item.order_quantity === null || item.order_quantity === 0) && 
                (item.weight_amount === null || item.weight_amount === 0)
              ))
              .map((item) => (
                <div key={item.product_id} className={styles.itemCard}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemCategory}>{item.type}</span>
                  </div>
                  <h3>{item.product_name}</h3>
                  <p className={styles.itemDescription}>{item.description}</p>
                  <div className={styles.itemFooter}>
                    <span className={styles.dietaryInfo}>
                      Price: ${item.price_per_unit}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

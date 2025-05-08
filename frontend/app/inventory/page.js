'use client';

import { useEffect, useRef, useState } from 'react';
import { useItems } from '../context/ItemsContext';
import { useTypes } from '../context/TypesContext';
import { useAuth } from '../context/AuthContext';
import styles from '../../styles/Inventory.module.css';
import Navbar from '../components/Navbar';
import { ShoppingCart } from 'lucide-react';

export default function Inventory() {
  const { items, loading, error } = useItems();
  const { types, loading: loadingTypes } = useTypes();
  const { user, isAuthenticated } = useAuth();
  const panelRef = useRef();

  // State management
  const [filteredType, setFilteredType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState({});
  const [cartItemsMap, setCartItemsMap] = useState({});
  const [cartVisible, setCartVisible] = useState(false);
  const [cartTriggered, setCartTriggered] = useState(false);
  const [cartErrors, setCartErrors] = useState({});
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState('');

  // Filter items that have stock and match search criteria
  const filteredItems = items.filter(({ type, product_name, description, order_quantity, weight_amount }) => {
    const hasNoStock = (order_quantity === null || order_quantity === 0) && 
                      (weight_amount === null || weight_amount === 0);
    if (hasNoStock) return false;

    const matchesType = filteredType === 'All' || type === filteredType;
    const matchesSearch = searchQuery === '' || 
      product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Get cart items
  const cartItems = items.filter((item) => cartItemsMap[item.product_id]);

  // Handlers
  const handleQuantityChange = (id, newQty) => {
    if (newQty >= 0) {
      setQuantities(prev => ({ ...prev, [id]: newQty }));
    }
  };

  const handleAddToCart = (id) => {
    const qty = quantities[id];
    if (!qty || qty <= 0) return;

    const item = items.find(item => item.product_id === id);
    const hasWeight = item.weight_amount !== null && item.weight_amount > 0;
    const maxValue = hasWeight ? item.max_signout_weight : item.max_signout_quantity;
    const currentQty = cartItemsMap[id] || 0;
  
    if (currentQty + qty > maxValue) {
      const errorMessage = hasWeight 
        ? `Max weight allowed is ${maxValue}`
        : `Max quantity allowed is ${maxValue}`;
      
      setCartErrors(prev => ({ ...prev, [id]: errorMessage }));
      setTimeout(() => {
        setCartErrors(prev => {
          const { [id]: _, ...rest } = prev;
          return rest;
        });
      }, 3000);
      return;
    }
  
    setCartItemsMap(prev => ({
      ...prev,
      [id]: currentQty + qty,
    }));
    setCartTriggered(true);
    setQuantities(prev => ({ ...prev, [id]: '' }));
    setCartErrors(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const toggleCart = () => {
    setCartVisible(prev => !prev);
    setCheckoutSuccess('');
  };

  const clearCart = () => {
    setCartItemsMap({});
    setCartVisible(false);
    setCartTriggered(false);
    setCheckoutSuccess('');
  };

  const removeFromCart = (productId) => {
    setCartItemsMap(prev => {
      const { [productId]: _, ...newCart } = prev;
      if (Object.keys(newCart).length === 0) {
        setCartVisible(false);
        setCartTriggered(false);
      }
      return newCart;
    });
  };

  const handleCheckout = async () => {
    try {
      setCheckoutError('');
      setCheckoutSuccess('');

      if (!isAuthenticated || !user) {
        setCheckoutError('Please log in to checkout items');
        return;
      }

      const roleMapping = {
        'admin': 'admin',
        'graduate': 'graduate',
        'undergraduate': 'undergraduate',
        'student': 'undergraduate'
      };
      const mappedRole = roleMapping[user.role] || 'undergraduate';

      for (const [productId, quantity] of Object.entries(cartItemsMap)) {
        const item = items.find(i => i.product_id === productId);
        if (!item) continue;

        const hasWeight = item.weight_amount !== null && item.weight_amount > 0;
        const maxValue = hasWeight ? item.max_signout_weight : item.max_signout_quantity;

        if (quantity > maxValue) {
          throw new Error(
            hasWeight 
              ? `The requested weight (${quantity} lbs) exceeds the maximum allowed weight (${maxValue} lbs) for ${item.product_name}`
              : `The requested quantity (${quantity}) exceeds the maximum allowed quantity (${maxValue}) for ${item.product_name}`
          );
        }

        // Update item stock in backend
        const response = await fetch(`http://localhost:8000/api/items/${productId}/update-quantity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            product_id: productId,
            [hasWeight ? 'weight' : 'quantity']: quantity 
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update item quantity');
        }

        // Record the transaction
        const transactionResponse = await fetch('http://localhost:8000/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.user_id,
            product_id: productId,
            quantity_taken: quantity,
            user_role: mappedRole
          })
        });

        if (!transactionResponse.ok) {
          const errorData = await transactionResponse.json();
          throw new Error(errorData.error || errorData.details || 'Failed to record transaction');
        }
      }

      clearCart();
      setCheckoutSuccess('Items checked out successfully!');
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error.message);
    }
  };

  // Effects
  useEffect(() => {
    if (cartVisible) {
      const handleClickOutside = (e) => {
        if (panelRef.current && !panelRef.current.contains(e.target)) {
          setCartVisible(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [cartVisible]);

  useEffect(() => {
    if (checkoutSuccess) {
      const timer = setTimeout(() => setCheckoutSuccess(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [checkoutSuccess]);

  return (
    <>
      <Navbar />
      <main className={styles.inventoryContainer}>
        {checkoutSuccess && (
          <div className={`${styles.checkoutSuccess} ${styles.globalMessage}`}>
            {checkoutSuccess}
          </div>
        )}
        
        {/* Cart Icon & Popup */}
        {cartTriggered && cartItems.length > 0 && (
          <div className={styles.cartIconWrapper}>
            <div className={styles.cartIconCircle} onClick={toggleCart}>
              <ShoppingCart size={20} />
              <span className={styles.cartBadge}>{cartItems.length}</span>
            </div>

            {cartVisible && (
              <div className={styles.cartPanelPopup} ref={panelRef}>
                <h4 className={styles.cartTitle}>Cart Summary</h4>
                {checkoutError && (
                  <div className={styles.checkoutError}>
                    {checkoutError}
                  </div>
                )}
                <div className={styles.cartButtons}>
                  <button className={styles.clearButton} onClick={clearCart}>
                    Clear
                  </button>
                  <button className={styles.checkoutButton} onClick={handleCheckout}>
                    Checkout
                  </button>
                </div>
                <div className={styles.cartItemsContainer}>
                  <ol className={styles.cartList}>
                    {cartItems.map((item) => {
                      const hasWeight = item.weight_amount !== null && item.weight_amount > 0;
                      return (
                        <li key={item.product_id} className={styles.cartItem}>
                          <button 
                            className={styles.removeItemButton}
                            onClick={() => removeFromCart(item.product_id)}
                            title="Remove item"
                          >
                            -
                          </button>
                          <div className={styles.cartItemDetails}>
                            <strong>{item.product_name}</strong>
                            <span className={styles.cartItemQuantity}>
                              {hasWeight ? 'Weight: ' : 'Quantity: '}{cartItemsMap[item.product_id]}
                              {hasWeight ? ' lbs' : ''}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Inventory Section */}
        <div className={styles.itemsSection}>
          <h2>Current Inventory</h2>

          {/* Filters */}
          <div className={styles.controls}>
            <input
              type="text"
              placeholder="Search items..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className={styles.filterSelect}
              value={filteredType}
              onChange={(e) => setFilteredType(e.target.value)}
              disabled={loadingTypes}
            >
              <option value="All">All Types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Items Grid */}
          {loading ? (
            <p className={styles.loadingMessage}>Loading...</p>
          ) : error ? (
            <p className={styles.errorMessage}>{error}</p>
          ) : (
            <div className={styles.itemsGrid}>
              {filteredItems.length === 0 ? (
                <p className={styles.noItemsMessage}>No items found matching your criteria.</p>
              ) : (
                filteredItems.map((item) => {
                  const hasWeight = item.weight_amount !== null && item.weight_amount > 0;
                  const step = hasWeight ? 0.1 : 1;
                  const placeholder = hasWeight ? "Enter weight" : "Enter quantity";
                  const maxValue = hasWeight ? item.max_signout_weight : item.max_signout_quantity;
                  
                  return (
                    <div key={item.product_id} className={styles.itemCard}>
                      <div className={styles.itemHeader}>
                        <span className={styles.itemCategory}>{item.type}</span>
                        <span className={styles.maxBadge}>
                          {hasWeight ? (
                            `Max Weight: ${item.max_signout_weight}`
                          ) : (
                            `Max Quantity: ${item.max_signout_quantity}`
                          )}
                        </span>
                      </div>
                      <h3>{item.product_name}</h3>
                      <p className={styles.itemDescription}>{item.description}</p>
                      <div className={styles.itemFooter}>
                        <div className={styles.itemMeta}>
                          <span className={styles.dietaryInfo}>
                            Price: ${item.price_per_unit}
                          </span>
                          <div className={styles.quantityControl}>
                            <input
                              type="number"
                              min="0"
                              max={maxValue}
                              step={step}
                              placeholder={placeholder}
                              value={quantities[item.product_id] || ''}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.product_id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                            <button
                              className={styles.cartButton}
                              onClick={() => handleAddToCart(item.product_id)}
                              title="Add to Cart"
                            >
                              <ShoppingCart size={20} />
                            </button>
                          </div>
                          {cartErrors[item.product_id] && (
                            <div className={styles.errorMessage}>
                              {cartErrors[item.product_id]}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

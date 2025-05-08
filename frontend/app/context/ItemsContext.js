'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ItemsContext = createContext();

export const ItemsProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use environment variable for API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL_DEV || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  useEffect(() => {
    const fetchItems = async () => {
      try {
        console.log('Fetching items from:', `${API_URL}/api/items`);
        
        // Add a timeout to prevent the fetch from hanging forever
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const res = await fetch(`${API_URL}/api/items`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          console.error('Failed to fetch items, status:', res.status);
          throw new Error(`Failed to fetch items: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Items fetched successfully:', data.length);
        setItems(data);
      } catch (err) {
        console.error('Error fetching items:', err);
        if (err.name === 'AbortError') {
          setError('Request timed out. Please check if the backend server is running.');
        } else {
          setError(err.message || 'Failed to load items');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <ItemsContext.Provider value={{ items, loading, error }}>
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => useContext(ItemsContext);

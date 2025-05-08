'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ItemsContext = createContext();

export const ItemsProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use environment variable for API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL_DEV;
  
  const fetchItems = async () => {
    try {
      if (!API_URL) {
        console.error('API URL is not defined');
        setError('API URL is not configured');
        setLoading(false);
        return;
      }

      console.log('Fetching items from:', `${API_URL}/api/items`);
      
      // Set up request timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // Fetch items from the backend API
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
      
      // Handle unsuccessful responses
      if (!res.ok) {
        console.error('Failed to fetch items, status:', res.status);
        throw new Error(`Failed to fetch items: ${res.status}`);
      }
      
      // Parse the JSON response
      const data = await res.json();
      console.log('Items fetched successfully:', data.length);
      
      // Update state with the fetched items
      setItems(data);
    } catch (err) {
      console.error('Error fetching items:', err);
      // Special handling for timeout errors
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check if the backend server is running.');
      } else {
        setError(err.message || 'Failed to load items');
      }
    } finally {
      // Set loading to false regardless of success or failure
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <ItemsContext.Provider value={{ items, loading, error, refetch: fetchItems }}>
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
};

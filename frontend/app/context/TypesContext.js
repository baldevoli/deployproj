'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const TypesContext = createContext();

export const TypesProvider = ({ children }) => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use environment variable for API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        console.log('Fetching types from:', `${API_URL}/api/types`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const res = await fetch(`${API_URL}/api/types`, {
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
          console.error('Failed to fetch types, status:', res.status);
          throw new Error(`Failed to fetch types: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Types fetched successfully:', data);
        
        // Add 'All' as the first option
        setTypes(['All', ...data]);
      } catch (err) {
        console.error('Error fetching types:', err);
        if (err.name === 'AbortError') {
          setError('Request timed out. Please check if the backend server is running.');
        } else {
          setError(err.message || 'Failed to load types');
        }
        // Set default types if fetch fails
        setTypes(['All', 'Grain', 'Lentil', 'Legume', 'Snack', 'Instant', 'Meal', 'Other', 'Hygiene']);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  return (
    <TypesContext.Provider value={{ types, loading, error }}>
      {children}
    </TypesContext.Provider>
  );
};

export const useTypes = () => useContext(TypesContext); 
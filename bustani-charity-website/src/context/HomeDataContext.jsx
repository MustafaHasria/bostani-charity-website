import { createContext, useContext, useState, useEffect } from 'react';
import { fetchHomeData } from '../services/api';

const HomeDataContext = createContext();

export const useHomeData = () => {
  const context = useContext(HomeDataContext);
  if (!context) {
    throw new Error('useHomeData must be used within a HomeDataProvider');
  }
  return context;
};

export const HomeDataProvider = ({ children }) => {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchHomeData();
        if (isMounted) {
          setHomeData(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load home data:', err);
          // معالجة خطأ 429
          if (err.status === 429 || (err.message && err.message.includes('429'))) {
            setError('Too many requests. Please refresh the page after a few moments.');
          } else {
            setError(err.message);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchHomeData();
      setHomeData(data);
    } catch (err) {
      console.error('Failed to refresh home data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeDataContext.Provider value={{ homeData, loading, error, refreshData }}>
      {children}
    </HomeDataContext.Provider>
  );
};


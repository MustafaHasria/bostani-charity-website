import { createContext, useContext, useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        // إذا لم يكن هناك token، امسح بيانات المستخدم المحفوظة
        localStorage.removeItem('user_data');
        setIsLoading(false);
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // محاولة تحميل بيانات المستخدم من localStorage أولاً (للسرعة)
      const savedUserData = localStorage.getItem('user_data');
      if (savedUserData) {
        try {
          const parsedUser = JSON.parse(savedUserData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (e) {
          console.error('Error parsing saved user data:', e);
        }
      }

      // التحقق من API للحصول على أحدث بيانات المستخدم
      const response = await adminAPI.getCurrentUser();
      
      // إذا كان status 401 أو 403، يعني أن التوكن غير صالح
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      if (response.ok && response.data) {
        // معالجة مختلفة لأشكال البيانات من API
        const userData = response.data.data || response.data.user || response.data;
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          // تحديث بيانات المستخدم المحفوظة
          localStorage.setItem('user_data', JSON.stringify(userData));
        } else {
          // إذا لم تكن هناك بيانات مستخدم، احذف التوكن
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        // إذا فشل الطلب لكن ليس 401/403، احتفظ بالبيانات المحفوظة
        const savedUserData = localStorage.getItem('user_data');
        if (savedUserData) {
          try {
            const parsedUser = JSON.parse(savedUserData);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (e) {
            console.error('Error parsing saved user data:', e);
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // عند حدوث خطأ، احذف التوكن فقط إذا كان الخطأ متعلق بالمصادقة (401, 403)
      const errorStatus = error.status || error.response?.status;
      if (errorStatus === 401 || errorStatus === 403) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setIsAuthenticated(false);
        setUser(null);
      } else {
        // إذا كان الخطأ في الشبكة وليس في المصادقة، احتفظ بالحالة الحالية
        // إذا كانت هناك بيانات محفوظة، استخدمها
        const savedUserData = localStorage.getItem('user_data');
        if (savedUserData && token) {
          try {
            const parsedUser = JSON.parse(savedUserData);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (e) {
            console.error('Error parsing saved user data:', e);
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await adminAPI.login(email, password);
      if (response.ok && response.data) {
        const { access_token, refresh_token, user: userData, data } = response.data;
        const token = access_token || data?.access_token;
        const refresh = refresh_token || data?.refresh_token;
        const user = userData || data?.user || data;
        
        if (token) {
          localStorage.setItem('auth_token', token);
        }
        if (refresh) {
          localStorage.setItem('refresh_token', refresh);
        }
        if (user) {
          setUser(user);
          // حفظ بيانات المستخدم في localStorage كنسخة احتياطية
          localStorage.setItem('user_data', JSON.stringify(user));
        }
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: response.data?.message || 'Login failed' };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await adminAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};


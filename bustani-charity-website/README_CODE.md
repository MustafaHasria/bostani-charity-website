# جميع أكواد لوحة التحكم - Charity Dashboard

هذا الملف يحتوي على جميع أكواد لوحة التحكم (HTML, CSS, JavaScript/JSX) بشكل منظم.

---

## جدول المحتويات

1. [ملفات التكوين](#ملفات-التكوين)
2. [نقطة الدخول](#نقطة-الدخول)
3. [المكون الرئيسي](#المكون-الرئيسي)
4. [الصفحات](#الصفحات)
5. [المكونات](#المكونات)
6. [Contexts](#contexts)
7. [Hooks](#hooks)
8. [Utilities](#utilities)
9. [الترجمات](#الترجمات)
10. [الأنماط](#الأنماط)

---

## ملفات التكوين

### package.json

```json
{
  "name": "charity-admin-dashboard",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.294.0",
    "quill": "^2.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-quill": "^2.0.0",
    "react-router-dom": "^6.20.0",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

### vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
```

### index.html

```html
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100..900&family=Saira:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <title>لوحة تحكم الجمعية الخيرية</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## نقطة الدخول

### src/main.jsx

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/animations.css'
import './styles/page-transitions.css'
import './styles/scroll-animations.css'
import './styles/enhanced-interactions.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## المكون الرئيسي

### src/App.jsx

```javascript
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { ToastProvider } from './contexts/ToastContext'
import { DashboardDataProvider } from './contexts/DashboardDataContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import LoadingSpinner from './components/Loading/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import PermissionRoute from './components/ProtectedRoute/PermissionRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
import CampaignManagement from './pages/CampaignManagement'
import CategoriesManagement from './pages/CategoriesManagement'
import SponsorshipsManagement from './pages/SponsorshipsManagement'
import ReportsStatistics from './pages/ReportsStatistics'
import PostsManagement from './pages/PostsManagement'
import RecurringPaymentsManagement from './pages/RecurringPaymentsManagement'
import GeneralSettings from './pages/GeneralSettings'
import PermissionsManagement from './pages/PermissionsManagement'
import TallContentDemo from './pages/TallContentDemo'
import AccountSuspended from './pages/AccountSuspended'

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme || 'light'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    // Simulate app loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const toggleTheme = (e, x, y) => {
    // إضافة class للـ animation
    document.body.classList.add('theme-changing')
    document.documentElement.classList.add('theme-transitioning')

    // إنشاء ripple effect من موقع الزر
    if (x !== undefined && y !== undefined) {
      const ripple = document.createElement('div')
      ripple.className = 'theme-ripple'
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      document.body.appendChild(ripple)

      setTimeout(() => {
        ripple.remove()
      }, 1000)
    }

    // تغيير الوضع
    setTheme(prev => prev === 'light' ? 'dark' : 'light')

    // إزالة class بعد انتهاء animation
    setTimeout(() => {
      document.body.classList.remove('theme-changing')
      document.documentElement.classList.remove('theme-transitioning')
    }, 1000)
  }

  return (
    <LanguageProvider>
      <ToastProvider>
        <Router>
          <AuthProvider>
            <DashboardDataProvider>
              {isLoading && <LoadingSpinner theme={theme} />}
              <Routes>
                <Route
                  path="/login"
                  element={
                    <LoginRoute theme={theme} toggleTheme={toggleTheme} />
                  }
                />
                <Route
                  path="/account-suspended"
                  element={
                    <AccountSuspendedRoute theme={theme} toggleTheme={toggleTheme} />
                  }
                />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout theme={theme} toggleTheme={toggleTheme}>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/users" element={<PermissionRoute requiredPermission="users.view"><UserManagement /></PermissionRoute>} />
                          <Route path="/campaigns" element={<PermissionRoute requiredPermission="campaigns.view"><CampaignManagement /></PermissionRoute>} />
                          <Route path="/categories" element={<PermissionRoute requiredPermission="categories.view"><CategoriesManagement /></PermissionRoute>} />
                          <Route path="/sponsorships" element={<PermissionRoute requiredPermission="sponsorships.view"><SponsorshipsManagement /></PermissionRoute>} />
                          <Route path="/reports" element={<PermissionRoute requiredPermission="reports.view"><ReportsStatistics /></PermissionRoute>} />
                          <Route path="/posts" element={<PermissionRoute requiredPermission="posts.view"><PostsManagement /></PermissionRoute>} />
                          <Route path="/recurring-payments" element={<PermissionRoute requiredPermission="payments.view"><RecurringPaymentsManagement /></PermissionRoute>} />
                          <Route path="/permissions" element={<PermissionRoute requiredPermission="permissions.view"><PermissionsManagement /></PermissionRoute>} />
                          <Route path="/settings" element={<PermissionRoute requiredPermission="settings.view"><GeneralSettings /></PermissionRoute>} />
                          <Route path="/tall" element={<TallContentDemo />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </DashboardDataProvider>
          </AuthProvider>
        </Router>
      </ToastProvider>
    </LanguageProvider>
  )
}

// Component to handle login route - redirect if already authenticated
const LoginRoute = ({ theme, toggleTheme }) => {
  try {
    const { isAuthenticated, isLoading, user } = useAuth()

    if (isLoading) {
      return <LoadingSpinner theme={theme} />
    }

    if (isAuthenticated) {
      // Check if user is disabled
      const isDisabled = user?.status === 'disabled' || user?.status === 'inactive'
      if (isDisabled) {
        return <Navigate to="/account-suspended" replace />
      }
      return <Navigate to="/" replace />
    }

    return <Login theme={theme} toggleTheme={toggleTheme} />
  } catch (error) {
    console.error('LoginRoute error:', error)
    return <Login theme={theme} toggleTheme={toggleTheme} />
  }
}

// Component to handle account suspended route - allow access even without authentication if account is disabled
const AccountSuspendedRoute = ({ theme, toggleTheme }) => {
  try {
    const { isAuthenticated, isLoading, user } = useAuth()

    if (isLoading) {
      return <LoadingSpinner theme={theme} />
    }

    // Check if user is disabled (even if not authenticated - for login attempts)
    const isDisabled = user?.status === 'disabled' || user?.status === 'inactive'
    
    // If user is authenticated and NOT disabled, redirect to dashboard
    if (isAuthenticated && !isDisabled) {
      return <Navigate to="/" replace />
    }

    // If user is authenticated and disabled, show suspended page
    if (isAuthenticated && isDisabled) {
      return <AccountSuspended theme={theme} toggleTheme={toggleTheme} />
    }

    // If not authenticated but user object exists with disabled status (from failed login), show suspended page
    if (!isAuthenticated && isDisabled) {
      return <AccountSuspended theme={theme} toggleTheme={toggleTheme} />
    }

    // If not authenticated and no disabled status, redirect to login
    return <Navigate to="/login" replace />
  } catch (error) {
    console.error('AccountSuspendedRoute error:', error)
    return <Navigate to="/login" replace />
  }
}

export default App
```

---

## الصفحات

> **ملاحظة:** بسبب حجم الملفات الكبير، سيتم إضافة الملفات الرئيسية فقط. يمكنك العثور على جميع الملفات في مجلد `src/pages/`

### قائمة الصفحات:

1. **Dashboard.jsx** - الصفحة الرئيسية
2. **Login.jsx** - صفحة تسجيل الدخول
3. **UserManagement.jsx** - إدارة المستخدمين
4. **CampaignManagement.jsx** - إدارة الحملات
5. **CategoriesManagement.jsx** - إدارة التصنيفات
6. **PostsManagement.jsx** - إدارة المنشورات
7. **RecurringPaymentsManagement.jsx** - إدارة الدفعات المستحقة
8. **ReportsStatistics.jsx** - التقارير والإحصائيات
9. **GeneralSettings.jsx** - الإعدادات العامة
10. **PermissionsManagement.jsx** - إدارة الصلاحيات
11. **AccountSuspended.jsx** - صفحة الحساب المعطل

---

## المكونات

> **ملاحظة:** جميع المكونات موجودة في مجلد `src/components/`

### 1. Layout Components

#### src/components/Layout/Layout.jsx

```javascript
import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import ScrollToTop from '../ScrollToTop/ScrollToTop'
import './Layout.css'

const Layout = ({ children, theme, toggleTheme }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // في الشاشات الكبيرة، الـ sidebar مفتوح افتراضياً
    if (window.innerWidth > 1024) {
      return true
    }
    return false
  })

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} theme={theme} />
      <div className={`layout-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main className="main-content">
          {children}
        </main>
      </div>
      <ScrollToTop />
    </div>
  )
}

export default Layout
```

#### src/components/Layout/Header.jsx

> **ملاحظة:** ملف Header.jsx كبير جداً (أكثر من 400 سطر). يحتوي على:
- شريط البحث
- الإشعارات
- زر تبديل الوضع (Dark/Light)
- قائمة المستخدم
- زر تحميل التقرير

#### src/components/Layout/Sidebar.jsx

> **ملاحظة:** ملف Sidebar.jsx يحتوي على:
- قائمة التنقل الرئيسية
- فلترة العناصر بناءً على الصلاحيات
- قائمة الإعدادات
- زر تسجيل الخروج

### 2. Modal Components

#### src/components/Modal/Modal.jsx

```javascript
import { useEffect } from 'react'
import { X } from 'lucide-react'
import './Modal.css'

const Modal = ({ isOpen, onClose, title, children, size = 'medium', style }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose} style={style}>
      <div 
        className={`modal-content modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
```

### 3. Loading Components

#### src/components/Loading/LoadingSpinner.jsx

```javascript
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import './LoadingSpinner.css'

const LoadingSpinner = ({ 
  theme = 'light', 
  type = 'overlay', // 'overlay', 'inline', 'button', 'page'
  size = 'medium', // 'small', 'medium', 'large'
  message,
  fullScreen = false
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (type === 'overlay' && fullScreen) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [type, fullScreen])

  if (type === 'overlay' && fullScreen && !isVisible) return null

  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  }

  const spinnerSize = {
    small: 20,
    medium: 40,
    large: 60
  }

  if (type === 'overlay') {
    return (
      <div className={`loading-overlay ${theme === 'dark' ? 'dark' : 'light'} ${fullScreen ? 'fullscreen' : ''}`}>
        <div className="loading-content">
          <div className={`loading-spinner ${sizeClasses[size]}`}>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          {message && <p className="loading-message">{message}</p>}
        </div>
      </div>
    )
  }

  if (type === 'inline') {
    return (
      <div className="loading-inline">
        <Loader2 
          size={spinnerSize[size]} 
          className="spinner-icon"
        />
        {message && <span className="loading-message-inline">{message}</span>}
      </div>
    )
  }

  if (type === 'button') {
    return (
      <Loader2 
        size={16} 
        className="spinner-icon button-spinner"
      />
    )
  }

  if (type === 'page') {
    return (
      <div className="loading-page">
        <div className={`loading-spinner ${sizeClasses[size]}`}>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    )
  }

  return null
}

export default LoadingSpinner
```

### 4. قائمة المكونات الأخرى:

- **Toast/** - ToastContainer
- **EmptyState/** - EmptyState
- **ErrorState/** - ErrorState
- **Skeleton/** - Skeleton, SkeletonCard, SkeletonGrid
- **Charts/** - DonationsChart
- **Filters/** - AdvancedFilters, FilterResultsCount
- **Tooltip/** - Tooltip
- **ScrollToTop/** - ScrollToTop
- **ScrollProgress/** - ScrollProgress
- **ProgressIndicator/** - ProgressIndicator
- **RichTextEditor/** - RichTextEditor
- **ProtectedRoute/** - ProtectedRoute, PermissionRoute

---

## Contexts

### src/contexts/LanguageContext.jsx

```javascript
import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language')
    return saved || 'ar'
  })

  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
    localStorage.setItem('language', language)
  }, [language])

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar')
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
```

### src/contexts/ToastContext.jsx

```javascript
import { createContext, useContext, useState } from 'react'

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now()
    const toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)

    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
```

### src/contexts/AuthContext.jsx

```javascript
import { createContext, useContext, useState, useEffect } from 'react'
import { adminAPI } from '../utils/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await adminAPI.getCurrentUser()
      if (response.ok && response.data) {
        setUser(response.data.data || response.data)
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await adminAPI.login(email, password)
      if (response.ok && response.data) {
        const { access_token, refresh_token, user: userData } = response.data
        localStorage.setItem('auth_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        setUser(userData)
        setIsAuthenticated(true)
        return { success: true }
      }
      return { success: false, error: response.data?.message || 'Login failed' }
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const logout = async () => {
    try {
      await adminAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### src/contexts/DashboardDataContext.jsx

```javascript
import { createContext, useContext, useState } from 'react'

const DashboardDataContext = createContext()

export const DashboardDataProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null)

  return (
    <DashboardDataContext.Provider value={{ dashboardData, setDashboardData }}>
      {children}
    </DashboardDataContext.Provider>
  )
}

export const useDashboardData = () => {
  const context = useContext(DashboardDataContext)
  if (!context) {
    throw new Error('useDashboardData must be used within DashboardDataProvider')
  }
  return context
}
```

---

## Hooks

### src/hooks/useTranslation.js

```javascript
import { useLanguage } from '../contexts/LanguageContext'
import ar from '../locales/ar.json'
import en from '../locales/en.json'

const translations = { ar, en }

export const useTranslation = () => {
  const { language } = useLanguage()

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) return key
    }
    
    return value || key
  }

  return { t, language }
}
```

### src/hooks/usePermissions.js

```javascript
import { useAuth } from '../contexts/AuthContext'

export const usePermissions = () => {
  const { user } = useAuth()

  const can = (permission) => {
    if (!user) return false
    
    // Super admin has all permissions
    if (user.role?.name === 'super_admin') return true
    
    // Check user permissions
    const userPermissions = user.permissions || []
    return userPermissions.some(p => p.name === permission || p.name === '*')
  }

  return { can }
}
```

### src/hooks/useLoading.js

```javascript
import { useState, useCallback } from 'react'

export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState)

  const startLoading = useCallback(() => setIsLoading(true), [])
  const stopLoading = useCallback(() => setIsLoading(false), [])
  const toggleLoading = useCallback(() => setIsLoading(prev => !prev), [])

  return { isLoading, startLoading, stopLoading, toggleLoading }
}
```

### src/hooks/useScrollAnimation.js

```javascript
import { useEffect, useRef } from 'react'

export const useScrollAnimation = () => {
  const elementRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.1 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [])

  return elementRef
}
```

---

## Utilities

### src/utils/api.js

> **ملاحظة:** ملف API كبير جداً (أكثر من 1300 سطر). يحتوي على جميع دوال API للوحة التحكم.

الملف يحتوي على:
- إعدادات API الأساسية
- دوال المصادقة (login, logout, refresh)
- دوال المستخدمين (CRUD)
- دوال الحملات (CRUD)
- دوال التصنيفات (CRUD)
- دوال المنشورات (CRUD)
- دوال التبرعات
- دوال التقارير
- وغيرها...

### src/utils/downloadReport.js

```javascript
import { adminAPI } from './api'

export const downloadDashboardReport = async (dashboardData, language = 'ar') => {
  try {
    if (!dashboardData) {
      throw new Error('No dashboard data available')
    }

    // Create CSV content
    let csvContent = ''

    // Add BOM for Arabic support
    csvContent = '\uFEFF'

    // Add headers
    const headers = language === 'ar' 
      ? ['التقرير', 'القيمة']
      : ['Report', 'Value']
    
    csvContent += headers.join(',') + '\n'

    // Add statistics
    if (dashboardData.stats) {
      const statsLabels = language === 'ar'
        ? {
            totalDonations: 'إجمالي التبرعات',
            totalCampaigns: 'عدد الحملات',
            totalDonors: 'عدد المتبرعين'
          }
        : {
            totalDonations: 'Total Donations',
            totalCampaigns: 'Number of Campaigns',
            totalDonors: 'Number of Donors'
          }

      csvContent += `${statsLabels.totalDonations},${dashboardData.stats.totalDonations || 0}\n`
      csvContent += `${statsLabels.totalCampaigns},${dashboardData.stats.totalCampaigns || 0}\n`
      csvContent += `${statsLabels.totalDonors},${dashboardData.stats.totalDonors || 0}\n`
    }

    // Add categories data
    if (dashboardData.categoriesData && Array.isArray(dashboardData.categoriesData)) {
      csvContent += '\n'
      const categoryHeader = language === 'ar' ? 'التصنيفات الأكثر نشاطاً' : 'Most Active Categories'
      csvContent += `${categoryHeader},\n`
      
      const categoryHeaders = language === 'ar'
        ? ['التصنيف', 'النسبة', 'المبلغ']
        : ['Category', 'Percentage', 'Amount']
      csvContent += categoryHeaders.join(',') + '\n'

      dashboardData.categoriesData.forEach(category => {
        const name = category.name || category.category_name || ''
        const percentage = category.percentage || 0
        const amount = category.amount || category.total_contributions || 0
        csvContent += `${name},${percentage}%,${amount}\n`
      })
    }

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return { success: true }
  } catch (error) {
    console.error('Error downloading report:', error)
    throw error
  }
}
```

---

## الترجمات

### src/locales/ar.json

> **ملاحظة:** ملف الترجمة العربية موجود في المشروع ويحتوي على جميع النصوص بالعربية.

### src/locales/en.json

> **ملاحظة:** ملف الترجمة الإنجليزية موجود في المشروع ويحتوي على جميع النصوص بالإنجليزية.

---

## الأنماط

### src/index.css

> **ملاحظة:** ملف CSS الرئيسي كبير جداً (أكثر من 500 سطر). يحتوي على:
- CSS Variables
- Reset Styles
- Typography
- Theme Support (Light/Dark)
- Responsive Design
- Animations

### src/pages/PageStyles.css

> **ملاحظة:** ملف CSS للصفحات كبير جداً (أكثر من 4000 سطر). يحتوي على أنماط جميع الصفحات.

### src/styles/animations.css

```css
/* Animations for various components */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-in {
  animation: fadeIn 0.5s ease-in-out;
}
```

---

## ملاحظات مهمة

1. **حجم المشروع:** المشروع كبير جداً ويحتوي على أكثر من 75 ملف
2. **الملفات الكبيرة:** بعض الملفات كبيرة جداً (مثل `api.js` أكثر من 1300 سطر، `PageStyles.css` أكثر من 4000 سطر)
3. **التنظيم:** جميع الملفات منظمة بشكل جيد في مجلدات منفصلة
4. **الترجمة:** المشروع يدعم العربية والإنجليزية بشكل كامل
5. **الاستجابة:** جميع الصفحات responsive وتعمل على جميع الأجهزة

---

## كيفية استخدام هذا الملف

1. **للمطورين الجدد:** ابدأ بقراءة ملفات التكوين ونقطة الدخول
2. **للتعديل:** استخدم هذا الملف كمرجع سريع للعثور على الملفات المطلوبة
3. **للفهم:** اقرأ الملفات بالترتيب: main.jsx → App.jsx → Pages → Components

---

## معلومات إضافية

- **إصدار React:** 18.2.0
- **إصدار Vite:** 5.0.8
- **إصدار React Router:** 6.20.0
- **إصدار Recharts:** 2.10.3

---

**تم إنشاء هذا الملف بواسطة:** AI Assistant  
**التاريخ:** 2025  
**الغرض:** توثيق شامل لجميع أكواد لوحة التحكم


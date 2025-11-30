import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff, ChevronDown, Moon, Sun, Home } from 'lucide-react';
import laptopImage from '../assets/images/login-logo--lap-img.png';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const languageRef = useRef(null);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    const token = localStorage.getItem('auth_token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // إغلاق dropdown اللغة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
    };

    if (isLanguageOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        setShowSuccessToast(true);
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500); // انتظار 1.5 ثانية لعرض الإشعار قبل الانتقال
      } else {
        setError(result.error || t('login.error'));
      }
    } catch (err) {
      setError(err.message || t('login.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Language & Theme Controls */}
      <div className="login-controls">
        <Link to="/" className="login-home-btn" title={language === 'ar' ? 'الصفحة الرئيسية' : 'Home'}>
          <Home size={20} />
        </Link>
        <div className={`login-language-selector ${isLanguageOpen ? 'active' : ''}`} ref={languageRef}>
          <button
            className="login-language-btn"
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
          >
            <span>{language === 'ar' ? t('language.arabic') : t('language.english')}</span>
            <ChevronDown size={16} />
          </button>
          {isLanguageOpen && (
            <div className="login-language-dropdown">
              <button
                onClick={() => {
                  changeLanguage('ar');
                  setIsLanguageOpen(false);
                }}
                className={language === 'ar' ? 'active' : ''}
              >
                {t('language.arabic')}
              </button>
              <button
                onClick={() => {
                  changeLanguage('en');
                  setIsLanguageOpen(false);
                }}
                className={language === 'en' ? 'active' : ''}
              >
                {t('language.english')}
              </button>
            </div>
          )}
        </div>
        <button 
          className="login-theme-toggle" 
          onClick={toggleTheme} 
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="login-wrapper">
        {/* Right Section - Promotional Content */}
        <div className="login-promo-section">
          <div className="login-promo-content">
            <h2 className="login-promo-title">{t('login.promoTitle')}</h2>
            <p className="login-promo-description">{t('login.promoDescription')}</p>
            <div className="login-laptop-wrapper">
              <img 
                src={laptopImage} 
                alt="Bustani Platform" 
                className="login-laptop-image"
              />
            </div>
          </div>
          {/* Decorative Curves */}
          <div className="login-curve login-curve-top"></div>
          <div className="login-curve login-curve-bottom"></div>
        </div>

        {/* Left Section - Login Form */}
        <div className="login-form-section">
          <div className="login-form-content">
            {/* Title */}
            <h1 className="login-title">{t('login.title')}</h1>
            <p className="login-subtitle">{t('login.subtitle')}</p>

            {/* Error Message */}
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form className="login-form" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="login-input-group">
                <label className="login-label">{t('login.email')}</label>
                <input
                  type="email"
                  className="login-input"
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div className="login-input-group">
                <label className="login-label">{t('login.password')}</label>
                <div className="login-password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="login-input login-password-input"
                    placeholder={t('login.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="login-password-hint">{t('login.passwordHint')}</p>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="login-options">
                <label className="login-checkbox-label">
                  <input
                    type="checkbox"
                    className="login-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span>{t('login.rememberMe')}</span>
                </label>
                <a href="#" className="login-forgot-link" onClick={(e) => e.preventDefault()}>
                  {t('login.forgotPassword')}
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="login-submit-button"
                disabled={isLoading}
              >
                {isLoading ? t('login.loading') : t('login.button')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="login-success-toast">
          <div className="login-success-toast-content">
            <span className="login-success-toast-icon">✓</span>
            <span className="login-success-toast-message">
              {t('login.success')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

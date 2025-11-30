import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, User, Moon, Sun, Menu, X, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useHomeData } from '../../context/HomeDataContext';
import { useAuth } from '../../context/AuthContext';
import logoLight from '../../assets/images/boostani_logo_light.png';
import logoDark from '../../assets/images/boostani_logo_dark.png';
import './Navbar.css';

const Navbar = () => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDonationOpen, setIsMobileDonationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const { homeData } = useHomeData();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const languageRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // إغلاق dropdown اللغة و user menu عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest('.mobile-menu-btn')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isLanguageOpen || isMobileMenuOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageOpen, isMobileMenuOpen, isUserMenuOpen]);

  // إغلاق القائمة المنسدلة عند تغيير الصفحة
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileDonationOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/campaigns', label: t('nav.campaigns') },
    { path: '/zakat', label: t('nav.zakat') },
    { path: '/donations', label: t('nav.donations'), hasDropdown: true },
    { path: '/contact', label: t('nav.contact') },
  ];

  // استخدام الفئات الأب من API لعرضها في قائمة "أقسام التبرع"
  const donationSections = useMemo(() => {
    if (!homeData?.parent_categories || homeData.parent_categories.length === 0) {
      // Fallback للقائمة الثابتة إذا لم تكن البيانات متوفرة
      return [
        { path: '/donations/education', label: t('donations.education') },
        { path: '/donations/health', label: t('donations.health') },
        { path: '/donations/food', label: t('donations.food') },
        { path: '/donations/shelter', label: t('donations.shelter') },
      ];
    }

    // تحويل parent_categories إلى donationSections مع ربطها بصفحة الحملات مع فلترة
    return homeData.parent_categories.map((category) => ({
      path: `/campaigns?category_id=${category.id}`,
      label: category.name,
      categoryId: category.id,
    }));
  }, [homeData, t]);

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setIsLanguageOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Right Side - Logo & Navigation */}
        <div className="navbar-right">
          {/* Logo */}
          <Link to="/" className="logo-container" onClick={() => setIsMobileMenuOpen(false)}>
            <img
              src={isDarkMode ? logoDark : logoLight}
              alt={t('common.logo')}
              className="logo-image"
            />
          </Link>

          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                {link.hasDropdown ? (
                  <div className="dropdown-wrapper">
                    <button
                      type="button"
                      className={`nav-link nav-link-button ${isActive(link.path) ? 'active' : ''} ${isDonationOpen ? 'open' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsDonationOpen(!isDonationOpen);
                      }}
                    >
                      {link.label}
                      <ChevronDown size={14} className={isDonationOpen ? 'rotated' : ''} />
                    </button>
                    {isDonationOpen && (
                      <div
                        className={`donation-dropdown ${isDonationOpen ? 'open' : ''}`}
                        onMouseLeave={() => setIsDonationOpen(false)}
                      >
                        {donationSections.map((section) => (
                          <Link
                            key={section.path}
                            to={section.path}
                            className="dropdown-item"
                            onClick={() => setIsDonationOpen(false)}
                          >
                            {section.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={link.path}
                    className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Left Side - Language, Theme Toggle & User */}
        <div className="navbar-left">
          <div className="language-selector" ref={languageRef}>
            <button
              className="language-btn"
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            >
              <span>{language === 'ar' ? t('language.arabic') : t('language.english')}</span>
              <ChevronDown size={16} />
            </button>
            {isLanguageOpen && (
              <div className="language-dropdown">
                <button
                  onClick={() => handleLanguageChange('ar')}
                  className={language === 'ar' ? 'active' : ''}
                >
                  {t('language.arabic')}
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={language === 'en' ? 'active' : ''}
                >
                  {t('language.english')}
                </button>
              </div>
            )}
          </div>
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {!isLoading && isAuthenticated && user ? (
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button 
                className="user-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <span className="user-name">{user.name || user.email || 'User'}</span>
                {user.image ? (
                  <img 
                    src={user.image} 
                    alt={user.name || 'User'} 
                    className="user-avatar"
                  />
                ) : (
                  <div className="user-avatar-placeholder">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
                  </div>
                )}
                <ChevronDown size={14} className={isUserMenuOpen ? 'rotated' : ''} />
              </button>
              {isUserMenuOpen && (
                <div className="user-menu-dropdown">
                  <div className="user-menu-header">
                    {user.image ? (
                      <img 
                        src={user.image} 
                        alt={user.name || 'User'} 
                        className="user-menu-avatar"
                      />
                    ) : (
                      <div className="user-menu-avatar-placeholder">
                        {user.name ? user.name.charAt(0).toUpperCase() : <User size={24} />}
                      </div>
                    )}
                    <div className="user-menu-info">
                      <div className="user-menu-name">{user.name || user.email || 'User'}</div>
                      {user.email && <div className="user-menu-email">{user.email}</div>}
                    </div>
                  </div>
                  <button className="user-menu-item logout-btn" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="user-btn login-link">
              <User size={20} />
              <span>{language === 'ar' ? 'تسجيل الدخول' : 'Login'}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}
      >
        <ul className="mobile-nav-links">
          {navLinks.map((link) => (
            <li key={link.path}>
              {link.hasDropdown ? (
                <div className="mobile-dropdown-wrapper">
                  <button
                    className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                    onClick={() => setIsMobileDonationOpen(!isMobileDonationOpen)}
                  >
                    {link.label}
                    <ChevronDown
                      size={16}
                      className={isMobileDonationOpen ? 'rotated' : ''}
                    />
                  </button>
                  {isMobileDonationOpen && (
                    <ul className="mobile-donation-dropdown">
                      {donationSections.map((section) => (
                        <li key={section.path}>
                          <Link
                            to={section.path}
                            className="mobile-dropdown-item"
                            onClick={() => {
                              setIsMobileDonationOpen(false);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            {section.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={link.path}
                  className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;


import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, User, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import logoLight from '../../assets/images/boostani_logo_light.png';
import logoDark from '../../assets/images/boostani_logo_dark.png';
import './Navbar.css';

const Navbar = () => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDonationOpen, setIsMobileDonationOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const location = useLocation();
  const languageRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // إغلاق dropdown اللغة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest('.mobile-menu-btn')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isLanguageOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageOpen, isMobileMenuOpen]);

  // إغلاق القائمة المنسدلة عند تغيير الصفحة
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileDonationOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/projects', label: t('nav.projects') },
    { path: '/donations', label: t('nav.donations'), hasDropdown: true },
    { path: '/contact', label: t('nav.contact') },
  ];

  const donationSections = [
    { path: '/donations/education', label: t('donations.education') },
    { path: '/donations/health', label: t('donations.health') },
    { path: '/donations/food', label: t('donations.food') },
    { path: '/donations/shelter', label: t('donations.shelter') },
  ];

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setIsLanguageOpen(false);
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
                    <Link
                      to={link.path}
                      className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                      onMouseEnter={() => setIsDonationOpen(true)}
                      onMouseLeave={() => setIsDonationOpen(false)}
                    >
                      {link.label}
                      <ChevronDown size={14} />
                    </Link>
                    {isDonationOpen && (
                      <div
                        className="donation-dropdown"
                        onMouseEnter={() => setIsDonationOpen(true)}
                        onMouseLeave={() => setIsDonationOpen(false)}
                      >
                        {donationSections.map((section) => (
                          <Link
                            key={section.path}
                            to={section.path}
                            className="dropdown-item"
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
          <button className="user-btn">
            <User size={20} />
          </button>
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


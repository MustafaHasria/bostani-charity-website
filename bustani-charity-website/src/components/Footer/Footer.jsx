import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import logoLight from '../../assets/images/boostani_logo_light.png';
import logoDark from '../../assets/images/boostani_logo_dark.png';
import './Footer.css';

const Footer = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Logo Section */}
          <div className="footer-section footer-logo-section">
            <div className="footer-logo-container">
              <img
                src={isDarkMode ? logoDark : logoLight}
                alt={t('common.logo')}
                className="footer-logo"
              />
            </div>
          </div>

          {/* Follow Us Section */}
          <div className="footer-section">
            <h3 className="footer-title">{t('footer.follow.title')}</h3>
            <div className="footer-social">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Twitter"
              >
                <Twitter size={24} />
              </a>
            </div>
          </div>

          {/* Help Section */}
          <div className="footer-section">
            <h3 className="footer-title">{t('footer.help.title')}</h3>
            <Link to="/about" className="footer-link">
              {t('footer.help.about')}
            </Link>
            <Link to="/faq" className="footer-link">
              {t('footer.help.faq')}
            </Link>
            <Link to="/terms" className="footer-link">
              {t('footer.help.terms')}
            </Link>
            <Link to="/privacy" className="footer-link">
              {t('footer.help.privacy')}
            </Link>
          </div>

          {/* Contact Us Section */}
          <div className="footer-section">
            <h3 className="footer-title">{t('footer.contact.title')}</h3>
            <div className="footer-contact-item">
              <MapPin size={20} />
              <span>{t('footer.contact.location')}</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={20} />
              <span>{t('footer.contact.email')}</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={20} />
              <span>{t('footer.contact.phone')}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Copyright */}
        <div className="footer-copyright">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


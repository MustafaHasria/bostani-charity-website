import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import heartHandImage from '../../assets/images/heart-hand.png';
import heartHandRightImage from '../../assets/images/heart-hand-right.png';
import './Zakat.css';

const Zakat = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();

  return (
    <section className="zakat-section">
      {/* Decorative Icons - Outside container to be on section edges */}
      <div className="zakat-icon zakat-icon-top">
        <img src={heartHandImage} alt="Heart and hands" className="zakat-decorative-image" />
        <div className="sparkle-lines">
          <div className="sparkle-line"></div>
          <div className="sparkle-line"></div>
          <div className="sparkle-line"></div>
        </div>
      </div>

      <div className="zakat-icon zakat-icon-bottom">
        <img src={heartHandRightImage} alt="Heart and hand" className="zakat-decorative-image" />
      </div>

      <div className="zakat-container">
        {/* Content */}
        <div className="zakat-content">
          <h2 className="zakat-title">{t('zakat.title')}</h2>
          
          <p className="zakat-description">{t('zakat.description')}</p>
          
          <p className="zakat-cta-text">{t('zakat.ctaText')}</p>
          
          <Link to="/zakat" className="zakat-button">
            <span>{t('zakat.buttonText')}</span>
            <img src={heartHandRightImage} alt="Donate" className="zakat-button-icon" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Zakat;


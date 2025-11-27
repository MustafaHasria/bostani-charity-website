import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import './Hero.css';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="hero-section">
      <div className="hero-background">
        {/* Background image will be set via CSS */}
        <div className="hero-overlay"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">{t('hero.title')}</h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
        </div>
        
        <div className="hero-buttons">
          <Link to="/donate" className="btn-donate">
            <span>{t('hero.donateNow')}</span>
            <Heart size={20} />
          </Link>
          
          <Link to="/donations" className="btn-donations">
          <ArrowLeft size={20} />
            <span>{t('hero.donationSections')}</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;


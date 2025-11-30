import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import QuickDonationModal from '../QuickDonationModal/QuickDonationModal';
import './Hero.css';

const Hero = () => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDonationModal, setShowDonationModal] = useState(false);

  // 3 صور جميلة للخلفية
  const heroImages = [
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80',
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&q=80',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1920&q=80',
  ];

  // تغيير الصورة كل 3 ثوان
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="hero-section">
      <div className="hero-background">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`hero-background-image ${index === currentImageIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          ></div>
        ))}
        <div className="hero-overlay"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">{t('hero.title')}</h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
        </div>
        
        <div className="hero-buttons">
          <button 
            className="btn-donate" 
            onClick={() => setShowDonationModal(true)}
          >
            <span>{t('hero.donateNow')}</span>
            <Heart size={20} />
          </button>
          
          <Link to="/campaigns" className="btn-donations">
          <ArrowLeft size={20} />
            <span>{t('hero.donationSections')}</span>
          </Link>
        </div>
      </div>
      
      {/* Quick Donation Modal */}
      <QuickDonationModal 
        isOpen={showDonationModal} 
        onClose={() => setShowDonationModal(false)} 
      />
    </section>
  );
};

export default Hero;


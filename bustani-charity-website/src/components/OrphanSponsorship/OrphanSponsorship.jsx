import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import './OrphanSponsorship.css';

const OrphanSponsorship = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const orphanSponsorships = [
    {
      id: 1,
      title: t('orphanSponsorship.item1.title'),
      description: t('orphanSponsorship.item1.description'),
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop',
      paid: 1300,
      total: 6600,
      remaining: 5300,
    },
    {
      id: 2,
      title: t('orphanSponsorship.item2.title'),
      description: t('orphanSponsorship.item2.description'),
      image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=300&fit=crop',
      paid: 5300,
      total: 10600,
      remaining: 5300,
    },
    {
      id: 3,
      title: t('orphanSponsorship.item3.title'),
      description: t('orphanSponsorship.item3.description'),
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop',
      paid: 5200,
      total: 10500,
      remaining: 5300,
    },
    {
      id: 4,
      title: t('orphanSponsorship.item1.title') + ' 2',
      description: t('orphanSponsorship.item1.description'),
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop',
      paid: 2100,
      total: 8000,
      remaining: 5900,
    },
    {
      id: 5,
      title: t('orphanSponsorship.item2.title') + ' 2',
      description: t('orphanSponsorship.item2.description'),
      image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=300&fit=crop',
      paid: 4500,
      total: 9000,
      remaining: 4500,
    },
    {
      id: 6,
      title: t('orphanSponsorship.item3.title') + ' 2',
      description: t('orphanSponsorship.item3.description'),
      image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=300&fit=crop',
      paid: 1800,
      total: 7000,
      remaining: 5200,
    },
    {
      id: 7,
      title: t('orphanSponsorship.item1.title') + ' 3',
      description: t('orphanSponsorship.item1.description'),
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop',
      paid: 3800,
      total: 7500,
      remaining: 3700,
    },
    {
      id: 8,
      title: t('orphanSponsorship.item2.title') + ' 3',
      description: t('orphanSponsorship.item2.description'),
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop',
      paid: 4900,
      total: 11000,
      remaining: 6100,
    },
    {
      id: 9,
      title: t('orphanSponsorship.item3.title') + ' 3',
      description: t('orphanSponsorship.item3.description'),
      image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=300&fit=crop',
      paid: 6200,
      total: 12000,
      remaining: 5800,
    },
  ];

  // حساب عدد الكروت المرئية بناءً على حجم الشاشة
  const [visibleCards, setVisibleCards] = useState(3);

  useEffect(() => {
    const calculateVisibleCards = () => {
      const width = window.innerWidth;
      
      if (width < 600) {
        // Mobile: كرت واحد
        setVisibleCards(1);
      } else if (width < 1024) {
        // Tablet: كرتين
        setVisibleCards(2);
      } else {
        // Desktop: 3 كروت
        setVisibleCards(3);
      }
    };

    calculateVisibleCards();
    window.addEventListener('resize', calculateVisibleCards);
    return () => window.removeEventListener('resize', calculateVisibleCards);
  }, []);

  const totalGroups = Math.ceil(orphanSponsorships.length / visibleCards);

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalGroups);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [totalGroups]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? totalGroups - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === totalGroups - 1 ? 0 : prevIndex + 1
    );
  };

  const getProgressPercentage = (paid, total) => {
    return Math.round((paid / total) * 100);
  };

  return (
    <section className="orphan-sponsorship-section">
      <div className="orphan-sponsorship-container">
        {/* Header */}
        <div className="orphan-sponsorship-header">
          <div className="orphan-sponsorship-title-banner">
            <h2>{t('orphanSponsorship.title')}</h2>
          </div>
          <Link to="/projects" className="view-all-link">
            {t('orphanSponsorship.viewAll')}
            {language === 'ar' ? ' ←' : ' →'}
          </Link>
        </div>
        <div className="orphan-sponsorship-divider"></div>

        {/* Carousel */}
        <div className="orphan-sponsorship-carousel">
          <button 
            className="carousel-btn carousel-btn-prev"
            onClick={goToPrevious}
            aria-label="Previous slide"
          >
            {language === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>

          <div className="orphan-sponsorship-slider">
            <div 
              className="orphan-sponsorship-track"
              style={{
                transform: language === 'ar' 
                  ? `translateX(${currentIndex * 100}%)`
                  : `translateX(-${currentIndex * 100}%)`,
                '--cards-per-view': visibleCards,
              }}
            >
              {Array.from({ length: totalGroups }).map((_, groupIndex) => (
                <div 
                  key={groupIndex} 
                  className="orphan-sponsorship-group"
                  style={{ '--cards-per-view': visibleCards }}
                >
                  {orphanSponsorships
                    .slice(groupIndex * visibleCards, (groupIndex + 1) * visibleCards)
                    .map((item) => (
                      <div key={item.id} className="orphan-sponsorship-card">
                        <div className="orphan-sponsorship-image">
                          <img src={item.image} alt={item.title} />
                        </div>
                        <div className="orphan-sponsorship-content">
                          <h3 className="orphan-sponsorship-title">{item.title}</h3>
                          <p className="orphan-sponsorship-description">{item.description}</p>
                          <div className="orphan-sponsorship-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill"
                                style={{ width: `${getProgressPercentage(item.paid, item.total)}%` }}
                              ></div>
                            </div>
                            <div className="progress-info">
                              <span className="progress-paid">
                                {t('orphanSponsorship.item1.paid')} {item.paid.toLocaleString()}
                              </span>
                              <span className="progress-remaining">
                                {t('orphanSponsorship.item1.remaining')} {item.remaining.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Link to={`/orphan-sponsorship/${item.id}`} className="orphan-sponsorship-btn">
                            {t('orphanSponsorship.item1.details')}
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>

          <button 
            className="carousel-btn carousel-btn-next"
            onClick={goToNext}
            aria-label="Next slide"
          >
            {language === 'ar' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="orphan-sponsorship-pagination">
          {Array.from({ length: totalGroups }).map((_, index) => (
            <button
              key={index}
              className={`pagination-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OrphanSponsorship;


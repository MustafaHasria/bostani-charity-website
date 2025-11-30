import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useHomeData } from '../../context/HomeDataContext';
import detailsIcon from '../../assets/images/details-icon.png';
import './OrphanSponsorship.css';

// دالة لتقليل النص إلى 50 حرف مع إضافة "..."
const truncateDescription = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

const OrphanSponsorship = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { homeData, loading } = useHomeData();
  const [currentIndex, setCurrentIndex] = useState(0);

  // استخدام subcategories التي تحتوي على "Orphan" في الاسم أو ID 15 (Orphan Support)
  const orphanSponsorships = useMemo(() => {
    if (!homeData?.subcategories?.data) {
      return [];
    }

    // البحث عن subcategory باسم "Orphan Support" أو ID 15
    const orphanCategory = homeData.parent_categories?.find(
      (cat) => cat.id === 15 || cat.name.toLowerCase().includes('orphan')
    );

    if (!orphanCategory) {
      return [];
    }

    // إنشاء خريطة للفئات
    const categoriesMap = new Map();
    if (homeData.parent_categories) {
      homeData.parent_categories.forEach((cat) => {
        categoriesMap.set(cat.id, cat.name);
      });
    }
    
    // إنشاء خريطة للفئات الفرعية
    const subcategoriesMap = new Map();
    homeData.subcategories.data.forEach((subcat) => {
      subcategoriesMap.set(subcat.id, subcat.name);
    });

    // جمع جميع الحملات من subcategories المرتبطة بـ Orphan Support
    const allCampaigns = [];
    homeData.subcategories.data.forEach((subcategory) => {
      if (subcategory.campaigns && subcategory.campaigns.length > 0) {
        subcategory.campaigns.forEach((campaign) => {
          // البحث عن اسم الفئة
          let categoryName = null;
          if (campaign.category_id) {
            categoryName = subcategoriesMap.get(campaign.category_id) || categoriesMap.get(campaign.category_id);
          }
          // إذا لم تجد، استخدم اسم subcategory الحالي
          if (!categoryName) {
            categoryName = subcategory.name;
          }
          
          allCampaigns.push({
            id: campaign.id,
            title: campaign.title,
            description: campaign.description || t('orphanSponsorship.item1.description'),
            image: campaign.image || 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop',
            paid: campaign.collected_amount || 0,
            total: campaign.goal_amount || 0,
            remaining: (campaign.goal_amount || 0) - (campaign.collected_amount || 0),
            categoryName: categoryName || null,
          });
        });
      }
    });

    // إذا لم توجد حملات، نستخدم subcategories فارغة كبديل
    return allCampaigns.length > 0 ? allCampaigns : [];
  }, [homeData, t]);

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

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === 0) {
        return Math.max(0, orphanSponsorships.length - visibleCards);
      }
      return Math.max(0, prevIndex - 1);
    });
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, orphanSponsorships.length - visibleCards);
      if (prevIndex >= maxIndex) {
        return 0;
      }
      return Math.min(maxIndex, prevIndex + 1);
    });
  };

  const getProgressPercentage = (paid, total) => {
    return Math.round((paid / total) * 100);
  };

  if (loading) {
    return (
      <section className="orphan-sponsorship-section">
        <div className="orphan-sponsorship-container">
          <div className="orphan-sponsorship-header">
            <div className="orphan-sponsorship-title-banner">
              <h2>{t('orphanSponsorship.title')}</h2>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!orphanSponsorships || orphanSponsorships.length === 0) {
    return (
      <section className="orphan-sponsorship-section">
        <div className="orphan-sponsorship-container">
          <div className="orphan-sponsorship-header">
            <div className="orphan-sponsorship-title-banner">
              <h2>{t('orphanSponsorship.title')}</h2>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>{language === 'ar' ? 'لا توجد كفالات متاحة' : 'No sponsorships available'}</p>
          </div>
        </div>
      </section>
    );
  }

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
                  ? `translateX(${currentIndex * (100 / visibleCards)}%)`
                  : `translateX(-${currentIndex * (100 / visibleCards)}%)`,
                '--cards-per-view': visibleCards,
              }}
            >
              {orphanSponsorships.map((item) => (
                <div key={item.id} className="orphan-sponsorship-card">
                  <div className="orphan-sponsorship-image">
                    <img src={item.image} alt={item.title} />
                    {item.categoryName && (
                      <div className="campaign-category-badge">
                        {item.categoryName}
                      </div>
                    )}
                  </div>
                  <div className="orphan-sponsorship-content">
                    <h3 className="orphan-sponsorship-title">{item.title}</h3>
                    <p className="orphan-sponsorship-description">{truncateDescription(item.description)}</p>
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
                    <Link to={`/campaigns/${item.id}`} className="orphan-sponsorship-btn">
                      <span>{t('orphanSponsorship.item1.details')}</span>
                      <img src={detailsIcon} alt="" className="details-icon" />
                    </Link>
                  </div>
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
          {Array.from({ length: Math.max(1, orphanSponsorships.length - visibleCards + 1) }).map((_, index) => (
            <button
              key={index}
              className={`pagination-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OrphanSponsorship;


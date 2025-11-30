import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useHomeData } from '../../context/HomeDataContext';
import detailsIcon from '../../assets/images/details-icon.png';
import './Campaigns.css';

// دالة لتقليل النص إلى 50 حرف مع إضافة "..."
const truncateDescription = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

const Campaigns = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { homeData, loading } = useHomeData();
  const [currentIndex, setCurrentIndex] = useState(0);

  // تحويل بيانات API إلى الشكل المطلوب
  const campaigns = useMemo(() => {
    if (!homeData?.featured_campaigns) {
      return [];
    }

    // إنشاء خريطة للحملات الكاملة من subcategories مع ربطها بـ subcategory
    const fullCampaignsMap = new Map();
    const campaignToSubcategoryMap = new Map(); // خريطة لربط الحملة بـ subcategory
    if (homeData.subcategories?.data) {
      homeData.subcategories.data.forEach((subcategory) => {
        if (subcategory.campaigns && Array.isArray(subcategory.campaigns)) {
          subcategory.campaigns.forEach((campaign) => {
            fullCampaignsMap.set(campaign.id, campaign);
            // ربط الحملة بـ subcategory
            campaignToSubcategoryMap.set(campaign.id, subcategory);
          });
        }
      });
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
    if (homeData.subcategories?.data) {
      homeData.subcategories.data.forEach((subcat) => {
        subcategoriesMap.set(subcat.id, subcat.name);
      });
    }

    // دمج بيانات featured_campaigns مع البيانات الكاملة من subcategories
    return homeData.featured_campaigns.map((featuredCampaign) => {
      const fullCampaign = fullCampaignsMap.get(featuredCampaign.id);
      const subcategory = campaignToSubcategoryMap.get(featuredCampaign.id);
      
      // البحث عن اسم الفئة
      let categoryName = null;
      if (fullCampaign?.category_id) {
        // البحث في الفئات الفرعية أولاً
        categoryName = subcategoriesMap.get(fullCampaign.category_id);
        // إذا لم تجد، ابحث في الفئات الرئيسية
        if (!categoryName) {
          categoryName = categoriesMap.get(fullCampaign.category_id);
        }
      }
      // إذا لم تجد، استخدم اسم subcategory التي تحتوي على الحملة
      if (!categoryName && subcategory) {
        categoryName = subcategory.name;
      }
      
      // استخدام البيانات الكاملة إذا كانت متوفرة، وإلا استخدام البيانات من featured_campaigns
      return {
        id: featuredCampaign.id,
        title: fullCampaign?.title || featuredCampaign.title || featuredCampaign.name,
        description: fullCampaign?.description || t('campaigns.campaign1.description'),
        image: fullCampaign?.image || featuredCampaign.image || 'https://images.unsplash.com/photo-1606914509765-1477099e4315?w=400&h=300&fit=crop',
        paid: fullCampaign?.collected_amount || 0,
        total: fullCampaign?.goal_amount || 0,
        remaining: (fullCampaign?.goal_amount || 0) - (fullCampaign?.collected_amount || 0),
        categoryName: categoryName || null,
      };
    });
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
        // إذا كنا في البداية، انتقل إلى النهاية
        return Math.max(0, campaigns.length - visibleCards);
      }
      // التمرير للخلف بمقدار كرت واحد
      return Math.max(0, prevIndex - 1);
    });
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, campaigns.length - visibleCards);
      if (prevIndex >= maxIndex) {
        // إذا كنا في النهاية، ارجع إلى البداية
        return 0;
      }
      // التمرير للأمام بمقدار كرت واحد
      return Math.min(maxIndex, prevIndex + 1);
    });
  };

  const getProgressPercentage = (paid, total) => {
    return Math.round((paid / total) * 100);
  };

  if (loading) {
    return (
      <section className="campaigns-section">
        <div className="campaigns-container">
          <div className="campaigns-header">
            <div className="campaigns-title-banner">
              <h2>{t('campaigns.title')}</h2>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <section className="campaigns-section">
        <div className="campaigns-container">
          <div className="campaigns-header">
            <div className="campaigns-title-banner">
              <h2>{t('campaigns.title')}</h2>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>{language === 'ar' ? 'لا توجد حملات متاحة' : 'No campaigns available'}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="campaigns-section">
      <div className="campaigns-container">
        {/* Header */}
        <div className="campaigns-header">
          <div className="campaigns-title-banner">
            <h2>{t('campaigns.title')}</h2>
          </div>
          <Link to="/campaigns" className="view-all-link">
            {t('campaigns.viewAll')}
            {language === 'ar' ? ' ←' : ' →'}
          </Link>
        </div>
        <div className="campaigns-divider"></div>

        {/* Carousel */}
        <div className="campaigns-carousel">
          <button 
            className="carousel-btn carousel-btn-prev"
            onClick={goToPrevious}
            aria-label="Previous slide"
          >
            {language === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>

          <div className="campaigns-slider">
            <div 
              className="campaigns-track"
              style={{
                transform: language === 'ar' 
                  ? `translateX(${currentIndex * (100 / visibleCards)}%)`
                  : `translateX(-${currentIndex * (100 / visibleCards)}%)`,
                '--cards-per-view': visibleCards,
              }}
            >
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="campaign-card">
                  <div className="campaign-image">
                    <img src={campaign.image} alt={campaign.title} />
                    {campaign.categoryName && (
                      <div className="campaign-category-badge">
                        {campaign.categoryName}
                      </div>
                    )}
                  </div>
                  <div className="campaign-content">
                    <h3 className="campaign-title">{campaign.title}</h3>
                    <p className="campaign-description">{truncateDescription(campaign.description)}</p>
                    <div className="campaign-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${getProgressPercentage(campaign.paid, campaign.total)}%` }}
                        ></div>
                      </div>
                      <div className="progress-info">
                        <span className="progress-paid">
                          {t('campaigns.campaign1.paid')} {campaign.paid.toLocaleString()}
                        </span>
                        <span className="progress-remaining">
                          {t('campaigns.campaign1.remaining')} {campaign.remaining.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Link to={`/campaigns/${campaign.id}`} className="campaign-btn">
                      <span>{t('campaigns.campaign1.details')}</span>
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
        <div className="campaigns-pagination">
          {Array.from({ length: Math.max(1, campaigns.length - visibleCards + 1) }).map((_, index) => (
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

export default Campaigns;


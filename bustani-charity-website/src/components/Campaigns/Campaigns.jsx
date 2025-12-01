import { useState, useEffect, useMemo, useRef } from 'react';
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
  const [visibleCards, setVisibleCards] = useState(3);
  const [canScroll, setCanScroll] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const trackRef = useRef(null);
  const sliderRef = useRef(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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

  // حساب عدد الكروت المرئية وفحص إمكانية التمرير
  useEffect(() => {
    const calculateVisibleCards = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      const gap = 24; // 1.5rem = 24px
      
      let cardWidth;
      if (width < 600) {
        cardWidth = 280;
      } else if (width < 1024) {
        cardWidth = 300;
      } else {
        cardWidth = 320;
      }
      
      // حساب عدد الكروت التي يمكن عرضها
      const cardsVisible = Math.ceil((width) / (cardWidth + gap));
      setVisibleCards(cardsVisible);
      
      // إذا كان عدد الكروت أقل من أو يساوي المرئية، لا يمكن التمرير
      setCanScroll(campaigns.length > cardsVisible);
    };

    calculateVisibleCards();
    window.addEventListener('resize', calculateVisibleCards);
    return () => window.removeEventListener('resize', calculateVisibleCards);
  }, [campaigns.length]);

  // تحديث currentIndex عند التمرير على الموبايل
  useEffect(() => {
    if (!isMobile || !sliderRef.current) return;

    const slider = sliderRef.current;
    const cards = slider.querySelectorAll('.campaign-card');
    
    const handleScroll = () => {
      if (!cards.length) return;
      
      // العثور على الكرت الأقرب إلى بداية العرض
      let closestIndex = 0;
      let closestDistance = Infinity;
      const sliderRect = slider.getBoundingClientRect();
      
      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const distance = Math.abs(cardRect.left - sliderRect.left);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      
      if (closestIndex !== currentIndex) {
        setCurrentIndex(closestIndex);
      }
    };

    slider.addEventListener('scroll', handleScroll, { passive: true });
    return () => slider.removeEventListener('scroll', handleScroll);
  }, [isMobile, currentIndex, campaigns.length]);

  // تمرير كرت واحد في كل مرة - بدون حدود
  const goToPrevious = () => {
    if (!canScroll) return; // منع التقليب إذا لم تكن هناك حاجة
    
    if (isMobile && sliderRef.current) {
      // على الموبايل: استخدم scrollIntoView
      const cards = sliderRef.current.querySelectorAll('.campaign-card');
      const newIndex = currentIndex === 0 ? campaigns.length - 1 : currentIndex - 1;
      setCurrentIndex(newIndex);
      
      if (cards[newIndex]) {
        cards[newIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
      }
    } else {
      // على سطح المكتب: استخدم transform
      setCurrentIndex((prevIndex) => {
        if (prevIndex === 0) {
          return campaigns.length - 1;
        }
        return prevIndex - 1;
      });
    }
  };

  const goToNext = () => {
    if (!canScroll) return; // منع التقليب إذا لم تكن هناك حاجة
    
    if (isMobile && sliderRef.current) {
      // على الموبايل: استخدم scrollIntoView
      const cards = sliderRef.current.querySelectorAll('.campaign-card');
      const newIndex = currentIndex >= campaigns.length - 1 ? 0 : currentIndex + 1;
      setCurrentIndex(newIndex);
      
      if (cards[newIndex]) {
        cards[newIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
      }
    } else {
      // على سطح المكتب: استخدم transform
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= campaigns.length - 1) {
          return 0;
        }
        return prevIndex + 1;
      });
    }
  };

  const getProgressPercentage = (paid, total) => {
    return Math.round((paid / total) * 100);
  };

  // دعم التمرير بعجلة الماوس على سطح المكتب
  useEffect(() => {
    if (isMobile || !canScroll || !trackRef.current) return;

    const track = trackRef.current;
    let wheelTimeout = null;
    let isWheeling = false;

    const handleWheel = (e) => {
      if (!canScroll) {
        // إذا لم يكن هناك حاجة للتمرير، اترك التمرير للصفحة
        return;
      }

      // التحقق من اتجاه التمرير
      const deltaX = e.deltaX || 0;
      const deltaY = e.deltaY || 0;
      
      // السماح بالتمرير العمودي (للصفحة) - لا نفعل أي شيء
      // إذا كان التمرير عمودي بشكل واضح (deltaY أكبر من deltaX)، اتركه للصفحة
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // تمرير عمودي - اتركه للصفحة ولا تمنع التمرير
        return;
      }

      // التمرير أفقي - منع التمرير الافتراضي وتنقل بين الكروت
      // فقط عندما يكون التمرير أفقي بشكل واضح
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        e.preventDefault();

        // منع التنقل السريع (debounce)
        if (isWheeling) return;
        
        isWheeling = true;
        clearTimeout(wheelTimeout);
        
        wheelTimeout = setTimeout(() => {
          isWheeling = false;
        }, 100);

        const isRTL = language === 'ar';
        const shouldGoNext = isRTL ? deltaX < 0 : deltaX > 0;
        
        if (shouldGoNext) {
          // الانتقال للكرت التالي
          setCurrentIndex((prevIndex) => {
            if (prevIndex >= campaigns.length - 1) {
              return 0;
            }
            return prevIndex + 1;
          });
        } else {
          // الانتقال للكرت السابق
          setCurrentIndex((prevIndex) => {
            if (prevIndex === 0) {
              return campaigns.length - 1;
            }
            return prevIndex - 1;
          });
        }
      }
    };

    track.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      track.removeEventListener('wheel', handleWheel);
      clearTimeout(wheelTimeout);
    };
  }, [isMobile, canScroll, campaigns.length, language]);

  // Swipe/Drag handlers for mouse
  const handleMouseDown = (e) => {
    if (!canScroll) return;
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(currentIndex);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !canScroll) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 2;
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (!canScroll) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!canScroll) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    if (!canScroll) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // فقط إذا كان السحب أفقي أكثر من عمودي
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swipe left - go next
        goToNext();
      } else {
        // Swipe right - go previous
        goToPrevious();
      }
    }
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
          {/* Navigation Controls - Top Left */}
          <div className="campaigns-nav-controls">
            {canScroll && (
              <>
                <button 
                  className="carousel-btn carousel-btn-prev"
                  onClick={goToPrevious}
                  aria-label="Previous slide"
                >
                  {language === 'ar' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
                <button 
                  className="carousel-btn carousel-btn-next"
                  onClick={goToNext}
                  aria-label="Next slide"
                >
                  {language === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
              </>
            )}
            <Link to="/campaigns" className="campaigns-more-btn">
              {t('campaigns.more')}
            </Link>
          </div>
        </div>
        <div className="campaigns-divider"></div>

        {/* Carousel */}
        <div className="campaigns-carousel">
          <div className="campaigns-slider" ref={sliderRef}>
            <div 
              ref={trackRef}
              className={`campaigns-track ${!canScroll ? 'campaigns-track-centered' : ''} ${isDragging ? 'campaigns-track-dragging' : ''}`}
              style={{
                transform: (!canScroll || isMobile)
                  ? 'none'
                  : language === 'ar' 
                    ? `translateX(calc(${currentIndex} * (320px + 1.5rem)))`
                    : `translateX(calc(-${currentIndex} * (320px + 1.5rem)))`,
                cursor: isMobile ? 'default' : (isDragging ? 'grabbing' : canScroll ? 'grab' : 'default'),
              }}
              onMouseDown={!isMobile ? handleMouseDown : undefined}
              onMouseMove={!isMobile ? handleMouseMove : undefined}
              onMouseUp={!isMobile ? handleMouseUp : undefined}
              onMouseLeave={!isMobile ? handleMouseLeave : undefined}
              onTouchStart={!isMobile ? handleTouchStart : undefined}
              onTouchMove={!isMobile ? handleTouchMove : undefined}
              onTouchEnd={!isMobile ? handleTouchEnd : undefined}
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
        </div>

      </div>
    </section>
  );
};

export default Campaigns;


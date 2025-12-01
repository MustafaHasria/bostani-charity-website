import { useState, useEffect, useMemo, useRef } from 'react';
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

  // استخدام subcategories التي تحتوي على "Orphan" في الاسم أو ID 15 (Orphan Support)
  const orphanSponsorships = useMemo(() => {
    if (!homeData?.subcategories?.data) {
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

    return allCampaigns;
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
      setCanScroll(orphanSponsorships.length > cardsVisible);
    };

    calculateVisibleCards();
    window.addEventListener('resize', calculateVisibleCards);
    return () => window.removeEventListener('resize', calculateVisibleCards);
  }, [orphanSponsorships.length]);

  // تحديث currentIndex عند التمرير على الموبايل
  useEffect(() => {
    if (!isMobile || !sliderRef.current) return;

    const slider = sliderRef.current;
    const cards = slider.querySelectorAll('.orphan-sponsorship-card');
    
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
  }, [isMobile, currentIndex, orphanSponsorships.length]);

  // تمرير كرت واحد في كل مرة - بدون حدود
  const goToPrevious = () => {
    if (!canScroll) return; // منع التقليب إذا لم تكن هناك حاجة
    
    if (isMobile && sliderRef.current) {
      // على الموبايل: استخدم scrollIntoView
      const cards = sliderRef.current.querySelectorAll('.orphan-sponsorship-card');
      const newIndex = currentIndex === 0 ? orphanSponsorships.length - 1 : currentIndex - 1;
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
          return orphanSponsorships.length - 1;
        }
        return prevIndex - 1;
      });
    }
  };

  const goToNext = () => {
    if (!canScroll) return; // منع التقليب إذا لم تكن هناك حاجة
    
    if (isMobile && sliderRef.current) {
      // على الموبايل: استخدم scrollIntoView
      const cards = sliderRef.current.querySelectorAll('.orphan-sponsorship-card');
      const newIndex = currentIndex >= orphanSponsorships.length - 1 ? 0 : currentIndex + 1;
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
        if (prevIndex >= orphanSponsorships.length - 1) {
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
            if (prevIndex >= orphanSponsorships.length - 1) {
              return 0;
            }
            return prevIndex + 1;
          });
        } else {
          // الانتقال للكرت السابق
          setCurrentIndex((prevIndex) => {
            if (prevIndex === 0) {
              return orphanSponsorships.length - 1;
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
  }, [isMobile, canScroll, orphanSponsorships.length, language]);

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
          {/* Navigation Controls - Top Left */}
          <div className="orphan-sponsorship-nav-controls">
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
            <Link to="/projects" className="orphan-sponsorship-more-btn">
              {t('orphanSponsorship.more')}
            </Link>
          </div>
        </div>
        <div className="orphan-sponsorship-divider"></div>

        {/* Carousel */}
        <div className="orphan-sponsorship-carousel">
          <div className="orphan-sponsorship-slider" ref={sliderRef}>
            <div 
              ref={trackRef}
              className={`orphan-sponsorship-track ${!canScroll ? 'orphan-sponsorship-track-centered' : ''} ${isDragging ? 'orphan-sponsorship-track-dragging' : ''}`}
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
              {orphanSponsorships.map((item) => (
                <div key={item.id} className="orphan-sponsorship-card">
                  <div className="orphan-sponsorship-image">
                    <img src={item.image} alt={item.title} />
                    {item.categoryName && (
                      <div className="orphan-sponsorship-category-badge">
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
        </div>

      </div>
    </section>
  );
};

export default OrphanSponsorship;

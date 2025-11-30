import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useHomeData } from '../../context/HomeDataContext';
import detailsIcon from '../../assets/images/details-icon.png';
import './Projects.css';

// دالة لتقليل النص إلى 50 حرف مع إضافة "..."
const truncateDescription = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

const Projects = () => {
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
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);

  const projects = useMemo(() => {
    if (!homeData?.subcategories?.data) {
      return [];
    }

    // البحث عن subcategory "مشاريع بستاني" (ID = 30)
    const bustaniProjectsSubcategory = homeData.subcategories.data.find(
      (subcat) => 
        subcat.id === 30 || 
        subcat.name === 'مشاريع بستاني' ||
        subcat.name.toLowerCase().includes('بستاني') ||
        subcat.name.toLowerCase().includes('bustani')
    );

    if (!bustaniProjectsSubcategory || !bustaniProjectsSubcategory.campaigns || bustaniProjectsSubcategory.campaigns.length === 0) {
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

    // جمع جميع الحملات من subcategory "مشاريع بستاني"
    const allCampaigns = bustaniProjectsSubcategory.campaigns.map((campaign) => {
      // البحث عن اسم الفئة
      let categoryName = null;
      if (campaign.category_id) {
        categoryName = subcategoriesMap.get(campaign.category_id) || categoriesMap.get(campaign.category_id);
      }
      // إذا لم تجد، استخدم اسم subcategory الحالي
      if (!categoryName) {
        categoryName = bustaniProjectsSubcategory.name;
      }
      
      return {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description || t('projects.project1.description'),
        image: campaign.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
        paid: campaign.collected_amount || 0,
        total: campaign.goal_amount || 0,
        remaining: (campaign.goal_amount || 0) - (campaign.collected_amount || 0),
        categoryName: categoryName || null,
      };
    });

    return allCampaigns;
  }, [homeData, t]);

  // حساب عدد الكروت المرئية وفحص إمكانية التمرير
  useEffect(() => {
    const calculateVisibleCards = () => {
      const width = window.innerWidth;
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
      setCanScroll(projects.length > cardsVisible);
    };

    calculateVisibleCards();
    window.addEventListener('resize', calculateVisibleCards);
    return () => window.removeEventListener('resize', calculateVisibleCards);
  }, [projects.length]);

  // تمرير كرت واحد في كل مرة - بدون حدود
  const goToPrevious = () => {
    if (!canScroll) return; // منع التقليب إذا لم تكن هناك حاجة
    setCurrentIndex((prevIndex) => {
      if (prevIndex === 0) {
        return projects.length - 1;
      }
      return prevIndex - 1;
    });
  };

  const goToNext = () => {
    if (!canScroll) return; // منع التقليب إذا لم تكن هناك حاجة
    setCurrentIndex((prevIndex) => {
      if (prevIndex >= projects.length - 1) {
        return 0;
      }
      return prevIndex + 1;
    });
  };

  const getProgressPercentage = (paid, total) => {
    return Math.round((paid / total) * 100);
  };

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
      <section className="projects-section">
        <div className="projects-container">
          <div className="projects-header">
            <div className="projects-title-banner">
              <h2>{t('projects.title')}</h2>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <section className="projects-section">
        <div className="projects-container">
          <div className="projects-header">
            <div className="projects-title-banner">
              <h2>{t('projects.title')}</h2>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>{language === 'ar' ? 'لا توجد مشاريع متاحة' : 'No projects available'}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="projects-section">
      <div className="projects-container">
        {/* Header */}
        <div className="projects-header">
          <div className="projects-title-banner">
            <h2>{t('projects.title')}</h2>
          </div>
          {/* Navigation Controls - Top Left */}
          <div className="projects-nav-controls">
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
            <Link to="/projects" className="projects-more-btn">
              {t('projects.more')}
            </Link>
          </div>
        </div>
        <div className="projects-divider"></div>

        {/* Carousel */}
        <div className="projects-carousel">
          <div className="projects-slider">
            <div 
              ref={trackRef}
              className={`projects-track ${!canScroll ? 'projects-track-centered' : ''} ${isDragging ? 'projects-track-dragging' : ''}`}
              style={{
                transform: !canScroll 
                  ? 'none'
                  : language === 'ar' 
                    ? `translateX(calc(${currentIndex} * (320px + 1.5rem)))`
                    : `translateX(calc(-${currentIndex} * (320px + 1.5rem)))`,
                cursor: isDragging ? 'grabbing' : canScroll ? 'grab' : 'default',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {projects.map((project) => (
                <div key={project.id} className="project-card">
                  <div className="project-image">
                    <img src={project.image} alt={project.title} />
                    {project.categoryName && (
                      <div className="campaign-category-badge">
                        {project.categoryName}
                      </div>
                    )}
                  </div>
                  <div className="project-content">
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-description">{truncateDescription(project.description)}</p>
                    <div className="project-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${getProgressPercentage(project.paid, project.total)}%` }}
                        ></div>
                      </div>
                      <div className="progress-info">
                        <span className="progress-paid">
                          {t('projects.project1.paid')} {project.paid.toLocaleString()}
                        </span>
                        <span className="progress-remaining">
                          {t('projects.project1.remaining')} {project.remaining.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Link to={`/campaigns/${project.id}`} className="project-btn">
                      <span>{t('projects.project1.details')}</span>
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

export default Projects;


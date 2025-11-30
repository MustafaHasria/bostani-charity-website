import { useState, useEffect, useMemo } from 'react';
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
        return Math.max(0, projects.length - visibleCards);
      }
      return Math.max(0, prevIndex - 1);
    });
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, projects.length - visibleCards);
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
          <Link to="/projects" className="view-all-link">
            {t('projects.viewAll')}
            {language === 'ar' ? ' ←' : ' →'}
          </Link>
        </div>
        <div className="projects-divider"></div>

        {/* Carousel */}
        <div className="projects-carousel">
          <button 
            className="carousel-btn carousel-btn-prev"
            onClick={goToPrevious}
            aria-label="Previous slide"
          >
            {language === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>

          <div className="projects-slider">
            <div 
              className="projects-track"
              style={{
                transform: language === 'ar' 
                  ? `translateX(${currentIndex * (100 / visibleCards)}%)`
                  : `translateX(-${currentIndex * (100 / visibleCards)}%)`,
                '--cards-per-view': visibleCards,
              }}
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

          <button 
            className="carousel-btn carousel-btn-next"
            onClick={goToNext}
            aria-label="Next slide"
          >
            {language === 'ar' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="projects-pagination">
          {Array.from({ length: Math.max(1, projects.length - visibleCards + 1) }).map((_, index) => (
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

export default Projects;


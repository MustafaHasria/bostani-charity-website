import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import './Projects.css';

const Projects = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  // بيانات المشاريع الوهمية (9 مشاريع لتكون 3 مجموعات)
  const projects = [
    {
      id: 1,
      title: t('projects.project1.title'),
      description: t('projects.project1.description'),
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
      paid: 1900,
      total: 7200,
      remaining: 5300,
    },
    {
      id: 2,
      title: t('projects.project1.title'),
      description: t('projects.project1.description'),
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
      paid: 1300,
      total: 6600,
      remaining: 5300,
    },
    {
      id: 3,
      title: t('projects.project2.title'),
      description: t('projects.project2.description'),
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
      paid: 5300,
      total: 10600,
      remaining: 5300,
    },
    {
      id: 4,
      title: t('projects.project1.title') + ' 2',
      description: t('projects.project1.description'),
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop',
      paid: 2100,
      total: 8000,
      remaining: 5900,
    },
    {
      id: 5,
      title: t('projects.project2.title') + ' 2',
      description: t('projects.project2.description'),
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
      paid: 4500,
      total: 9000,
      remaining: 4500,
    },
    {
      id: 6,
      title: t('projects.project1.title') + ' 3',
      description: t('projects.project1.description'),
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
      paid: 1800,
      total: 7000,
      remaining: 5200,
    },
    {
      id: 7,
      title: t('projects.project2.title') + ' 3',
      description: t('projects.project2.description'),
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
      paid: 3800,
      total: 7500,
      remaining: 3700,
    },
    {
      id: 8,
      title: t('projects.project1.title') + ' 4',
      description: t('projects.project1.description'),
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop',
      paid: 4900,
      total: 11000,
      remaining: 6100,
    },
    {
      id: 9,
      title: t('projects.project2.title') + ' 4',
      description: t('projects.project2.description'),
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
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

  const totalGroups = Math.ceil(projects.length / visibleCards);

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
                  ? `translateX(${currentIndex * 100}%)`
                  : `translateX(-${currentIndex * 100}%)`,
                '--cards-per-view': visibleCards,
              }}
            >
              {Array.from({ length: totalGroups }).map((_, groupIndex) => (
                <div 
                  key={groupIndex} 
                  className="projects-group"
                  style={{ '--cards-per-view': visibleCards }}
                >
                  {projects
                    .slice(groupIndex * visibleCards, (groupIndex + 1) * visibleCards)
                    .map((project) => (
                      <div key={project.id} className="project-card">
                        <div className="project-image">
                          <img src={project.image} alt={project.title} />
                        </div>
                        <div className="project-content">
                          <h3 className="project-title">{project.title}</h3>
                          <p className="project-description">{project.description}</p>
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
                          <Link to={`/projects/${project.id}`} className="project-btn">
                            {t('projects.project1.details')}
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
        <div className="projects-pagination">
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

export default Projects;


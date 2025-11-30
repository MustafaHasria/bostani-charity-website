import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import { useHomeData } from '../context/HomeDataContext';
import detailsIcon from '../assets/images/details-icon.png';
import '../components/Campaigns/Campaigns.css';
import './CampaignsPage.css';

// دالة لتقليل النص إلى 50 حرف مع إضافة "..."
const truncateDescription = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

const getProgressPercentage = (paid, total) =>
  Math.round((paid / total) * 100);

const ProjectsPage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { homeData, loading } = useHomeData();

  // استخراج الحملات من subcategory "مشاريع بستاني" (ID = 30)
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

  if (loading) {
    return (
      <section className="campaigns-page">
        <div className="campaigns-page-container">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <section className="campaigns-page">
        <div className="campaigns-page-container">
          <div className="campaigns-page-breadcrumb">
            {language === 'ar' ? (
              <>
                <Link to="/">{t('nav.home')}</Link>
                <span className="breadcrumb-separator">{'>'}</span>
                <span className="breadcrumb-current">
                  {t('nav.projects')}
                </span>
              </>
            ) : (
              <>
                <Link to="/">{t('nav.home')}</Link>
                <span className="breadcrumb-separator">{'>'}</span>
                <span className="breadcrumb-current">
                  {t('nav.projects')}
                </span>
              </>
            )}
          </div>

          <div className="campaigns-page-header">
            <h1 className="campaigns-page-title">{t('nav.projects')}</h1>
            <p className="campaigns-page-subtitle">
              {language === 'ar' 
                ? 'مشاريع تابعة للفئة الأب (مشاريع) لمنصة جمعية بستاني الخيرية'
                : 'Projects belonging to the parent category (Projects) for the Bustani Charity Association platform'}
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>{language === 'ar' ? 'لا توجد مشاريع متاحة' : 'No projects available'}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="campaigns-page">
      <div className="campaigns-page-container">
        <div className="campaigns-page-breadcrumb">
          {language === 'ar' ? (
            <>
              <Link to="/">{t('nav.home')}</Link>
              <span className="breadcrumb-separator">{'>'}</span>
              <span className="breadcrumb-current">
                {t('nav.projects')}
              </span>
            </>
          ) : (
            <>
              <Link to="/">{t('nav.home')}</Link>
              <span className="breadcrumb-separator">{'>'}</span>
              <span className="breadcrumb-current">
                {t('nav.projects')}
              </span>
            </>
          )}
        </div>

        <div className="campaigns-page-header">
          <h1 className="campaigns-page-title">{t('nav.projects')}</h1>
          <p className="campaigns-page-subtitle">
            {language === 'ar' 
              ? 'مشاريع تابعة للفئة الأب (مشاريع) لمنصة جمعية بستاني الخيرية'
              : 'Projects belonging to the parent category (Projects) for the Bustani Charity Association platform'}
          </p>
        </div>

        <div className="campaigns-page-grid">
          {projects.map((project) => (
            <div key={project.id} className="campaign-card">
              <div className="campaign-image">
                <img src={project.image} alt={project.title} />
                {project.categoryName && (
                  <div className="campaign-category-badge">
                    {project.categoryName}
                  </div>
                )}
              </div>
              <div className="campaign-content">
                <h3 className="campaign-title">{project.title || 'Untitled Project'}</h3>
                <p className="campaign-description">{truncateDescription(project.description || t('projects.project1.description'))}</p>
                <div className="campaign-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${getProgressPercentage(
                          project.paid,
                          project.total,
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="progress-info">
                    <span className="progress-paid">
                      {t('projects.project1.paid')}{' '}
                      {project.paid.toLocaleString()}
                    </span>
                    <span className="progress-remaining">
                      {t('projects.project1.remaining')}{' '}
                      {project.remaining.toLocaleString()}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/campaigns/${project.id}`}
                  className="campaign-btn"
                >
                  <span>{t('projects.project1.details')}</span>
                  <img src={detailsIcon} alt="" className="details-icon" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsPage;


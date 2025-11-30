import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import { useHomeData } from '../context/HomeDataContext';
import { fetchCampaigns } from '../services/api';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import detailsIcon from '../assets/images/details-icon.png';
import '../components/Campaigns/Campaigns.css';
import './CampaignsPage.css';

const getProgressPercentage = (paid, total) =>
  Math.round((paid / total) * 100);

const CampaignsPage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { homeData } = useHomeData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // قراءة category_id من URL query parameter
  const categoryIdFromUrl = searchParams.get('category_id');
  const initialTab = categoryIdFromUrl ? categoryIdFromUrl : 'all';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // تحديث activeTab عند تغيير category_id في URL
  useEffect(() => {
    if (categoryIdFromUrl) {
      setActiveTab(categoryIdFromUrl);
    } else {
      setActiveTab('all');
    }
  }, [categoryIdFromUrl]);

  // الحصول على اسم الفئة النشطة
  const getActiveCategoryName = () => {
    if (activeTab === 'all') {
      return t('campaigns.viewAll');
    }
    const category = homeData?.parent_categories?.find(
      (cat) => cat.id.toString() === activeTab
    );
    return category ? category.name : t('campaigns.viewAll');
  };

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.campaigns-page-dropdown-wrapper')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // جلب الحملات عند تغيير التبويب النشط فقط
  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const loadCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // تحديد category_id بناءً على activeTab للفلترة
        let categoryId = null;
        if (activeTab !== 'all') {
          // إذا كان activeTab رقم (ID الفئة) - استخدامه مباشرة للفلترة
          const tabId = parseInt(activeTab);
          if (!isNaN(tabId)) {
            categoryId = tabId;
          } else {
            // استخدام homeData من closure للبحث عن الفئة
            const currentHomeData = homeData;
            if (currentHomeData?.parent_categories) {
              const category = currentHomeData.parent_categories.find(
                (cat) => cat.id.toString() === activeTab || cat.name.toLowerCase().includes(activeTab.toLowerCase())
              );
              if (category) {
                categoryId = category.id;
              }
            }
          }
        }

        // جلب الحملات من API مع category_id للفلترة
        // إذا كان categoryId = null، يتم جلب جميع الحملات من /campaigns
        // إذا كان categoryId موجود، يتم جلب الحملات المفلترة من /campaigns?category_id={categoryId}
        const response = await fetchCampaigns(categoryId);
        
        if (!isMounted) return;
        
        // التحقق من بنية الاستجابة - دعم أشكال مختلفة من الاستجابة
        let campaignsData = null;
        
        if (response) {
          // إذا كانت الاستجابة تحتوي على success و data
          if (response.success && response.data && Array.isArray(response.data)) {
            campaignsData = response.data;
          }
          // إذا كانت الاستجابة مباشرة array
          else if (Array.isArray(response)) {
            campaignsData = response;
          }
          // إذا كانت الاستجابة تحتوي على data مباشرة
          else if (response.data && Array.isArray(response.data)) {
            campaignsData = response.data;
          }
        }
        
        if (campaignsData && campaignsData.length > 0) {
          // تحويل البيانات إلى الشكل المطلوب
          // استخدام fallback للوصف بدلاً من t() لتجنب dependency
          const currentLanguage = language; // استخدام قيمة محلية
          const defaultDescription = currentLanguage === 'ar' 
            ? 'حملة خيرية لدعم المحتاجين' 
            : 'Charity campaign to support those in need';
          
          // إنشاء خريطة للفئات من homeData
          const categoriesMap = new Map();
          if (homeData?.parent_categories) {
            homeData.parent_categories.forEach((cat) => {
              categoriesMap.set(cat.id, cat.name);
            });
          }
          
          // إنشاء خريطة للفئات الفرعية
          const subcategoriesMap = new Map();
          const campaignToSubcategoryMap = new Map(); // خريطة لربط الحملة بـ subcategory
          if (homeData?.subcategories?.data) {
            homeData.subcategories.data.forEach((subcat) => {
              subcategoriesMap.set(subcat.id, subcat.name);
              // ربط الحملات بـ subcategory
              if (subcat.campaigns && Array.isArray(subcat.campaigns)) {
                subcat.campaigns.forEach((camp) => {
                  campaignToSubcategoryMap.set(camp.id, subcat);
                });
              }
            });
          }
          
          const formattedCampaigns = campaignsData.map((campaign) => {
            // البحث عن اسم الفئة - البحث في subcategories أولاً ثم parent_categories
            let categoryName = null;
            if (campaign.category_id) {
              // البحث في الفئات الفرعية أولاً
              categoryName = subcategoriesMap.get(campaign.category_id);
              // إذا لم تجد، ابحث في الفئات الرئيسية
              if (!categoryName) {
                categoryName = categoriesMap.get(campaign.category_id);
              }
            }
            // إذا لم تجد من category_id، ابحث في subcategory التي تحتوي على الحملة
            if (!categoryName) {
              const subcategory = campaignToSubcategoryMap.get(campaign.id);
              if (subcategory) {
                categoryName = subcategory.name;
              }
            }
            
            return {
              id: campaign.id,
              title: campaign.title || campaign.name || 'Untitled Campaign',
              description: campaign.description || defaultDescription,
              image: campaign.image || 'https://images.unsplash.com/photo-1606914509765-1477099e4315?w=400&h=300&fit=crop',
              paid: campaign.collected_amount || 0,
              total: campaign.goal_amount || 0,
              remaining: Math.max(0, (campaign.goal_amount || 0) - (campaign.collected_amount || 0)),
              categoryName: categoryName || null,
            };
          });
          
          setCampaigns(formattedCampaigns);
        } else {
          // لا توجد حملات
          setCampaigns([]);
        }
      } catch (err) {
        if (!isMounted) return;
        
        console.error('Error loading campaigns:', err);
        
        // معالجة خطأ 429 (Too Many Requests)
        const currentLanguage = language; // استخدام قيمة محلية
        if (err.message && err.message.includes('429')) {
          setError(currentLanguage === 'ar' 
            ? 'تم تجاوز عدد الطلبات المسموح به. يرجى المحاولة مرة أخرى بعد قليل.' 
            : 'Too many requests. Please try again later.');
        } else {
          setError(err.message || (currentLanguage === 'ar' ? 'فشل تحميل الحملات' : 'Failed to load campaigns'));
        }
        setCampaigns([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // جلب الحملات مباشرة عند تغيير activeTab (بدون debounce لتسريع الاستجابة)
    loadCampaigns();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [activeTab]); // يعتمد فقط على activeTab - عند تغييره يتم جلب الحملات المفلترة

  return (
    <section className="campaigns-page">
      <div className="campaigns-page-container">
        <div className="campaigns-page-breadcrumb">
          {language === 'ar' ? (
            <>
              <Link to="/">{t('nav.home')}</Link>
              <span className="breadcrumb-separator">{'>'}</span>
              <span className="breadcrumb-current">
                {t('campaignsPage.title')}
              </span>
            </>
          ) : (
            <>
              <Link to="/">{t('nav.home')}</Link>
              <span className="breadcrumb-separator">{'>'}</span>
              <span className="breadcrumb-current">
                {t('campaignsPage.title')}
              </span>
            </>
          )}
        </div>

        <div className="campaigns-page-header">
          <h1 className="campaigns-page-title">{t('campaignsPage.title')}</h1>
          <p className="campaigns-page-subtitle">
            {t('campaignsPage.subtitle')}
          </p>
        </div>

        <div className="campaigns-page-filters">
          {/* Desktop Dropdown */}
          <div className="campaigns-page-dropdown-wrapper">
            <button 
              className="campaigns-page-dropdown-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              type="button"
            >
              <span className="dropdown-btn-text">{getActiveCategoryName()}</span>
              {isDropdownOpen ? (
                <ChevronUp size={20} className="dropdown-icon" />
              ) : (
                <ChevronDown size={20} className="dropdown-icon" />
              )}
            </button>
            
            {/* Dropdown Menu */}
            <div className={`campaigns-page-dropdown-menu ${isDropdownOpen ? 'open' : ''}`}>
              <button 
                className={`campaigns-page-dropdown-item ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('all');
                  setSearchParams({}); // إزالة query parameters
                  setIsDropdownOpen(false);
                }}
                type="button"
              >
                {t('campaigns.viewAll')}
              </button>
              {homeData?.parent_categories?.map((category) => (
                <button 
                  key={category.id}
                  className={`campaigns-page-dropdown-item ${activeTab === category.id.toString() ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(category.id.toString());
                    setSearchParams({ category_id: category.id.toString() }); // تحديث URL
                    setIsDropdownOpen(false);
                  }}
                  type="button"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="campaigns-page-mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            <span>{getActiveCategoryName()}</span>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`campaigns-page-mobile-menu ${isMenuOpen ? 'open' : ''}`}>
            <button 
              className={`campaigns-page-mobile-menu-item ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('all');
                setSearchParams({}); // إزالة query parameters
                setIsMenuOpen(false);
              }}
            >
              {t('campaigns.viewAll')}
            </button>
            {homeData?.parent_categories?.map((category) => (
              <button 
                key={category.id}
                className={`campaigns-page-mobile-menu-item ${activeTab === category.id.toString() ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(category.id.toString());
                  setSearchParams({ category_id: category.id.toString() }); // تحديث URL
                  setIsMenuOpen(false);
                }}
              >
                {category.name}
              </button>
            ))}
          </div>

        {loading ? (
          <div className="campaigns-page-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="campaign-card campaign-skeleton">
                <div className="campaign-image skeleton-image"></div>
                <div className="campaign-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-description"></div>
                  <div className="skeleton-description short"></div>
                  <div className="campaign-progress">
                    <div className="progress-bar skeleton-progress-bar">
                      <div className="skeleton-progress-fill"></div>
                    </div>
                    <div className="progress-info">
                      <div className="skeleton-text"></div>
                      <div className="skeleton-text"></div>
                    </div>
                  </div>
                  <div className="skeleton-button"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'red' }}>
              {language === 'ar' ? 'حدث خطأ أثناء تحميل الحملات' : 'Error loading campaigns'}
            </p>
            <p style={{ color: 'red', marginTop: '0.5rem', fontSize: '0.85rem' }}>
              {error}
            </p>
          </div>
        ) : campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>{language === 'ar' ? 'لا توجد حملات متاحة' : 'No campaigns available'}</p>
          </div>
        ) : (
          <div className="campaigns-page-grid">
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
                <h3 className="campaign-title">{campaign.title || 'Untitled Campaign'}</h3>
                <p className="campaign-description">{campaign.description || t('campaigns.campaign1.description')}</p>
                <div className="campaign-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${getProgressPercentage(
                          campaign.paid,
                          campaign.total,
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="progress-info">
                    <span className="progress-paid">
                      {t('campaigns.campaign1.paid')}{' '}
                      {campaign.paid.toLocaleString()}
                    </span>
                    <span className="progress-remaining">
                      {t('campaigns.campaign1.remaining')}{' '}
                      {campaign.remaining.toLocaleString()}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/campaigns/${campaign.id}`}
                  className="campaign-btn"
                >
                  <span>{t('campaigns.campaign1.details')}</span>
                  <img src={detailsIcon} alt="" className="details-icon" />
                </Link>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CampaignsPage;



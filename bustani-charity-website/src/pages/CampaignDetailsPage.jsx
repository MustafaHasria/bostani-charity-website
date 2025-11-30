import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useHomeData } from '../context/HomeDataContext';
import { fetchCampaignDetails } from '../services/api';
import { Share2, Heart, MessageCircle } from 'lucide-react';
import logoLight from '../assets/images/boostani_logo_light.png';
import logoDark from '../assets/images/boostani_logo_dark.png';
import infoCircleIcon from '../assets/images/Info Circle.png';
import documentTextIcon from '../assets/images/Document Text.png';
import handHeartIcon from '../assets/images/Hand Heart.png';
import menuBoardIcon from '../assets/images/menu-board.png';
import './CampaignDetailsPage.css';

const CampaignDetailsPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { isDarkMode } = useTheme();
  const { homeData } = useHomeData();
  const [activeTab, setActiveTab] = useState('overview');
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCopyToast, setShowCopyToast] = useState(false);

  // جلب بيانات الحملة من API
  useEffect(() => {
    let isMounted = true;

    const loadCampaignDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await fetchCampaignDetails(id, 1, 10);
        
        if (!isMounted) return;

        if (response.success && response.data) {
          setCampaignData(response.data);
        } else {
          setError(language === 'ar' ? 'فشل تحميل بيانات الحملة' : 'Failed to load campaign data');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error loading campaign details:', err);
        setError(err.message || (language === 'ar' ? 'حدث خطأ أثناء تحميل بيانات الحملة' : 'Error loading campaign details'));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCampaignDetails();

    return () => {
      isMounted = false;
    };
  }, [id, language]);

  // الحصول على اسم الفئة
  const getCategoryName = () => {
    if (!campaignData?.category_id || !homeData?.parent_categories) {
      return '';
    }
    const category = homeData.parent_categories.find(
      (cat) => cat.id === campaignData.category_id
    );
    return category ? category.name : '';
  };

  // بيانات الحملة من API أو قيم افتراضية
  const campaign = campaignData ? {
    id: campaignData.id,
    title: campaignData.title || t('campaigns.campaign1.title'),
    image: campaignData.media?.featured_image || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=600&fit=crop',
    paid: campaignData.collected?.decimal || 0,
    total: campaignData.goal?.decimal || 0,
    remaining: campaignData.progress?.remaining?.decimal || 0,
    campaignNumber: campaignData.id,
    description: campaignData.description || '',
    categoryName: getCategoryName(),
    status: campaignData.status || 'active',
    startsAt: campaignData.starts_at || '',
    closedAt: campaignData.closed_at || null,
  } : {
    id: id || '1',
    title: t('campaigns.campaign1.title'),
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=600&fit=crop',
    paid: 0,
    total: 0,
    remaining: 0,
    campaignNumber: id || '1',
    description: '',
    categoryName: '',
    status: 'active',
    startsAt: '',
    closedAt: null,
  };

  const getProgressPercentage = (paid, total) => {
    if (!total || total === 0) return 0;
    return Math.round((paid / total) * 100);
  };

  const logo = isDarkMode ? logoDark : logoLight;

  // دالة لنسخ رابط الصفحة
  const handleShare = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      
      // إظهار النافذة المنبثقة
      setShowCopyToast(true);
      
      // إخفاء النافذة المنبثقة بعد 3 ثوان
      setTimeout(() => {
        setShowCopyToast(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback للأنظمة القديمة
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setShowCopyToast(true);
        setTimeout(() => {
          setShowCopyToast(false);
        }, 3000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="campaign-details-page">
        <div className="campaign-details-container">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        </div>
      </div>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <div className="campaign-details-page">
        <div className="campaign-details-container">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'red' }}>
              {language === 'ar' ? 'حدث خطأ أثناء تحميل بيانات الحملة' : 'Error loading campaign data'}
            </p>
            <p style={{ color: 'red', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              {error}
            </p>
            <Link to="/campaigns" style={{ marginTop: '1rem', display: 'inline-block', color: '#047d3f' }}>
              {language === 'ar' ? 'العودة إلى صفحة الحملات' : 'Back to Campaigns'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // بيانات التبويبات من API
  const overviewData = {
    objectives: [], // يمكن إضافتها لاحقاً إذا كانت متوفرة في API
    targetGroups: [] // يمكن إضافتها لاحقاً إذا كانت متوفرة في API
  };

  // دالة لتنسيق التاريخ بالتقويم الميلادي
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    if (language === 'ar') {
      // استخدام 'ar-EG' التي تستخدم التقويم الميلادي افتراضياً
      // أو استخدام 'en-US' مع ترجمة يدوية للأشهر
      const months = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // دالة لتنسيق التاريخ بشكل مختصر (يوم/شهر/سنة)
  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    if (language === 'ar') {
      // تنسيق يدوي بالتقويم الميلادي: يوم/شهر/سنة
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  };

  const detailsData = {
    description: campaignData?.description || (language === 'ar' 
      ? 'لا يوجد وصف متاح لهذه الحملة'
      : 'No description available for this campaign'),
    startDate: campaignData?.starts_at ? formatDate(campaignData.starts_at) : '',
    endDate: campaignData?.closed_at ? formatDate(campaignData.closed_at) : (language === 'ar' ? 'مستمرة' : 'Ongoing'),
    location: '', // يمكن إضافتها لاحقاً إذا كانت متوفرة في API
    beneficiaries: '', // يمكن إضافتها لاحقاً إذا كانت متوفرة في API
    partners: [], // يمكن إضافتها لاحقاً إذا كانت متوفرة في API
    requirements: [] // يمكن إضافتها لاحقاً إذا كانت متوفرة في API
  };

  // التبرعات من API
  const donations = campaignData?.contributions?.data?.map((contribution, index) => ({
    id: contribution.id,
    donorName: contribution.is_anonymous 
      ? (language === 'ar' ? 'متبرع مجهول' : 'Anonymous Donor')
      : (contribution.donor_name || (language === 'ar' ? 'متبرع' : 'Donor')),
    donorNumber: contribution.id,
    amount: contribution.amount_usd || contribution.amount || 0,
    email: contribution.donor_email || '',
    date: contribution.paid_at ? formatDateShort(contribution.paid_at) : '',
    type: contribution.type || 'one_time',
    currency: contribution.currency || 'USD'
  })) || [];

  // التعليقات من API
  const comments = campaignData?.comments?.data?.map((comment) => ({
    id: comment.id,
    author: comment.author_name || (language === 'ar' ? 'مستخدم' : 'User'),
    avatar: '👤',
    text: comment.text || comment.content || '',
    date: comment.created_at ? formatDateShort(comment.created_at) : '',
    likes: comment.likes_count || 0
  })) || [];

  // دالة لعرض محتوى التبويب النشط
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content-overview">
            {overviewData.objectives.length > 0 && (
              <div className="overview-section">
                <h3 className="overview-title">{language === 'ar' ? 'أهداف الحملة' : 'Campaign Objectives'}</h3>
                <ul className="overview-list">
                  {overviewData.objectives.map((objective, index) => (
                    <li key={index} className="overview-list-item">
                      <span className="list-bullet">•</span>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {overviewData.targetGroups.length > 0 && (
              <div className="overview-section">
                <h3 className="overview-title">{language === 'ar' ? 'الفئات المستهدفة' : 'Target Groups'}</h3>
                <div className="target-groups">
                  {overviewData.targetGroups.map((group, index) => (
                    <span key={index} className="target-group-tag">{group}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'details':
        if (!detailsData.description && !detailsData.startDate && !detailsData.endDate && !detailsData.location && detailsData.partners.length === 0 && detailsData.requirements.length === 0) {
          return (
            <div className="no-data-message">
              <div className="no-data-icon">📭</div>
              <p className="no-data-text">{t('campaignDetails.noData.details')}</p>
            </div>
          );
        }
        return (
          <div className="tab-content-details">
            {detailsData.description && (
              <div className="details-section">
                <h3 className="details-section-title">{language === 'ar' ? 'وصف الحملة' : 'Campaign Description'}</h3>
                <p className="details-description">{detailsData.description}</p>
              </div>
            )}
            <div className="details-grid">
              {detailsData.startDate && (
                <div className="detail-item">
                  <span className="detail-label">{language === 'ar' ? 'تاريخ البدء' : 'Start Date'}:</span>
                  <span className="detail-value">{detailsData.startDate}</span>
                </div>
              )}
              {detailsData.endDate && (
                <div className="detail-item">
                  <span className="detail-label">{language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}:</span>
                  <span className="detail-value">{detailsData.endDate}</span>
                </div>
              )}
              {detailsData.location && (
                <div className="detail-item">
                  <span className="detail-label">{language === 'ar' ? 'الموقع' : 'Location'}:</span>
                  <span className="detail-value">{detailsData.location}</span>
                </div>
              )}
              {detailsData.beneficiaries && (
                <div className="detail-item">
                  <span className="detail-label">{language === 'ar' ? 'عدد المستفيدين' : 'Beneficiaries'}:</span>
                  <span className="detail-value">{detailsData.beneficiaries}</span>
                </div>
              )}
            </div>
            {detailsData.partners.length > 0 && (
              <div className="details-section">
                <h3 className="details-section-title">{language === 'ar' ? 'الشركاء' : 'Partners'}</h3>
                <ul className="details-list">
                  {detailsData.partners.map((partner, index) => (
                    <li key={index} className="details-list-item">
                      <span className="list-bullet">•</span>
                      {partner}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {detailsData.requirements.length > 0 && (
              <div className="details-section">
                <h3 className="details-section-title">{language === 'ar' ? 'المتطلبات' : 'Requirements'}</h3>
                <ul className="details-list">
                  {detailsData.requirements.map((requirement, index) => (
                    <li key={index} className="details-list-item">
                      <span className="list-bullet">•</span>
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'donations':
        if (donations.length === 0) {
          return (
            <div className="no-data-message">
              <div className="no-data-icon">📭</div>
              <p className="no-data-text">{t('campaignDetails.noData.donations')}</p>
            </div>
          );
        }
        return (
          <div className="donations-grid">
            {donations.map((donation) => (
              <div key={donation.id} className="donation-card">
                <div className="donation-card-top">
                  <div className="donation-field">
                    <span className="donation-label">{t('campaignDetails.donations.donorName')}:</span>
                    <span className="donation-value">{donation.donorName}</span>
                  </div>
                  <div className="donation-field">
                    <span className="donation-label">{t('campaignDetails.donations.donorNumber')}:</span>
                    <span className="donation-value">{donation.donorNumber}</span>
                  </div>
                </div>
                <div className="donation-card-divider"></div>
                <div className="donation-card-bottom">
                  <div className="donation-field">
                    <span className="donation-label">{t('campaignDetails.donations.amount')}:</span>
                    <span className="donation-value">${donation.amount.toLocaleString()}</span>
                  </div>
                  {donation.email && (
                    <div className="donation-field">
                      <span className="donation-label">{t('campaignDetails.donations.email')}:</span>
                      <span className="donation-value">{donation.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'comments':
        if (comments.length === 0) {
          return (
            <div className="no-data-message">
              <div className="no-data-icon">📭</div>
              <p className="no-data-text">{t('campaignDetails.noData.comments')}</p>
            </div>
          );
        }
        return (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <div className="comment-avatar">{comment.avatar}</div>
                  <div className="comment-author-info">
                    <span className="comment-author">{comment.author}</span>
                    <span className="comment-date">{comment.date}</span>
                  </div>
                </div>
                <p className="comment-text">{comment.text}</p>
                <div className="comment-footer">
                  <button className="comment-like-btn">
                    <Heart size={16} />
                    <span>{comment.likes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="campaign-details-page">
      <div className="campaign-details-container">
        {/* Breadcrumb */}
        <div className="campaign-details-breadcrumb">
          {language === 'ar' ? (
            <>
              <span className="breadcrumb-current">{campaign.title}</span>
              <span className="breadcrumb-separator">{'>'}</span>
              <Link to="/campaigns">{t('campaigns.viewAll')}</Link>
              <span className="breadcrumb-separator">{'>'}</span>
              <Link to="/">{t('nav.home')}</Link>
            </>
          ) : (
            <>
              <Link to="/">{t('nav.home')}</Link>
              <span className="breadcrumb-separator">{'>'}</span>
              <Link to="/campaigns">{t('campaigns.viewAll')}</Link>
              <span className="breadcrumb-separator">{'>'}</span>
              <span className="breadcrumb-current">{campaign.title}</span>
            </>
          )}
        </div>

        {/* Main Image */}
        <div className="campaign-details-image">
          {campaign.categoryName && (
            <div className="campaign-category-badge">
              {campaign.categoryName}
            </div>
          )}
          <img src={campaign.image} alt={campaign.title} />
        </div>

        {/* Campaign Header */}
        <div className="campaign-details-header">
          <div className="campaign-details-title-section">
            <h1 className="campaign-details-title">{campaign.title}</h1>
            <div className="campaign-details-logo">
              <img src={logo} alt="Bustani" />
            </div>
          </div>
          <div className="campaign-details-required">
            <span className="required-label">{t('campaignDetails.required')}:</span>
            <span className="required-amount">
              {campaignData?.goal?.formatted || `${campaign.total.toLocaleString()}$`}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="campaign-details-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${getProgressPercentage(campaign.paid, campaign.total)}%` }}
            ></div>
          </div>
          <div className="progress-info">
            <span className="progress-paid">
              {t('campaigns.campaign1.paid')} {campaignData?.collected?.formatted || `${campaign.paid.toLocaleString()}$`}
            </span>
            <span className="progress-remaining">
              {t('campaigns.campaign1.remaining')} {campaignData?.progress?.remaining?.formatted || `${campaign.remaining.toLocaleString()}$`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="campaign-details-actions">
          <button className="campaign-donate-btn">
            {t('campaignDetails.donate')}
          </button>
          <button className="campaign-action-btn" onClick={handleShare}>
            <Share2 size={18} />
            <span>{t('campaignDetails.share')}</span>
          </button>
          <button className="campaign-action-btn campaign-action-btn-icon-only campaign-comment-btn">
            <MessageCircle size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="campaign-details-tabs">
          <button
            className={`campaign-details-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <img src={infoCircleIcon} alt="" className="tab-icon" />
            {activeTab === 'overview' && <span className="tab-indicator-circle"></span>}
            {t('campaignDetails.tabs.overview')}
          </button>
          <button
            className={`campaign-details-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <img src={documentTextIcon} alt="" className="tab-icon" />
            {t('campaignDetails.tabs.details')}
          </button>
          <button
            className={`campaign-details-tab ${activeTab === 'donations' ? 'active' : ''}`}
            onClick={() => setActiveTab('donations')}
          >
            <img src={handHeartIcon} alt="" className="tab-icon" />
            {t('campaignDetails.tabs.donations')}
          </button>
          <button
            className={`campaign-details-tab ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            <img src={menuBoardIcon} alt="" className="tab-icon" />
            {t('campaignDetails.tabs.comments')}
          </button>
        </div>

        {/* Tab Content */}
        <div className="campaign-tab-content">
          {renderTabContent()}
        </div>

        {/* Metadata Section */}
        <div className="campaign-details-metadata">
          <div className="metadata-item">
            <span className="metadata-label">
              {t('campaignDetails.metadata.campaignNumber')}:
            </span>
            <span className="metadata-value">{campaign.campaignNumber}</span>
          </div>
          {campaign.categoryName && (
            <div className="metadata-item">
              <span className="metadata-label">
                {t('campaignDetails.metadata.category')}:
              </span>
              <span className="metadata-value">
                {campaign.categoryName}
              </span>
            </div>
          )}
          <div className="metadata-item">
            <span className="metadata-label">
              {t('campaignDetails.metadata.responsibleSection')}:
            </span>
            <span className="metadata-value">
              {t('campaignDetails.responsibleSectionValue')}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">
              {t('campaignDetails.metadata.currentStatus')}:
            </span>
            <span className="metadata-value">
              {campaignData?.status || t('campaignDetails.currentStatusValue')}
            </span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showCopyToast && (
        <div className="copy-toast">
          <div className="copy-toast-content">
            <span className="copy-toast-icon">✓</span>
            <span className="copy-toast-message">
              {language === 'ar' 
                ? `تم نسخ رابط حملة "${campaign.title}" بنجاح`
                : `Link for campaign "${campaign.title}" copied successfully`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetailsPage;


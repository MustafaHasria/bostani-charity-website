import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import './ZakatResultModal.css';

const ZakatResultModal = ({ isOpen, onClose, calculation, assets }) => {
  const { t } = useTranslation();

  // إغلاق النافذة عند الضغط على ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27 && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      // إعادة التمرير بعد إغلاق النافذة
      document.body.style.removeProperty('overflow');
    };
  }, [isOpen, onClose]);

  if (!isOpen || !calculation) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="zakat-result-modal-overlay" onClick={handleOverlayClick}>
      <div className="zakat-result-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="zakat-result-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="zakat-result-modal-title">
          {t('zakatResult.title')}
        </h2>

        {/* Assets Summary */}
        <div className="zakat-result-assets-summary">
          <div className="zakat-result-summary-row">
            <span className="zakat-result-summary-label">
              {t('zakatResult.totalAssets')}:
            </span>
            <span className="zakat-result-summary-value">
              {assets.length}
            </span>
          </div>
          <div className="zakat-result-summary-row">
            <span className="zakat-result-summary-label">
              {t('zakatResult.totalValue')}:
            </span>
            <span className="zakat-result-summary-value">
              ${calculation.totalValue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Nisab Status */}
        {calculation.meetsNisab ? (
          <div className="zakat-result-nisab-status nisab-met">
            <div className="nisab-status-icon">✓</div>
            <div className="nisab-status-text">
              <strong>{t('zakatResult.nisabMet')}</strong>
              <span>{t('zakatResult.nisabMetDesc')}</span>
            </div>
          </div>
        ) : (
          <div className="zakat-result-nisab-status nisab-not-met">
            <div className="nisab-status-icon">!</div>
            <div className="nisab-status-text">
              <strong>{t('zakatResult.nisabNotMet')}</strong>
              <span>{t('zakatResult.nisabNotMetDesc')}</span>
            </div>
          </div>
        )}

        {/* Zakat Amount */}
        {calculation.meetsNisab && (
          <div className="zakat-result-amount-section">
            <div className="zakat-result-amount-label">
              {t('zakatResult.zakatAmount')}
            </div>
            <div className="zakat-result-amount-value">
              ${calculation.zakatAmount.toFixed(2)}
            </div>
            <div className="zakat-result-amount-note">
              {t('zakatResult.zakatNote')}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="zakat-result-actions">
          <button
            className="zakat-result-close-button"
            onClick={onClose}
          >
            {t('zakatResult.close')}
          </button>
          {calculation.meetsNisab && (
            <button
              className="zakat-result-donate-button"
              onClick={() => {
                // يمكن إضافة منطق التبرع هنا
                console.log('Donate Zakat:', calculation.zakatAmount);
                onClose();
              }}
            >
              {t('zakatResult.donateNow')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZakatResultModal;


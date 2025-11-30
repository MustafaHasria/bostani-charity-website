import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import dollarCircleIcon from '../../assets/images/dollar-circle.png';
import './ManualZakatModal.css';

const ManualZakatModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [zakatAmount, setZakatAmount] = useState('');

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
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAdd = () => {
    // منطق إضافة مبلغ الزكاة
    console.log('Adding Zakat amount:', zakatAmount);
    // يمكن إضافة منطق الإرسال هنا
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="manual-zakat-modal-overlay" onClick={handleOverlayClick}>
      <div className="manual-zakat-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="manual-zakat-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="manual-zakat-modal-title">
          {t('manualZakat.title')}
        </h2>

        {/* Form */}
        <div className="manual-zakat-modal-form">
          {/* Zakat Amount */}
          <div className="manual-zakat-form-group">
            <div className="manual-zakat-input-wrapper">
              <input
                type="number"
                className="manual-zakat-input"
                placeholder={t('manualZakat.placeholder')}
                value={zakatAmount}
                onChange={(e) => setZakatAmount(e.target.value)}
              />
              <div className="manual-zakat-currency-icon">
                <img src={dollarCircleIcon} alt="Dollar" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <button
          className="manual-zakat-submit-button"
          onClick={handleAdd}
        >
          {t('manualZakat.addButton')}
        </button>
      </div>
    </div>
  );
};

export default ManualZakatModal;


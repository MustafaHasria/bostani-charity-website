import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../context/LanguageContext';
import './QuickDonationModal.css';

const QuickDonationModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [donationType, setDonationType] = useState('general');
  const [frequency, setFrequency] = useState('one-time');
  const [selectedAmount, setSelectedAmount] = useState('5');
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // إغلاق النافذة عند الضغط على ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27 && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // منع التمرير في الخلفية
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = () => {
      if (showTypeDropdown) {
        setShowTypeDropdown(false);
      }
    };

    if (showTypeDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showTypeDropdown]);

  if (!isOpen) return null;

  const donationAmounts = ['25', '10', '5', '100', '50'];
  const frequencies = [
    { value: 'monthly', key: 'monthly' },
    { value: 'weekly', key: 'weekly' },
    { value: 'one-time', key: 'oneTime' }
  ];

  const getCurrentAmount = () => {
    if (showCustomInput) {
      return customAmount;
    }
    return selectedAmount;
  };

  const handleAmountClick = (amount) => {
    if (amount === 'custom') {
      setShowCustomInput(true);
      setSelectedAmount('');
    } else {
      setShowCustomInput(false);
      setSelectedAmount(amount);
      setCustomAmount('');
    }
  };

  const handleProceedPayment = () => {
    const amount = getCurrentAmount();
    if (!amount || amount === '') return;
    
    // هنا يمكن إضافة منطق الدفع
    console.log('Proceeding with payment:', {
      type: donationType,
      frequency,
      amount
    });
    
    // يمكن إغلاق النافذة أو الانتقال إلى صفحة الدفع
    // onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const currentAmount = getCurrentAmount();
  const displayAmount = currentAmount ? `$${currentAmount}` : '';

  return (
    <div className="quick-donation-modal-overlay" onClick={handleBackdropClick}>
      <div className="quick-donation-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="modal-title">{t('quickDonation.title')}</h2>

        {/* Donation Type Selection */}
        <div className="modal-section">
          <label className="modal-label">{t('quickDonation.selectType')}</label>
          <div className="modal-dropdown-wrapper">
            <button
              className="modal-dropdown"
              onClick={(e) => {
                e.stopPropagation();
                setShowTypeDropdown(!showTypeDropdown);
              }}
            >
              <span>{t(`quickDonation.types.${donationType}`)}</span>
              <ChevronDown 
                size={20} 
                className={`dropdown-icon ${showTypeDropdown ? 'open' : ''}`}
              />
            </button>
            {showTypeDropdown && (
              <div className="modal-dropdown-menu">
                <button
                  className="modal-dropdown-item"
                  onClick={() => {
                    setDonationType('general');
                    setShowTypeDropdown(false);
                  }}
                >
                  {t('quickDonation.types.general')}
                </button>
                {/* يمكن إضافة أنواع أخرى هنا */}
              </div>
            )}
          </div>
        </div>

        {/* Frequency Selection */}
        <div className="modal-section">
          <div className="frequency-buttons">
            {frequencies.map((freq) => (
              <button
                key={freq.value}
                className={`frequency-btn ${frequency === freq.value ? 'active' : ''}`}
                onClick={() => setFrequency(freq.value)}
              >
                {t(`quickDonation.frequencies.${freq.key}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Selection */}
        <div className="modal-section">
          <div className="amount-grid">
            {donationAmounts.map((amount) => (
              <button
                key={amount}
                className={`amount-btn ${selectedAmount === amount ? 'active' : ''}`}
                onClick={() => handleAmountClick(amount)}
              >
                ${amount}
              </button>
            ))}
            <button
              className={`amount-btn ${showCustomInput ? 'active' : ''}`}
              onClick={() => handleAmountClick('custom')}
            >
              {t('quickDonation.customAmount')}
            </button>
          </div>
          {showCustomInput && (
            <input
              type="number"
              className="custom-amount-input"
              placeholder={t('quickDonation.enterAmount')}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min="1"
              step="1"
            />
          )}
        </div>

        {/* Proceed Payment Button */}
        <button
          className="proceed-payment-btn"
          onClick={handleProceedPayment}
          disabled={!currentAmount || currentAmount === ''}
        >
          {displayAmount ? t('quickDonation.proceedPayment', { amount: displayAmount }) : t('quickDonation.selectAmount')}
        </button>
      </div>
    </div>
  );
};

export default QuickDonationModal;


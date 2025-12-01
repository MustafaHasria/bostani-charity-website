import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [amountError, setAmountError] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    // الانتظار حتى تنتهي animation قبل إغلاق النافذة
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // نفس مدة animation
  }, [onClose]);

  // إعادة تعيين حالة الإغلاق عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  // إغلاق النافذة عند الضغط على ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27 && isOpen && !isClosing) {
        handleClose();
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
  }, [isOpen, isClosing, handleClose]);

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

  if (!isOpen && !isClosing) return null;

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

  const isValidAmount = (amount) => {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount >= 5;
  };

  const handleAmountClick = (amount) => {
    if (amount === 'custom') {
      setShowCustomInput(true);
      setSelectedAmount('');
      setCustomAmount('');
      setAmountError('');
    } else {
      setShowCustomInput(false);
      setSelectedAmount(amount);
      setCustomAmount('');
      setAmountError('');
    }
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    
    if (value === '') {
      setAmountError('');
    } else {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        setAmountError(t('quickDonation.errors.enterValidNumber'));
      } else if (numValue < 5) {
        setAmountError(t('quickDonation.errors.minimumAmount'));
      } else {
        setAmountError('');
      }
    }
  };

  const handleProceedPayment = () => {
    const amount = getCurrentAmount();
    if (!amount || amount === '' || !isValidAmount(amount)) {
      if (showCustomInput && (!amount || amount === '')) {
        setAmountError(t('quickDonation.errors.enterDonationAmount'));
      } else if (showCustomInput && !isValidAmount(amount)) {
        setAmountError(t('quickDonation.errors.minimumAmount'));
      }
      return;
    }
    
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
    if (e.target === e.currentTarget && !isClosing) {
      handleClose();
    }
  };

  const currentAmount = getCurrentAmount();
  const displayAmount = currentAmount ? `$${currentAmount}` : '';
  const isAmountValid = currentAmount && isValidAmount(currentAmount);

  // استخدام Portal لنقل النافذة مباشرة إلى body
  return createPortal(
    <div className={`quick-donation-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleBackdropClick}>
      <div className={`quick-donation-modal ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={handleClose} aria-label="Close">
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
            <>
              <input
                type="number"
                className={`custom-amount-input ${amountError ? 'error' : ''}`}
                placeholder={t('quickDonation.enterAmount')}
                value={customAmount}
                onChange={handleCustomAmountChange}
                min="5"
                step="1"
              />
              {amountError && (
                <span className="amount-error-message">{amountError}</span>
              )}
            </>
          )}
        </div>

        {/* Proceed Payment Button */}
        <button
          className="proceed-payment-btn"
          onClick={handleProceedPayment}
          disabled={!currentAmount || currentAmount === '' || !isAmountValid}
        >
          {displayAmount && isAmountValid ? t('quickDonation.proceedPayment', { amount: displayAmount }) : t('quickDonation.selectAmount')}
        </button>
      </div>
    </div>,
    document.body
  );
};

export default QuickDonationModal;


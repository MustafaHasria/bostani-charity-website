import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import dollarCircleIcon from '../../assets/images/dollar-circle.png';
import './AddAssetModal.css';

const AddAssetModal = ({ isOpen, onClose, onAddAsset }) => {
  const { t } = useTranslation();
  const [assetClassification, setAssetClassification] = useState('cash');
  const [assetValue, setAssetValue] = useState('');
  const [weight, setWeight] = useState(''); // للذهب والفضة
  const [pricePerGram, setPricePerGram] = useState(''); // سعر الجرام
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  if (!isOpen) return null;

  const assetTypes = [
    { value: 'cash', label: t('addAsset.types.cash') },
    { value: 'gold', label: t('addAsset.types.gold') },
    { value: 'silver', label: t('addAsset.types.silver') },
    { value: 'stocks', label: t('addAsset.types.stocks') },
    { value: 'business', label: t('addAsset.types.business') },
  ];

  const selectedType = assetTypes.find(type => type.value === assetClassification);

  const handleAdd = () => {
    let asset = {
      type: assetClassification,
      value: 0,
      weight: null,
      pricePerGram: null,
    };

    if (assetClassification === 'gold' || assetClassification === 'silver') {
      const weightNum = parseFloat(weight);
      const priceNum = parseFloat(pricePerGram);
      if (!weightNum || !priceNum) return;
      asset.weight = weightNum;
      asset.pricePerGram = priceNum;
      asset.value = weightNum * priceNum;
    } else {
      const valueNum = parseFloat(assetValue);
      if (!valueNum) return;
      asset.value = valueNum;
    }

    if (onAddAsset) {
      onAddAsset(asset);
    }
    
    // إعادة تعيين الحقول
    setAssetClassification('cash');
    setAssetValue('');
    setWeight('');
    setPricePerGram('');
    onClose();
  };

  const isFormValid = () => {
    if (assetClassification === 'gold' || assetClassification === 'silver') {
      return weight && pricePerGram && parseFloat(weight) > 0 && parseFloat(pricePerGram) > 0;
    }
    return assetValue && parseFloat(assetValue) > 0;
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="add-asset-modal-overlay" onClick={handleOverlayClick}>
      <div className="add-asset-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="add-asset-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="add-asset-modal-title">
          {t('addAsset.title')}
        </h2>

        {/* Form */}
        <div className="add-asset-modal-form">
          {/* Asset Classification */}
          <div className="add-asset-form-group">
            <label className="add-asset-label">
              {t('addAsset.classification')}
            </label>
            <div className="add-asset-dropdown-wrapper" ref={dropdownRef}>
              <button
                type="button"
                className="add-asset-dropdown-button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span>{selectedType?.label || t('addAsset.types.cash')}</span>
                <ChevronDown 
                  size={20} 
                  className={showDropdown ? 'rotated' : ''}
                />
              </button>
              {showDropdown && (
                <div className="add-asset-dropdown-menu">
                  {assetTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className={`add-asset-dropdown-item ${
                        assetClassification === type.value ? 'active' : ''
                      }`}
                      onClick={() => {
                        setAssetClassification(type.value);
                        setShowDropdown(false);
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Asset Value - Different fields based on type */}
          {(assetClassification === 'gold' || assetClassification === 'silver') ? (
            <>
              {/* Weight */}
              <div className="add-asset-form-group">
                <label className="add-asset-label">
                  {t('addAsset.weight')} ({t('addAsset.grams')})
                </label>
                <input
                  type="number"
                  className="add-asset-input"
                  placeholder={t('addAsset.enterWeight')}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
              {/* Price per gram */}
              <div className="add-asset-form-group">
                <label className="add-asset-label">
                  {t('addAsset.pricePerGram')} ($)
                </label>
                <div className="add-asset-input-wrapper">
                  <input
                    type="number"
                    className="add-asset-input"
                    placeholder={t('addAsset.enterPricePerGram')}
                    value={pricePerGram}
                    onChange={(e) => setPricePerGram(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                  <div className="add-asset-currency-icon">
                    <img src={dollarCircleIcon} alt="Dollar" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="add-asset-form-group">
              <label className="add-asset-label">
                {t('addAsset.value')}
              </label>
              <div className="add-asset-input-wrapper">
                <input
                  type="number"
                  className="add-asset-input"
                  placeholder={t('addAsset.enterValue')}
                  value={assetValue}
                  onChange={(e) => setAssetValue(e.target.value)}
                  step="0.01"
                  min="0"
                />
                <div className="add-asset-currency-icon">
                  <img src={dollarCircleIcon} alt="Dollar" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Button */}
        <button
          className="add-asset-submit-button"
          onClick={handleAdd}
          disabled={!isFormValid()}
        >
          {t('addAsset.addButton')}
        </button>
      </div>
    </div>
  );
};

export default AddAssetModal;


import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { Plus, Trash2, Calculator } from 'lucide-react';
import Lottie from 'lottie-react';
import calculatorAnimation from '../assets/lottie/calculator.json';
import AddAssetModal from '../components/AddAssetModal/AddAssetModal';
import ZakatResultModal from '../components/ZakatResultModal/ZakatResultModal';
import './ZakatCalculatorPage.css';

// ثوابت الزكاة
const ZAKAT_RATE = 0.025; // 2.5%
const GOLD_NISAB = 85; // جرام
const SILVER_NISAB = 595; // جرام

const ZakatCalculatorPage = () => {
  const { t } = useTranslation();
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [assets, setAssets] = useState([]);

  const handleAddAsset = () => {
    setShowAddAssetModal(true);
  };

  const onAddAsset = (asset) => {
    setAssets([...assets, { ...asset, id: Date.now() }]);
  };

  const handleDeleteAsset = (id) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  // حساب الزكاة
  const zakatCalculation = useMemo(() => {
    if (assets.length === 0) {
      return {
        totalValue: 0,
        zakatAmount: 0,
        meetsNisab: false,
      };
    }

    // حساب إجمالي القيمة
    const totalValue = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);

    // حساب الزكاة للذهب والفضة بشكل منفصل
    const goldAssets = assets.filter(a => a.type === 'gold');
    const silverAssets = assets.filter(a => a.type === 'silver');
    const otherAssets = assets.filter(a => a.type !== 'gold' && a.type !== 'silver');

    let totalZakat = 0;

    // زكاة الذهب
    goldAssets.forEach(asset => {
      if (asset.weight && asset.weight >= GOLD_NISAB) {
        totalZakat += asset.value * ZAKAT_RATE;
      }
    });

    // زكاة الفضة
    silverAssets.forEach(asset => {
      if (asset.weight && asset.weight >= SILVER_NISAB) {
        totalZakat += asset.value * ZAKAT_RATE;
      }
    });

    // حساب النصاب بالدولار بناءً على الذهب والفضة
    // نحسب النصاب من متوسط سعر الذهب الموجود في الأصول
    let nisabValue = 5000; // قيمة افتراضية للنصاب
    if (goldAssets.length > 0) {
      const avgGoldPrice = goldAssets.reduce((sum, a) => sum + (a.pricePerGram || 0), 0) / goldAssets.length;
      if (avgGoldPrice > 0) {
        nisabValue = GOLD_NISAB * avgGoldPrice;
      }
    } else if (silverAssets.length > 0) {
      const avgSilverPrice = silverAssets.reduce((sum, a) => sum + (a.pricePerGram || 0), 0) / silverAssets.length;
      if (avgSilverPrice > 0) {
        nisabValue = SILVER_NISAB * avgSilverPrice;
      }
    }

    // زكاة المال والأصول الأخرى
    // يجب أن يبلغ إجمالي المال النصاب (85 جرام ذهب أو 595 جرام فضة)
    const otherAssetsValue = otherAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);
    
    if (otherAssetsValue >= nisabValue) {
      totalZakat += otherAssetsValue * ZAKAT_RATE;
    }

    // التحقق من بلوغ النصاب
    const meetsNisab = otherAssetsValue >= nisabValue || 
                       goldAssets.some(a => a.weight && a.weight >= GOLD_NISAB) ||
                       silverAssets.some(a => a.weight && a.weight >= SILVER_NISAB);

    return {
      totalValue,
      zakatAmount: totalZakat,
      meetsNisab,
    };
  }, [assets]);

  return (
    <div className="zakat-calculator-page">
      <div className="zakat-calculator-container">
        {/* Breadcrumb */}
        <div className="zakat-calculator-breadcrumb">
          <Link to="/">{t('nav.home')}</Link>
          <span className="breadcrumb-separator">{'>'}</span>
          <Link to="/zakat">{t('zakatPage.title')}</Link>
          <span className="breadcrumb-separator">{'>'}</span>
          <span className="breadcrumb-current">{t('zakatCalculator.title')}</span>
        </div>

        {/* Main Content */}
        <div className="zakat-calculator-content">
          {/* Calculator Icon */}
          <div className="calculator-icon-wrapper">
            <Lottie
              animationData={calculatorAnimation}
              loop={true}
              className="calculator-lottie"
            />
          </div>

          {/* Title */}
          <h1 className="zakat-calculator-title">
            {t('zakatCalculator.title')}
          </h1>

          {/* Description */}
          <p className="zakat-calculator-description">
            {t('zakatCalculator.description')}
          </p>

          {/* Add Asset Button */}
          <button 
            className="add-asset-button"
            onClick={handleAddAsset}
          >
            <Plus size={20} className="add-asset-plus-icon" />
            <span>{t('zakatCalculator.addAsset')}</span>
          </button>

          {/* Assets List */}
          {assets.length > 0 && (
            <div className="assets-list">
              <h3 className="assets-list-title">{t('zakatCalculator.assetsList')}</h3>
              {assets.map((asset) => (
                <div key={asset.id} className="asset-item">
                  <div className="asset-item-info">
                    <span className="asset-type">{t(`addAsset.types.${asset.type}`)}</span>
                    {asset.weight && (
                      <span className="asset-details">
                        {asset.weight} {t('addAsset.grams')} × ${asset.pricePerGram?.toFixed(2)}
                      </span>
                    )}
                    <span className="asset-value">${asset.value.toFixed(2)}</span>
                  </div>
                  <button
                    className="asset-delete-button"
                    onClick={() => handleDeleteAsset(asset.id)}
                    aria-label={t('zakatCalculator.deleteAsset')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Calculate Zakat Button */}
          {assets.length > 0 && (
            <button 
              className="calculate-zakat-button"
              onClick={() => setShowResultModal(true)}
            >
              <Calculator size={20} className="calculate-zakat-icon" />
              <span>{t('zakatCalculator.calculateZakat')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      <AddAssetModal 
        isOpen={showAddAssetModal}
        onClose={() => setShowAddAssetModal(false)}
        onAddAsset={onAddAsset}
      />

      {/* Zakat Result Modal */}
      <ZakatResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        calculation={zakatCalculation}
        assets={assets}
      />
    </div>
  );
};

export default ZakatCalculatorPage;


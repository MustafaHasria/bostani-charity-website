import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import calculatorIcon from '../assets/images/calculator.png';
import zakatHandIcon from '../assets/images/zakat-hand.png';
import ManualZakatModal from '../components/ManualZakatModal/ManualZakatModal';
import './ZakatPage.css';

const ZakatPage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [showManualZakatModal, setShowManualZakatModal] = useState(false);

  const handleCalculatorClick = () => {
    navigate('/zakat/calculator');
  };

  const handleManualEntryClick = () => {
    setShowManualZakatModal(true);
  };

  return (
    <div className="zakat-page">
      <div className="zakat-page-container">
        {/* Breadcrumb */}
        <div className="zakat-page-breadcrumb">
          <Link to="/">{t('nav.home')}</Link>
          <span className="breadcrumb-separator">{'>'}</span>
          <span className="breadcrumb-current">{t('zakatPage.title')}</span>
        </div>

        {/* Main Content */}
        <div className="zakat-page-content">
          {/* Zakat Calculator Section */}
          <div className="zakat-option-card" onClick={handleCalculatorClick}>
            <div className="zakat-option-content">
              <div className="zakat-option-icon calculator-icon">
                <img src={calculatorIcon} alt="Calculator" />
              </div>
              <div className="zakat-option-text">
                <h2 className="zakat-option-title">{t('zakatPage.calculator.title')}</h2>
                <p className="zakat-option-description">
                  {t('zakatPage.calculator.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Manual Zakat Entry Section */}
          <div className="zakat-option-card" onClick={handleManualEntryClick}>
            <div className="zakat-option-content">
              <div className="zakat-option-icon manual-icon">
                <img src={zakatHandIcon} alt="Zakat Hand" />
              </div>
              <div className="zakat-option-text">
                <h2 className="zakat-option-title">{t('zakatPage.manual.title')}</h2>
                <p className="zakat-option-description">
                  {t('zakatPage.manual.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Zakat Modal */}
      <ManualZakatModal 
        isOpen={showManualZakatModal}
        onClose={() => setShowManualZakatModal(false)}
      />
    </div>
  );
};

export default ZakatPage;


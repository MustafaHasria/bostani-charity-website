import { useTranslation } from '../../hooks/useTranslation';
import './About.css';

const About = () => {
  const { t } = useTranslation();

  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-content">
          <h2 className="about-title">
            <span className="title-highlight">{t('about.titleHighlight')}</span>
            <span className="title-rest">{t('about.titleRest')}</span>
          </h2>
          
          <p className="about-text">
            {t('about.description')}
          </p>
        </div>
        
        <div className="quote-mark quote-mark-top">,,</div>
        <div className="quote-mark quote-mark-bottom">,,</div>
      </div>
    </section>
  );
};

export default About;


import { useLanguage } from '../context/LanguageContext';
import arTranslations from '../locales/ar.json';
import enTranslations from '../locales/en.json';

const translations = {
  ar: arTranslations,
  en: enTranslations,
};

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // إرجاع المفتاح إذا لم يتم العثور على الترجمة
      }
    }

    let result = value || key;

    // دعم الاستبدال في النصوص
    if (typeof result === 'string' && Object.keys(params).length > 0) {
      Object.keys(params).forEach((paramKey) => {
        result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), params[paramKey]);
      });
    }

    return result;
  };

  return { t, language };
};


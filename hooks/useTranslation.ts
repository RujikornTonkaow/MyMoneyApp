import { useLanguageStore } from '../stores/languageStore';
import { translations }     from '../constants/i18n';

export function useTranslation() {
  const language    = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const t           = translations[language];
  const locale      = language === 'th' ? 'th-TH' : 'en-US';

  return { t, language, setLanguage, locale };
}

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useApiClient } from '@/lib/api/client';
import { updateUserProfile } from '@/features/settings/api';
import { isRtl, LANGUAGES } from './languages';

export function useLanguage() {
  const { i18n } = useTranslation();
  const client = useApiClient();
  const currentLanguage = i18n.resolvedLanguage || i18n.language;

  const setLanguage = useCallback(
    (code: string) => {
      void i18n.changeLanguage(code);
      document.documentElement.dir = isRtl(code) ? 'rtl' : 'ltr';
      // Best-effort persistence; ignore failures (e.g. not signed in).
      void updateUserProfile(client, { locale: code }).catch(() => {});
    },
    [i18n, client],
  );

  return { currentLanguage, setLanguage, languages: LANGUAGES };
}

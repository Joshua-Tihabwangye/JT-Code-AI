import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation();
  return <main className="centered"><h1>{t('legal.notFound.title')}</h1><Link to="/">{t('legal.notFound.returnHome')}</Link></main>;
}

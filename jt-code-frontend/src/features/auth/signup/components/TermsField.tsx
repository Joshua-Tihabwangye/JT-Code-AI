import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import type { SignupSchema } from '../schema';
import { FormError } from '../../components/FormError';

interface Props {
  form: UseFormReturn<SignupSchema>;
}

export function TermsField({ form }: Props) {
  const { t } = useTranslation();
  const errorMessage = form.formState.errors.acceptedTerms?.message;

  return (
    <div>
      <div className="terms-field">
        <input
          id="acceptedTerms"
          type="checkbox"
          {...form.register('acceptedTerms')}
        />
        <label htmlFor="acceptedTerms">
          {t('signup.termsPrefix')}
          <Link to="/terms">{t('signup.termsLink')}</Link>
          {t('signup.termsMiddle')}
          <Link to="/privacy">{t('signup.privacyLink')}</Link>.
        </label>
      </div>
      <p className="field-help">
        {t('signup.termsHelp')}
      </p>
      <FormError message={errorMessage ? t(errorMessage) : undefined} />
    </div>
  );
}

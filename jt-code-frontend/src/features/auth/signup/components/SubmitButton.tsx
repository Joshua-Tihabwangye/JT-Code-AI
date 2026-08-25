import { useTranslation } from 'react-i18next';

interface SubmitButtonProps {
  isSubmitting: boolean;
  label: string;
}

export function SubmitButton({ isSubmitting, label }: SubmitButtonProps) {
  const { t } = useTranslation();
  return (
    <button type="submit" className="signup-submit" disabled={isSubmitting}>
      {isSubmitting ? t('common.pleaseWait') : label}
    </button>
  );
}

interface SubmitButtonProps {
  isSubmitting: boolean;
  label: string;
}

export function SubmitButton({ isSubmitting, label }: SubmitButtonProps) {
  return (
    <button type="submit" className="signup-submit" disabled={isSubmitting}>
      {isSubmitting ? 'Please wait…' : label}
    </button>
  );
}

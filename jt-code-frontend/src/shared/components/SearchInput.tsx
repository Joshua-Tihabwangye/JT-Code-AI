import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, placeholder = 'Search', ...props }, ref) => (
    <div className={clsx('search-input', className)}>
      <Search size={16} className="text-muted-foreground" aria-hidden />
      <input
        ref={ref}
        type="search"
        role="searchbox"
        className="search-input-field"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
      {value && (
        <button type="button" className="search-input-clear" aria-label="Clear search" onClick={() => onClear?.() ?? onChange('')}>
          <X size={14} aria-hidden />
        </button>
      )}
    </div>
  ),
);
SearchInput.displayName = 'SearchInput';

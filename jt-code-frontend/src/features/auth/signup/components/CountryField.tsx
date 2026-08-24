import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, FlagTriangleRight, Search } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { COUNTRY_METADATA, getCountryMetadata } from '../../lib/countryMetadata';
import type { SignupSchema } from '../schema';
import { Input } from '@/shared/components/Input';

interface Props {
  form: UseFormReturn<SignupSchema>;
}

export function CountryField({ form }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedCode = form.watch('countryCode');
  const selectedCountry = getCountryMetadata(selectedCode) ?? COUNTRY_METADATA[0]!;
  const [query, setQuery] = useState(selectedCountry.name);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(selectedCountry.name);
  }, [selectedCountry.code, selectedCountry.name]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutside);
    return () => window.removeEventListener('mousedown', handleOutside);
  }, []);

  const filteredCountries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return COUNTRY_METADATA;
    return COUNTRY_METADATA.filter((country) => {
      return (
        country.name.toLowerCase().includes(normalized) ||
        country.code.toLowerCase().includes(normalized) ||
        country.dialCode.includes(normalized)
      );
    });
  }, [query]);

  const selectCountry = (code: string) => {
    const country = getCountryMetadata(code);
    if (!country) return;
    form.setValue('countryCode', country.code, { shouldValidate: true, shouldDirty: true });
    form.setValue('dialCode', country.dialCode, { shouldValidate: true, shouldDirty: true });
    form.setValue('timezone', country.timezones[0] ?? '', { shouldValidate: true, shouldDirty: true });
    form.setValue('contact', '', { shouldValidate: true, shouldDirty: true });
    setQuery(country.name);
    setOpen(false);
  };

  return (
    <div className="form-field">
      <label htmlFor="country-search">Country</label>
      <div className="country-combobox" ref={containerRef}>
        <Input
          id="country-search"
          value={query}
          placeholder="Search a country"
          leftIcon={<Search size={16} aria-hidden />}
          rightIcon={<ChevronDown size={16} aria-hidden />}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false);
              return;
            }
            if (event.key === 'Enter' && filteredCountries.length === 1) {
              event.preventDefault();
              selectCountry(filteredCountries[0]!.code);
            }
          }}
          aria-expanded={open}
          aria-controls="country-options"
          aria-autocomplete="list"
        />
        <button
          type="button"
          className="country-pill"
          onClick={() => setOpen((value) => !value)}
          aria-label={`Selected country ${selectedCountry.name}`}
        >
          <span aria-hidden>{selectedCountry.flag}</span>
          <span>{selectedCountry.dialCode}</span>
        </button>

        {open && (
          <div className="country-list" role="listbox" id="country-options">
            {filteredCountries.slice(0, 8).map((country) => {
              const active = country.code === selectedCountry.code;
              return (
                <button
                  key={country.code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`country-option${active ? ' is-active' : ''}`}
                  onClick={() => selectCountry(country.code)}
                >
                  <span className="country-option__flag" aria-hidden>
                    {country.flag}
                  </span>
                  <span className="country-option__label">
                    <strong>{country.name}</strong>
                    <span>{country.dialCode}</span>
                  </span>
                  {active && <Check size={16} aria-hidden />}
                </button>
              );
            })}
            {!filteredCountries.length && (
              <div className="country-empty">
                <FlagTriangleRight size={16} aria-hidden />
                <span>No countries match “{query}”.</span>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="field-help">
        The selected country updates your dial code, phone validation and timezone suggestions.
      </p>
      {form.formState.errors.countryCode?.message && (
        <p className="field-error">{form.formState.errors.countryCode.message}</p>
      )}
    </div>
  );
}

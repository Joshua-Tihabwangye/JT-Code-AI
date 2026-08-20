import { useMemo } from 'react';
import {
  COUNTRY_METADATA,
  getCountryMetadata,
} from '../../lib/countryMetadata';

export function useCountryMetadata(countryCode?: string) {
  const selectedCountry = useMemo(
    () => (countryCode ? getCountryMetadata(countryCode) : undefined),
    [countryCode],
  );

  return {
    countries: COUNTRY_METADATA,
    selectedCountry,
    dialCode: selectedCountry?.dialCode ?? '',
    phonePlaceholder: selectedCountry?.phonePlaceholder ?? '',
    timezones: selectedCountry?.timezones ?? [],
  };
}

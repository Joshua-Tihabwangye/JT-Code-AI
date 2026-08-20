import { getCountryMetadata } from './countryMetadata';

export function getTimezonesForCountry(countryCode: string): string[] {
  return getCountryMetadata(countryCode)?.timezones ?? [];
}

export function getDefaultTimezoneForCountry(countryCode: string): string {
  return getTimezonesForCountry(countryCode)[0] ?? '';
}

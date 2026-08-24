import {
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js';

export function isValidPhoneNumberForCountry(
  value: string,
  countryCode: CountryCode,
): boolean {
  try {
    const parsed = parsePhoneNumberFromString(value, countryCode);
    return Boolean(parsed?.isValid());
  } catch {
    return false;
  }
}

export function normalizePhoneNumber(
  value: string,
  countryCode: CountryCode,
): string | null {
  try {
    const parsed = parsePhoneNumberFromString(value, countryCode);
    return parsed?.number ?? null;
  } catch {
    return null;
  }
}

export function formatPhoneNumberForCountry(
  value: string,
  countryCode: CountryCode,
): string {
  try {
    const parsed = parsePhoneNumberFromString(value, countryCode);
    return parsed ? parsed.formatNational() : value.trim();
  } catch {
    return value.trim();
  }
}

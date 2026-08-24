import ct from 'countries-and-timezones';
import {
  getCountryCallingCode,
  getExampleNumber,
  type CountryCode,
} from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';

export interface CountryMetadata {
  code: CountryCode;
  name: string;
  flag: string;
  dialCode: string;
  phonePlaceholder: string;
  timezones: string[];
}

function countryCodeToFlag(code: CountryCode): string {
  return code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(0x1f1e6 + (char.charCodeAt(0) - 65)))
    .join('');
}

function cleanExample(value: string): string {
  return value.replace(/[()\s-]/g, '');
}

function getPhonePlaceholder(code: CountryCode): string {
  try {
    const example = getExampleNumber(code, examples);
    if (!example) return `+${getCountryCallingCode(code)}123456789`;
    return cleanExample(example.formatInternational());
  } catch {
    return '';
  }
}

let cache: CountryMetadata[] | null = null;

export function getCountryMetadataList(): CountryMetadata[] {
  if (cache) return cache;
  const countries = Object.values(ct.getAllCountries());
  cache = countries
    .map((country) => {
      try {
        const code = country.id as CountryCode;
        return {
          code,
          name: country.name,
          flag: countryCodeToFlag(code),
          dialCode: `+${getCountryCallingCode(code)}`,
          phonePlaceholder: getPhonePlaceholder(code),
          timezones: ([...country.timezones] as string[]).sort(),
        };
      } catch {
        return null;
      }
    })
    .filter((country): country is CountryMetadata => country !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
  return cache;
}

export const COUNTRY_METADATA = getCountryMetadataList();

export function getCountryMetadata(countryCode: string): CountryMetadata | undefined {
  return COUNTRY_METADATA.find((country) => country.code === countryCode);
}

export function getDefaultCountry(): CountryMetadata {
  return getCountryMetadata('UG') ?? COUNTRY_METADATA[0]!;
}

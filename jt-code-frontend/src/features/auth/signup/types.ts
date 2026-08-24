import type { CountryCode } from 'libphonenumber-js';

export interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  countryCode: CountryCode | '';
  dialCode: string;
  contact: string;
  timezone: string;
  acceptedTerms: boolean;
}

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  countryCode: CountryCode;
  countryName: string;
  dialCode: string;
  contact: string;
  timezone: string;
  acceptedTerms: boolean;
}

import { z } from 'zod';
import type { CountryCode } from 'libphonenumber-js';
import { isValidPhoneNumberForCountry } from '../../auth/lib/phone';

// Validation messages are i18n keys (see src/i18n/locales/*.json under authErrors).
// They are translated at render time by the form field components.
export const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, 'authErrors.firstNameRequired')
      .max(50, 'authErrors.firstNameTooLong'),
    lastName: z
      .string()
      .trim()
      .min(2, 'authErrors.lastNameRequired')
      .max(50, 'authErrors.lastNameTooLong'),
    email: z.string().trim().email('authErrors.invalidEmail'),
    password: z
      .string()
      .min(8, 'authErrors.passwordMinLength')
      .regex(/[A-Z]/, 'authErrors.passwordUppercase')
      .regex(/[a-z]/, 'authErrors.passwordLowercase')
      .regex(/[0-9]/, 'authErrors.passwordNumber'),
    confirmPassword: z.string(),
    countryCode: z.string().min(2, 'authErrors.selectCountry'),
    dialCode: z.string().min(1, 'authErrors.selectDialCode'),
    contact: z.string().trim().min(5, 'authErrors.phoneRequired'),
    timezone: z.string().min(1, 'authErrors.selectTimezone'),
    acceptedTerms: z
      .boolean()
      .refine((value) => value === true, {
        message: 'authErrors.acceptTerms',
      }),
  })
  .superRefine((values, ctx) => {
    if (values.countryCode && !isValidPhoneNumberForCountry(values.contact, values.countryCode as CountryCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contact'],
        message: 'authErrors.invalidPhone',
      });
    }
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'authErrors.passwordsDoNotMatch',
  });

export type SignupSchema = z.infer<typeof signupSchema>;

import { z } from 'zod';

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, 'First name is required.')
      .max(50, 'First name is too long.'),
    lastName: z
      .string()
      .trim()
      .min(2, 'Last name is required.')
      .max(50, 'Last name is too long.'),
    email: z.string().trim().email('Enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must contain at least 8 characters.')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
      .regex(/[a-z]/, 'Password must contain a lowercase letter.')
      .regex(/[0-9]/, 'Password must contain a number.'),
    confirmPassword: z.string(),
    countryCode: z.string().min(2, 'Select your country.'),
    contact: z.string().trim().min(5, 'Enter your phone number.'),
    timezone: z.string().min(1, 'Select your timezone.'),
    acceptedTerms: z
      .boolean()
      .refine((value) => value === true, {
        message: 'You must accept the Terms and Privacy Policy.',
      }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type SignupSchema = z.infer<typeof signupSchema>;

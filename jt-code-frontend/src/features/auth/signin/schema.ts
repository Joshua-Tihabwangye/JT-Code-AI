import { z } from 'zod';

// Validation messages are i18n keys (see src/i18n/locales/*.json under authErrors).
export const signinSchema = z.object({
  email: z.string().trim().email('authErrors.invalidEmail'),
  password: z.string().min(1, 'authErrors.passwordRequired'),
});

export type SignInSchema = z.infer<typeof signinSchema>;

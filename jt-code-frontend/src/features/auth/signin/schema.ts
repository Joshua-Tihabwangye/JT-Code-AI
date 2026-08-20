import { z } from 'zod';

export const signinSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export type SignInSchema = z.infer<typeof signinSchema>;

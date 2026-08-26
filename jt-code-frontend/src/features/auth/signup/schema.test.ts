import { signupSchema } from './schema';

describe('signupSchema', () => {
  const validBase = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    confirmPassword: '',
    countryCode: 'UG',
    dialCode: '+256',
    contact: '700123456',
    timezone: 'Africa/Kampala',
    acceptedTerms: true,
  };

  describe('password validation (simplified policy)', () => {
    it('rejects password shorter than 8 characters', () => {
      const result = signupSchema.safeParse({ ...validBase, password: 'Ab1', confirmPassword: 'Ab1' });
      expect(result.success).toBe(false);
    });

    it('rejects password with no letters', () => {
      const result = signupSchema.safeParse({ ...validBase, password: '12345678', confirmPassword: '12345678' });
      expect(result.success).toBe(false);
    });

    it('rejects password with no numbers', () => {
      const result = signupSchema.safeParse({ ...validBase, password: 'abcdefgh', confirmPassword: 'abcdefgh' });
      expect(result.success).toBe(false);
    });

    it('accepts password with 8+ chars, at least one letter and one number', () => {
      const result = signupSchema.safeParse({ ...validBase, password: 'password1', confirmPassword: 'password1' });
      expect(result.success).toBe(true);
    });

    it('accepts mixed case with numbers', () => {
      const result = signupSchema.safeParse({ ...validBase, password: 'Pass1234', confirmPassword: 'Pass1234' });
      expect(result.success).toBe(true);
    });

    it('does not require uppercase specifically', () => {
      const result = signupSchema.safeParse({ ...validBase, password: 'alllower1', confirmPassword: 'alllower1' });
      expect(result.success).toBe(true);
    });

    it('does not require lowercase specifically', () => {
      const result = signupSchema.safeParse({ ...validBase, password: 'ALLUPPER1', confirmPassword: 'ALLUPPER1' });
      expect(result.success).toBe(true);
    });

    it('rejects when passwords do not match', () => {
      const result = signupSchema.safeParse({ ...validBase, password: 'password1', confirmPassword: 'password2' });
      expect(result.success).toBe(false);
    });
  });

  describe('other fields', () => {
    it('requires first name', () => {
      const result = signupSchema.safeParse({ ...validBase, firstName: '', password: 'password1', confirmPassword: 'password1' });
      expect(result.success).toBe(false);
    });

    it('requires valid email', () => {
      const result = signupSchema.safeParse({ ...validBase, email: 'notanemail', password: 'password1', confirmPassword: 'password1' });
      expect(result.success).toBe(false);
    });

    it('requires accepted terms', () => {
      const result = signupSchema.safeParse({ ...validBase, password: 'password1', confirmPassword: 'password1', acceptedTerms: false });
      expect(result.success).toBe(false);
    });
  });
});

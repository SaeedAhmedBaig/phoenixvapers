import { z } from 'zod';

/**
 * Identity boundary DTOs. Registration collects the minimum an
 * electronic age check needs (name, DOB) — nothing more (§16.5).
 */

/** 8+ chars with some spread; breach-resistance comes from argon2id. */
const passwordSchema = z
  .string()
  .min(10, 'password must be at least 10 characters')
  .max(200)
  .refine(
    (value) => /[a-zA-Z]/.test(value) && /[0-9]/.test(value),
    'password needs letters and numbers',
  );

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: passwordSchema,
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  /**
   * Date of birth, ISO date. Bound sanity-checked here; the AGE decision
   * belongs to the verification provider, not to client-supplied data.
   */
  dateOfBirth: z.coerce
    .date()
    .min(new Date('1900-01-01'))
    .max(new Date(), 'date of birth cannot be in the future'),
});
export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
});
export type LoginDto = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(32).max(256),
});
export type RefreshDto = z.infer<typeof refreshSchema>;

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
  })
  .partial();
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(40),
  line1: z.string().trim().min(2).max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(1).max(80),
  postcode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9 ]{5,10}$/, 'invalid postcode'),
  country: z.literal('GB').default('GB'), // UK-only in Edition 1.0 (§2.2)
});
export type AddressDto = z.infer<typeof addressSchema>;

export const consentsSchema = z.object({
  marketingEmail: z.boolean(),
});
export type ConsentsDto = z.infer<typeof consentsSchema>;

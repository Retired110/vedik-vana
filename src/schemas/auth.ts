import { z } from 'zod';

export const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

export const otpRequestSchema = z.object({
  identifier: z
    .string()
    .min(5, 'Please enter a valid mobile number or email address.')
    .max(100, 'Identifier is too long.')
    .refine((val) => {
      const clean = val.replace(/[\s-]/g, '');
      const isPhone = /^[+]?\d{10,13}$/.test(clean);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      return isPhone || isEmail;
    }, 'Enter a valid 10-digit mobile number or email address.'),
});

export const otpVerifySchema = z.object({
  code: z
    .string()
    .length(6, 'Verification code must be exactly 6 digits.')
    .regex(/^\d{6}$/, 'Code must contain numbers only.'),
});

export const passwordLoginSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Please enter your registered email or phone number.'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters.'),
});

export const customerRegisterSchema = z.object({
  name: z
    .string()
    .min(2, 'Full name must be at least 2 characters.')
    .max(80, 'Full name cannot exceed 80 characters.')
    .regex(/^[a-zA-Z\s'.]+$/, 'Name should contain letters only.'),
  email: z
    .string()
    .email('Please enter a valid email address.')
    .min(5, 'Email is required.'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[+]?\d{10,13}$/.test(val.replace(/[\s-]/g, '')), {
      message: 'Please enter a valid 10-digit mobile number.',
    })
    .or(z.literal('')),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters.')
    .optional()
    .or(z.literal('')),
});

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Please enter your registered email or mobile number.'),
  code: z
    .string()
    .length(6, 'OTP must be 6 digits.')
    .optional(),
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters.')
    .optional(),
});

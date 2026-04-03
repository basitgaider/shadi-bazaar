import { z } from 'zod';

const phoneRegex = /^[+\d\s\-()]{7,20}$/;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email')
    .transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number is required')
    .max(20, 'Phone number must be at most 20 characters')
    .regex(phoneRegex, 'Enter a valid phone number'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be at most 1000 characters'),
});

export type ContactInput = z.infer<typeof contactSchema>;

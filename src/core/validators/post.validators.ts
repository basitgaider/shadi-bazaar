import { z } from 'zod';

export const createPostSchema = z
  .object({
    category_id: z.number().int().positive('Category is required'),
    item_type_id: z.number().int().positive('Type is required'),
    condition_id: z.number().int().positive('Condition is required'),
    city_id: z.number().int().positive('City is required'),
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(255, 'Title is too long'),
    description: z
      .string()
      .trim()
      .min(10, 'Description must be at least 10 characters')
      .max(5000, 'Description must be at most 5000 characters'),
    price: z.string().optional().default(''),
    deposit: z.string().optional().default(''),
    rent_per_day: z.string().optional().default(''),
    images: z.array(z.instanceof(File)).max(8, 'You can upload up to 8 images'),
  })
  .superRefine((data, ctx) => {
    const isRent = data.item_type_id === 2;

    if (isRent) {
      if (!data.deposit?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Deposit is required for rent listings.', path: ['deposit'] });
      }
      if (!data.rent_per_day?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Rent per day is required for rent listings.',
          path: ['rent_per_day'],
        });
      }
    } else if (!data.price?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Price is required for this listing type.', path: ['price'] });
    }
  });

export type CreatePostInput = z.infer<typeof createPostSchema>;

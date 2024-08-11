import { z } from 'zod';

const purchaseValidationSchema = z.object({
  body: z.object({
    full_name: z.string({ required_error: 'Full name is required' }),
    country_code: z.string({ required_error: 'Country code is required' }),
    phone_number: z.string({ required_error: 'Mobile number is required' }),
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Invalid email address' })
      .optional(),
    category: z.string({ required_error: 'Category is required' }),
    shop_name: z.string({ required_error: 'Shop name is required' }),
    country: z.string({ required_error: 'Country is required' }),
    city: z.string({ required_error: 'City is required' }),
    state: z.string({ required_error: 'State is required' }),
  }),
});

export const purchaseValidation = {
  purchaseValidationSchema,
};

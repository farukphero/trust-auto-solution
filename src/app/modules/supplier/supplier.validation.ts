import { z } from 'zod';

const supplierValidationSchema = z.object({
  body: z.object({
    full_name: z.string({ required_error: 'Full name is required.' }),
    phone_number: z.string({
      required_error: 'Phone number is required.',
    }),
    vendor: z.string({ required_error: 'Vendor name is required.' }),
    shop_name: z.string({ required_error: 'Shop name is required.' }),
    country: z.string({ required_error: 'Country name is required.' }),
    city: z.string({ required_error: 'City name is required.' }),
    state: z.string({
      required_error: 'State is required.',
    }),
  }),
});

export const supplierValidation = {
  supplierValidationSchema,
};

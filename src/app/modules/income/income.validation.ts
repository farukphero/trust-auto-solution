import { z } from 'zod';

const incomeValidationSchema = z.object({
  body: z.object({
    category: z.array(z.string({ required_error: 'Category is required.' })),
    income_name: z.string({ required_error: 'Income name is required.' }),
    invoice_number: z.string({ required_error: 'Invoice number is required.' }),
    date: z.string({
      required_error: 'Date is required.',
    }),
    amount: z
      .number({
        required_error: 'Amount is required.',
        invalid_type_error: 'Amount must be a number',
      })
      .min(0, { message: 'Amount must be more than 0' }),

    description: z.string({ required_error: 'Description is required.' }),

    image: z.string().optional(),
  }),
});

export const incomeValidation = {
  incomeValidationSchema,
};

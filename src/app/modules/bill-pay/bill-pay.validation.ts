import { z } from 'zod';

const billPayValidationSchema = z.object({
  body: z.object({
    supplierId: z.string({ required_error: 'Supplier ID is required' }),
    name: z.string({ required_error: 'Name is required' }),
    mobile_number: z.string({ required_error: 'Mobile number is required' }),
    address: z.string({ required_error: 'Address is required' }),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
    shop_name: z.string({ required_error: 'Shop name is required' }),
    against_bill: z.string({ required_error: 'Against bill is required' }),
    category: z.string({ required_error: 'Category is required' }),
    amount: z
      .number({
        required_error: 'Amount is required',
        invalid_type_error: 'Amount must be a number',
      })
      .min(0, 'Amount must be a positive number'),
    payment_against_bill: z.string({
      required_error: 'Payment against bill is required',
    }),
    paid_on: z.string({ required_error: 'Paid on date is required' }),
    individual_markup: z.string({
      required_error: 'Individual markup is required',
    }),
    payment_method: z.string({ required_error: 'Payment method is required' }),

    transaction_no: z.string().optional(),
    transactionId: z.string().optional(),
    expense_note: z.string().optional(),
    selected_bank: z.string().optional(),
    bank_account_no: z.string().optional(),
    card_number: z.string().optional(),
    check_no: z.string().optional(),
    card_holder_name: z.string().optional(),
    card_transaction_no: z.string().optional(),
    card_type: z.string().optional(),
    month_first: z.string().optional(),
    year: z.string().optional(),
    month_second: z.string().optional(),
    security_code: z.string().optional(),

    image: z.string().optional(),
  }),
});

export const billPayValidation = {
  billPayValidationSchema,
};

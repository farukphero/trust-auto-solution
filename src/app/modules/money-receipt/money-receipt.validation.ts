import { z } from 'zod';

const moneyReceiptValidationSchema = z.object({
  body: z.object({
    Id: z.string({ required_error: 'User id is required' }),
    user_type: z.string({ required_error: 'User type is required' }),
    job_no: z.string({ required_error: 'Order number is required' }),
    default_date: z.string({ required_error: 'Date is required' }),
    thanks_from: z.string({ required_error: 'Thanks for is required' }),
    against_bill_no_method: z.string({
      required_error: 'Billing method is required',
    }),
    full_reg_number: z.string().optional(),
    chassis_no: z.string({ required_error: 'Chassis no is required' }),
    payment_method: z.string({ required_error: 'Payment method is required' }),
    payment_number: z.string().optional(),
    date_one: z.string().optional(),
    bank_number: z.number().optional(),
    date_two: z.string().optional(),
    total_amount: z.number({ required_error: 'Amount is required' }),
   
    remaining: z.number().optional(),
    taka_in_word: z.string().optional(),
  }),
});

export const moneyReceiptValidation = {
  moneyReceiptValidationSchema,
};

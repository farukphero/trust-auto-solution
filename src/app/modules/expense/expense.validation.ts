import { z } from 'zod';

const expenseValidationSchema = z.object({
  body: z.object({
    category: z.string({ required_error: 'Category is required.' }),
    sub_category: z.string({ required_error: 'Sub category is required.' }),
    expense_for: z.string({ required_error: 'Expense for is required.' }),
    tax_application: z.string({
      required_error: 'Tax application is required.',
    }),
    expense_note_first: z.string({
      required_error: 'Expense note is required.',
    }),
    amount: z.string({required_error: 'Amount must be a positive number.'}),

    paid_on: z.string({ required_error: 'Paid on is required.' }),
    payment_individual_markup: z.string({
      required_error: 'Payment markup is required.',
    }),
    payment_method: z.string({ required_error: 'Payment method is required.' }),
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

export const expenseValidation = {
  expenseValidationSchema,
};

import mongoose, { Schema } from 'mongoose';
import { TExpense } from './expense.interface';

const expenseSchema: Schema<TExpense> = new Schema<TExpense>(
  {
    category: {
      type: String,
      required: [true, 'Category is required.'],
    },
    sub_category: {
      type: String,
      required: [true, 'Sub category is required.'],
    },
    expense_for: {
      type: String,
      required: [true, 'Expense for is required.'],
    },
    tax_application: {
      type: String,
      required: [true, 'Tax application is required.'],
    },
     
    expense_note_first: {
      type: String,
      required: [true, 'Expense note is required.'],
    },
    
    amount: {
      type: String,
      required: [true, 'Amount is required.'],
    },
    paid_on: {
      type: String,
      required: [true, 'Paid on is required.'],
    },
    payment_individual_markup: {
      type: String,
      required: [true, 'Payment markup is required.'],
    },
    payment_method: {
      type: String,
      required: [true, 'Payment method is required.'],
    },
    transaction_no: {
      type: String,
       
    },
    transactionId: {
      type: String,
       
    },
    expense_note: {
      type: String,
       
    },
    selected_bank: {
      type: String,
       
    },

    bank_account_no: {
      type: String,
    },
     
    card_number: {
      type: String,
    },
    check_no: {
      type: String,
    },
    
     
    card_holder_name: {
      type: String,
    },
    card_transaction_no: {
      type: String,
    },
    card_type: {
      type: String,
    },
    month_first: {
      type: String,
    },
    year: {
      type: String,
    },
    month_second: {
      type: String,
    },
    security_code: {
      type: String,
    },
    
    // other_transaction_no: {
    //   type: String,
    // },
    // other_transactionId: {
    //   type: String,
    // },
    
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Expense = mongoose.model<TExpense>('Expense', expenseSchema);

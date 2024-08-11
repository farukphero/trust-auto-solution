import mongoose, { Schema } from 'mongoose';
import { TIncome } from './income.interface';

const incomeSchema: Schema<TIncome> = new Schema<TIncome>(
  {
    category: [{
      type: String,
      required: [true, 'Category is required.'],
    }],
    income_name: {
      type: String,
      required: [true, 'Income name is required.'],
    },
    invoice_number: {
      type: String,
      required: [true, 'Invoice number is required.'],
    },
    date: {
      type: String,
      required: [true, 'Date is required.'],
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required.'],
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
    },

    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Income = mongoose.model<TIncome>('Income', incomeSchema);

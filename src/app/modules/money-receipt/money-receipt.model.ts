import mongoose, { Schema } from 'mongoose';
import { TMoneyReceipt } from './money-receipt.interface';

const moneyReceiptSchema: Schema<TMoneyReceipt> = new Schema<TMoneyReceipt>(
  {
    customer: {
      type: Schema.ObjectId,
      ref: 'Customer',
    },
    company: {
      type: Schema.ObjectId,
      ref: 'Company',
    },
    showRoom: {
      type: Schema.ObjectId,
      ref: 'ShowRoom',
    },
    vehicle: {
      type: Schema.ObjectId,
      ref: 'Vehicle',
    },
    Id: {
      type: String,
      required: [true, 'User id is required'],
    },
    user_type: {
      type: String,
      required: [true, 'User type is required'],
    },
    job_no: {
      type: String,
      required: [true, 'Order number is required'],
    },
    default_date: {
      type: String,
      required: [true, 'Date is required'],
    },
    thanks_from: {
      type: String,
      required: [true, 'Thanks for is required'],
    },
    against_bill_no_method: {
      type: String,
      required: [true, 'Billing method is required'],
    },

    full_reg_number: {
      type: String,
    },
    chassis_no: {
      type: String,
      required: [true, 'Chassis no is required'],
    },

    payment_method: {
      type: String,
      required: [true, 'Payment method is required'],
    },
    payment_number: {
      type: String,
    },

    date_one: {
      type: String,
    },

    bank_number: {
      type: Number,
    },

    date_two: {
      type: String,
    },
    total_amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    advance: {
      type: Number,
      default: 0
    },
    remaining: {
      type: Number,
    },

    taka_in_word: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const MoneyReceipt = mongoose.model<TMoneyReceipt>(
  'MoneyReceipt',
  moneyReceiptSchema,
);

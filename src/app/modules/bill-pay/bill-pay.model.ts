import mongoose, { Schema } from 'mongoose';
import { TBillPay } from './bill-pay.interface';

const billPaySchema: Schema<TBillPay> = new Schema<TBillPay>(
  {
    supplier: {
      type: Schema.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier ID is required'],
    },
    supplierId: {
      type: String,
      required: [true, 'Supplier ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    mobile_number: {
      type: String,
      required: [true, 'Mobile number is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },
    shop_name: {
      type: String,
      required: [true, 'Shop name is required'],
    },
    against_bill: {
      type: String,
      required: [true, 'Against bill is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    payment_against_bill: {
      type: String,
      required: [true, 'Payment against bill is required'],
    },
    paid_on: {
      type: String,
      required: [true, 'Paid on date is required'],
    },
    individual_markup: {
      type: String,
      required: [true, 'Individual markup is required'],
    },
    payment_method: {
      type: String,
      required: [true, 'Payment method is required'],
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

    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const BillPay = mongoose.model<TBillPay>('BillPay', billPaySchema);

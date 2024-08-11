import mongoose, { Schema } from 'mongoose';
import { TQuotation } from './quotation.interface';

const quotationSchema: Schema<TQuotation> = new Schema<TQuotation>(
  {
    quotation_no: {
      type: String,
      required: [true, 'Quotation number is required'],
    },
    user_type: {
      type: String,
      enum: ['customer', 'company', 'showRoom'],
    },
    Id: {
      type: String,
    },
    job_no: {
      type: String,
    },
    date: {
      type: String,
    },
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

    input_data: [
      {
        description: { type: String, trim: true },
        quantity: Number,
        rate: Number,
        total: Number,
      },
    ],
    service_input_data: [
      {
        description: { type: String, trim: true },
        quantity: Number,
        rate: Number,
        total: Number,
      },
    ],
    total_amount: {
      type: Number,
      required: [true, 'Total amount is required'],
    },
    parts_total: {
      type: Number,
      required: [true, 'Parts total amount is required'],
    },
    service_total: {
      type: Number,
      required: [true, 'Service total amount is required'],
    },
    discount: {
      type: Number,
    },
    vat: {
      type: Number,
    },
    net_total: {
      type: Number,
      required: [true, 'Net total is required'],
    },
  },
  {
    timestamps: true,
  },
);

export const Quotation = mongoose.model<TQuotation>(
  'Quotation',
  quotationSchema,
);

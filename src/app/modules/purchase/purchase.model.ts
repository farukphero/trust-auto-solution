import mongoose, { Schema, UpdateQuery } from 'mongoose';
import { TPurchase } from './purchase.interface';

const purchaseSchema: Schema<TPurchase> = new Schema<TPurchase>(
  {
    purchase_no: {
      type: String,
      required: [true, 'Purchase number is required'],
    },
    full_name: {
      type: String,
      required: [true, 'Full name is required'],
    },
    country_code: {
      type: String,
      required: [true, 'Country code is required'],
    },
    phone_number: {
      type: String,
      required: [true, 'Mobile number is required'],
    },
    full_phone_number: {
      type: String,
    },
    email: {
      type: String,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    shop_name: {
      type: String,
      required: [true, 'Shop name is required'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    image: {
      type: String,
    },

    input_data: [
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

purchaseSchema.pre('save', function (next) {
  if (this.country_code && this.phone_number) {
    this.full_phone_number = `${this.country_code}${this.phone_number}`;
  } else {
    this.full_phone_number = '';
  }
  next();
});

// Pre-update middleware
purchaseSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate?.() as UpdateQuery<any>;

  if (update.$set && update.$set.country_code && update.$set.phone_number) {
    update.$set.full_phone_number = `${update.$set.country_code}${update.$set.phone_number}`;
  } else if (update.country_code && update.phone_number) {
    update.full_phone_number = `${update.country_code}${update.phone_number}`;
  }

  next();
});

export const Purchase = mongoose.model<TPurchase>('Purchase', purchaseSchema);

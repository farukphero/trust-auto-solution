import mongoose, { Schema } from 'mongoose';
import { TSupplier } from './supplier.interface';

const supplierSchema: Schema<TSupplier> = new Schema<TSupplier>(
  {
    supplierId: {
      type: String,
      required: [true, 'Supplier Id is required'],
    },
    full_name: {
      type: String,
      required: [true, 'Full name is required'],
    },
    phone_number: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    country_code: {
      type: String,
    },
    full_Phone_number: {
      type: String,
    },
    email: {
      type: String,
    },
    vendor: {
      type: String,
      required: [true, 'Vendor name is required'],
    },

    shop_name: {
      type: String,
      required: [true, 'Shop name is required'],
    },
    country: {
      type: String,
      required: [true, 'Country name is required'],
    },
    city: {
      type: String,
      required: [true, 'City name is required'],
    },

    state: {
      type: String,
      required: [true, 'State is required'],
    },

    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to concatenate country_code and phone_number
supplierSchema.pre('save', function (next) {
  if (this.country_code && this.phone_number) {
    this.full_Phone_number = `${this.country_code}${this.phone_number}`;
  } else {
    this.full_Phone_number = '';
  }
  next();
});

// Pre-update middleware
supplierSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as {
    country_code: any;
    phone_number: any;
    full_Phone_number: string;
    $set?: Partial<TSupplier>;
  };

  if (
    update.$set &&
    update.$set.country_code &&
    update.$set.phone_number
  ) {
    update.$set.full_Phone_number = `${update.$set.country_code}${update.$set.phone_number}`;
  } else if (update.country_code && update.phone_number) {
    update.full_Phone_number = `${update.country_code}${update.phone_number}`;
  }

  next();
});

export const Supplier = mongoose.model<TSupplier>('Supplier', supplierSchema);

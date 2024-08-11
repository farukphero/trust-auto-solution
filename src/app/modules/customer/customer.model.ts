import mongoose, { Schema } from 'mongoose';
import { TCustomer } from './customer.interface';

const customerSchema: Schema<TCustomer> = new Schema<TCustomer>(
  {
    customerId: {
      type: String,
      unique: true,
      required: [true, 'Customer Id is required.'],
    },

    user_type: {
      type: String,
      default: 'customer',
      required: true,
    },

    vehicles: [
      {
        type: Schema.ObjectId,
        ref: 'Vehicle',
      },
    ],
    jobCards: [
      {
        type: Schema.ObjectId,
        ref: 'JobCard',
      },
    ],
    quotations: [
      {
        type: Schema.ObjectId,
        ref: 'Quotation',
      },
    ],
    invoices: [
      {
        type: Schema.ObjectId,
        ref: 'Invoice',
      },
    ],
    money_receipts: [
      {
        type: Schema.ObjectId,
        ref: 'MoneyReceipt',
      },
    ],

    // Customer Information
    customer_name: {
      type: String,
      required: [true, 'Customer name is required.'],
    },
    customer_email: {
      type: String,
    },
    customer_address: {
      type: String,
      required: [true, 'Customer address is required.'],
    },

    company_name: {
      type: String,
      required: [true, 'Company name is required.'],
    },
    vehicle_username: {
      type: String,
      required: [true, 'Vehicle username is required.'],
    },
    company_address: {
      type: String,
    },

    customer_country_code: {
      type: String,
    },
    customer_contact: {
      type: String,
      required: [true, 'Customer contact number is required.'],
    },
    fullCustomerNum: {
      type: String,
    },

    driver_name: {
      type: String,
    },
    driver_country_code: {
      type: String,
    },
    driver_contact: {
      type: String,
    },
    reference_name: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to concatenate company_country_code and company_contact
customerSchema.pre('save', function (next) {
  if (this.customer_country_code && this.customer_contact) {
    this.fullCustomerNum = `${this.customer_country_code}${this.customer_contact}`;
  } else {
    this.fullCustomerNum = '';
  }
  next();
});

// Pre-update middleware
customerSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as {
    customer_country_code: any;
    customer_contact: any;
    fullCustomerNum: string;
    $set?: Partial<TCustomer>;
  };

  if (
    update.$set &&
    update.$set.customer_country_code &&
    update.$set.customer_contact
  ) {
    update.$set.fullCustomerNum = `${update.$set.customer_country_code}${update.$set.customer_contact}`;
  } else if (update.customer_country_code && update.customer_contact) {
    update.fullCustomerNum = `${update.customer_country_code}${update.customer_contact}`;
  }

  next();
});

export const Customer = mongoose.model<TCustomer>('Customer', customerSchema);

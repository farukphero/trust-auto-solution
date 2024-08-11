import mongoose, { Schema } from 'mongoose';
import { TEmployee } from './employee.interface';
import config from '../../config';
import bcrypt from 'bcrypt';

const employeeSchema: Schema<TEmployee> = new Schema<TEmployee>(
  {
    attendance: [
      {
        type: Schema.ObjectId,
        ref: 'Attendance',
      },
    ],
    salary: [
      {
        type: Schema.ObjectId,
        ref: 'Salary',
      },
    ],
    employeeId: {
      type: String,
      required: [true, 'Employee id is required.'],
    },
    full_name: {
      type: String,
      required: [true, 'Full name is required.'],
    },
    date_of_birth: {
      type: String,
      required: [true, 'Date of birth is required.'],
    },
    nid_number: {
      type: Number,
    },
    blood_group: {
      type: String,
    },
    country_code: {
      type: String,
    },
    phone_number: {
      type: String,
      required: [true, 'Phone number is required.'],
    },
    full_phone_number: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required.'],
    },
    join_date: {
      type: String,
      required: [true, 'Join date is required.'],
    },

    designation: {
      type: String,
      required: [true, 'Designation is required.'],
    },
    status: {
      type: String,
      required: [true, 'Status is required.'],
    },
    password: {
      type: String,
    },
    confirm_password: {
      type: String,
    },

    father_name: {
      type: String,
      required: [true, 'Father name is required.'],
    },
    mother_name: {
      type: String,
      required: [true, 'Mother name is required.'],
    },
    guardian_name: {
      type: String,
      required: [true, 'Guardian name is required.'],
    },
    guardian_country_code: {
      type: String,
    },
    guardian_contact: {
      type: String,
      required: [true, 'Guardian contact number is required.'],
    },
    guardian_full_contact: {
      type: String,
    },
    relationship: {
      type: String,
      required: [true, 'Relation with guardian is required.'],
    },
    nationality: {
      type: String,
      required: [true, 'Nationality is required.'],
    },
    religion: {
      type: String,
      required: [true, 'Religion is required.'],
    },
    country: {
      type: String,
      required: [true, 'Country is required.'],
    },
    city: {
      type: String,
      required: [true, 'City is required.'],
    },
    present_address: {
      type: String,
      required: [true, 'Present address is required.'],
    },
    permanent_address: {
      type: String,
      required: [true, 'Permanent address is required.'],
    },

    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

employeeSchema.pre('save', function (next) {
  // if (!this.password && !this.confirm_password) {
  //   return next(new Error('Please enter both password and confirm password'));
  // }
  if (this.password !== this.confirm_password) {
    return next(new Error('Passwords do not match'));
  }

  if (!this.isModified('password')) {
    return next();
  }

  bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds),
    (err: Error | undefined, hash: string) => {
      if (err) {
        return next(err);
      }
      this.password = hash;
      this.confirm_password = '';
      next();
    },
  );
});

employeeSchema.methods.comparePassword = function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Pre-save middleware to concatenate country_code and phone_number
employeeSchema.pre('save', function (next) {
  if (this.country_code && this.phone_number) {
    this.full_phone_number = `${this.country_code}${this.phone_number}`;
  } else {
    this.full_phone_number = '';
  }
  next();
});
employeeSchema.pre('save', function (next) {
  if (this.guardian_country_code && this.guardian_contact) {
    this.guardian_full_contact = `${this.guardian_country_code}${this.guardian_contact}`;
  } else {
    this.guardian_full_contact = '';
  }
  next();
});

// Pre-update middleware
employeeSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as Partial<TEmployee & { $set: Partial<TEmployee> }>;

  if (update) {
    if (update.$set) {
      const { country_code, phone_number } = update.$set;

      if (country_code && phone_number) {
        update.$set.full_phone_number = `${country_code}${phone_number}`;
      }
    } else if (update.country_code && update.phone_number) {
      update.full_phone_number = `${update.country_code}${update.phone_number}`;
    }
  }

  next();
});
employeeSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as Partial<TEmployee & { $set: Partial<TEmployee> }>;

  if (update) {
    if (update.$set) {
      const { guardian_country_code, guardian_contact } = update.$set;

      if (guardian_country_code && guardian_contact) {
        update.$set.guardian_full_contact = `${guardian_country_code}${guardian_contact}`;
      }
    } else if (update.guardian_country_code && update.guardian_contact) {
      update.guardian_full_contact = `${update.guardian_country_code}${update.guardian_contact}`;
    }
  }

  next();
});


employeeSchema.set('toJSON', {
  transform: function (_doc, ret) {
    delete ret.password;
    delete ret.confirm_password;
    return ret;
  },
});
export const Employee = mongoose.model<TEmployee>('Employee', employeeSchema);

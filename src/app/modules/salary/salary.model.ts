import mongoose, { Schema } from 'mongoose';
import { TSalary } from './salary.interface';

const salarySchema: Schema<TSalary> = new Schema<TSalary>(
  {
    employee: {
      type: Schema.ObjectId,
      required: [true, 'Employee is required.'],
      ref: 'Employee',
    },
    employeeId: {
      type: String,
    },
    full_name: {
      type: String,
    },
    month_of_salary: {
      type: String,
    },
    bonus: {
      type: Number,
    },
    total_overtime: {
      type: Number,
    },
    overtime_amount: {
      type: Number,
    },
    salary_amount: {
      type: Number,
    },
    previous_due: {
      type: Number,
    },
    cut_salary: {
      type: Number,
    },
    total_payment: {
      type: Number,
    },
    advance: {
      type: Number,
    },
    pay: {
      type: Number,
    },
    due: {
      type: Number,
    },
    paid: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

export const Salary = mongoose.model<TSalary>('Salary', salarySchema);

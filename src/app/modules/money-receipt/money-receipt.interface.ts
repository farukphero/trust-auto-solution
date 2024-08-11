import { Types } from 'mongoose';

export interface TMoneyReceipt {
  customer: Types.ObjectId;
  company: Types.ObjectId;
  showRoom: Types.ObjectId;
  vehicle: Types.ObjectId;

  Id: string;
  user_type: string;
  job_no: string;
  default_date: string;
  thanks_from: string;
  against_bill_no_method: string;
  full_reg_number: string;
  chassis_no: string;
  payment_method: string;
  payment_number: string;
  date_one: string;
  bank_number: number;
  date_two: string;
  total_amount: number;
  advance: number;
  remaining: number;
  taka_in_word: string;
}

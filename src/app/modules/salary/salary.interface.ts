import { Types } from 'mongoose';

export interface TSalary {
  employee: Types.ObjectId;
  employeeId: string;
  full_name: string;
  month_of_salary: string;
 
  bonus: number;
  total_overtime: number;
  overtime_amount: number;
  salary_amount: number;
  previous_due: number;
  cut_salary: number;
  total_payment: number;
  advance: number;
  pay: number;
  due: number;
  paid: number;
}

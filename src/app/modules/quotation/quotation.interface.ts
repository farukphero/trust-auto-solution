import { Types } from "mongoose";

export interface TQuotation {
  quotation_no: string;
  user_type: 'customer' | 'company' | 'showRoom';
  Id: string;

  job_no : string;
  date: string;
  customer : Types.ObjectId
  company : Types.ObjectId
  showRoom : Types.ObjectId
  vehicle : Types.ObjectId

  input_data: [
    {
      description: string;
      quantity: number;
      rate: number;
      total: number;
    },
  ];
  service_input_data: [
    {
      description: string;
      quantity: number;
      rate: number;
      total: number;
    },
  ];
  total_amount: number;
  parts_total: number;
  service_total: number;
  discount: number;
  vat: number;
  net_total: number;
}

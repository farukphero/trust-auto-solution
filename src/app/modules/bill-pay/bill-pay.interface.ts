import { Types } from 'mongoose';

export interface TBillPay {
  supplier: Types.ObjectId;
  supplierId: string;
  name: string;
  mobile_number: string;
  address: string;
  email: string;
  shop_name: string;
  against_bill: string;
  category: string;
  amount: number;
  payment_against_bill: string;
  paid_on: string;
  individual_markup: string;
  payment_method: string;

  transaction_no: string;
  transactionId: string;

  expense_note: string;

  selected_bank: string;
  bank_account_no: string;

  check_no: string;
  card_number: string;

  card_holder_name: string;
  card_transaction_no: string;
  card_type: string;
  month_first: string;
  year: string;
  month_second: string;
  security_code: string;
  image: string;
}

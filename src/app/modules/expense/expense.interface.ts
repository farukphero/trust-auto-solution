export interface TExpense {
  category: string;
  sub_category: string;
  expense_for: string;
  tax_application: string;

  expense_note_first: string;

  amount: string;
  paid_on: string;
  payment_individual_markup: string;
  payment_method: string;

  transaction_no: string;
  transactionId: string;

  expense_note: string;

  selected_bank: string;
  bank_account_no: string;
  card_number: string;

  // cash_expense_note: string;
  check_no: string;
  // check_expense_note: string;

  card_holder_name: string;
  card_transaction_no: string;
  card_type: string;
  month_first: string;
  year: string;
  month_second: string;
  security_code: string;

  // other_transaction_no: string;
  // other_transactionId: string;

  image: string;
}

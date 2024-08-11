 

export interface TPurchase {
  purchase_no: string;
  full_name: string;
  country_code: string;
  phone_number: string;
  full_phone_number: string;
  email: string;
  category: string;
  shop_name: string;
  country: string;
  city: string;
  state: string;
  image: string;

  input_data: [
    {
      description: string;
      quantity: number;
      rate: number;
      total: number;
    },
  ];

  total_amount: number;

  discount: number;
  vat: number;
  net_total: number;
}

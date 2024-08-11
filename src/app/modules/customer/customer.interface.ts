import { Types } from "mongoose";

 

export interface TCustomer {
    customerId: string;
    user_type: string;
    vehicles: Types.ObjectId[];  
    jobCards: Types.ObjectId[];  
    quotations: Types.ObjectId[];  
    invoices: Types.ObjectId[];  
    money_receipts: Types.ObjectId[];  
    company_name: string;
    vehicle_username: string;
    company_address: string;
    customer_name: string;
    customer_contact: string;
   
    customer_country_code: string;
    fullCustomerNum: string;
    customer_email: string;
    customer_address: string;
    driver_name: string;
    driver_contact: string;
    driver_country_code: string;
    reference_name: string;
    
    
  }
  
import express from 'express';
import { customerController } from './customer.controller';

const router = express.Router();

router
  .route('/')
  .post(customerController.createCustomer)
  .get(customerController.getAllCustomers);

router
  .route('/:id')
  .get(customerController.getSingleCustomerDetails)
  .put(customerController.updateCustomer)
  .delete(customerController.deleteCustomer);

export const CustomerRoutes = router;

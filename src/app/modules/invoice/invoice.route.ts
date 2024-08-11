import express from 'express';
import { invoiceController } from './invoice.controller';

const router = express.Router();

router
  .route('/')
  .post(invoiceController.createInvoice)
  .get(invoiceController.getAllInvoices);

router
  .route('/:id')
  .get(invoiceController.getSingleInvoice)
  .put(invoiceController.updateInvoice)
  .delete(invoiceController.deleteInvoice);
router
  .route('/remove-invoice')
  .patch(invoiceController.removeInvoiceFromUpdate);

export const InvoiceRoutes = router;

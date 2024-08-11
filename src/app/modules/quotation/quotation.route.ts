import express from 'express';
import { quotationController } from './quotation.controller';

const router = express.Router();

router
  .route('/')
  .post(quotationController.createQuotation)
  .get(quotationController.getAllQuotations);

router
  .route('/:id')
  .get(quotationController.getSingleQuotation)
  .put(quotationController.updateQuotation)
  .delete(quotationController.deleteQuotation);

  router
  .route('/remove-quotation')
  .patch(quotationController.removeQuotationFromUpdate);


export const QuotationRoutes = router;

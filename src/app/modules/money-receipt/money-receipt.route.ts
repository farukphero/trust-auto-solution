import express from 'express';
import { moneyReceiptController } from './money-receipt.controller';
import validateRequest from '../../middlewares/validateRequest';
import { moneyReceiptValidation } from './money-receipt.validation';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(moneyReceiptValidation.moneyReceiptValidationSchema),
    moneyReceiptController.createMoneyReceipt,
  )
  .get(moneyReceiptController.getAllMoneyReceipts);

router
  .route('/:id')
  .get(moneyReceiptController.getSingleMoneyReceipt)
  .put(moneyReceiptController.updateMoneyReceipt)
  .delete(moneyReceiptController.deleteMoneyReceipt);

export const MoneyReceiptRoutes = router;

import express from 'express';
import { purchaseController } from './purchase.controller';
import validateRequest from '../../middlewares/validateRequest';
import { purchaseValidation } from './purchase.validation';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(purchaseValidation.purchaseValidationSchema),
    purchaseController.createPurchase,
  )
  .get(purchaseController.getAllPurchases);

router
  .route('/:id')
  .get(purchaseController.getSinglePurchase)
  .put(purchaseController.updatePurchase)
  .delete(purchaseController.deletePurchase);

  router
  .route('/remove-purchase')
  .patch(purchaseController.removePurchaseFromUpdate);


export const PurchaseRoutes = router;

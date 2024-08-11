import express from 'express';
import { supplierController } from './supplier.controller';
import validateRequest from '../../middlewares/validateRequest';
import { supplierValidation } from './supplier.validation';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(supplierValidation.supplierValidationSchema),
    supplierController.createSupplier,
  )
  .get(supplierController.getAllSuppliers);

router
  .route('/:id')
  .get(supplierController.getSingleSupplier)
  .put(supplierController.updateSupplier)
  .delete(supplierController.deleteSupplier);

export const SupplierRoutes = router;

import express from 'express';

import validateRequest from '../../middlewares/validateRequest';
import { employeeController } from './employee.controller';
import { employeeValidation } from './employee.validation';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(employeeValidation.employeeValidationSchema),
    employeeController.createEmployee,
  )
  .get(employeeController.getAllEmployees);

router
  .route('/:id')
  .get(employeeController.getSingleEmployee)
  .put(employeeController.updateEmployee)
  .delete(employeeController.deleteEmployee);

export const EmployeeRoutes = router;

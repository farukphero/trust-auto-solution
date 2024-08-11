import express from 'express';
import { expenseController } from './expense.controller';
import validateRequest from '../../middlewares/validateRequest';
import { expenseValidation } from './expense.validation';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(expenseValidation.expenseValidationSchema),
    expenseController.createExpense,
  )
  .get(expenseController.getAllExpenses);


  router
  .route('/:id')
  .get(expenseController.getSingleExpense)
  .put(expenseController.updateExpense)
  .delete(expenseController.deleteExpense);


export const ExpenseRoutes = router;

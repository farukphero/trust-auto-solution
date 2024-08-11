import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ExpenseServices } from './expense.service';
 

const createExpense = catchAsync(async (req, res) => {
  const result = await ExpenseServices.createExpenseIntoDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Expense details added successful!',
    data: result,
  });
});
 
const getAllExpenses = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string);

  const searchTerm = req.query.searchTerm as string;

  const result = await ExpenseServices.getAllExpensesFromDB(
    limit,
    page,
    searchTerm,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Expenses are retrieved successful',
    data: result,
  });
});

 
const getSingleExpense = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await ExpenseServices.getSingleExpenseDetails(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Expense retrieved successful!',
    data: result,
  });
});

const updateExpense = catchAsync(async (req, res) => {
  const { id } = req.params;

  const service = await ExpenseServices.updateExpense(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Expense updated successful!',
    data: service,
  });
});
const deleteExpense = catchAsync(async (req, res) => {
  const { id } = req.params;

  const service = await ExpenseServices.deleteExpense(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Expense deleted successful!',
    data: service,
  });
});


export const expenseController = {
  createExpense,
  getAllExpenses,
  getSingleExpense,
  updateExpense,
  deleteExpense
};

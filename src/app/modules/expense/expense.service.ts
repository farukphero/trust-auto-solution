import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';

import { SearchableFields } from './expense.const';
import { TExpense } from './expense.interface';
import { Expense } from './expense.model';
import sanitizePayload from '../../middlewares/updateDataValidation';

const createExpenseIntoDB = async (payload: TExpense) => {
  const sanitizeData = sanitizePayload(payload);
  const expense = await Expense.create(sanitizeData);
  return expense;
};

const getAllExpensesFromDB = async (
  limit: number,
  page: number,
  searchTerm: string,
) => {
  let searchQuery = {};

  if (searchTerm) {
    const escapedFilteringData = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );

    const expenseSearchQuery = SearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    const amountCondition = !isNaN(Number(searchTerm))
      ? [{ amount: Number(searchTerm) }]
      : [];

    searchQuery = {
      $or: [...expenseSearchQuery, ...amountCondition],
    };
  }

  const expenses = await Expense.aggregate([
    {
      $match: searchQuery,
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  const totalData = await Expense.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalData / limit);

  return {
    expenses,
    meta: {
      totalPages,
    },
  };
};

const getSingleExpenseDetails = async (id: string) => {
  const singleExpense = await Expense.findById(id);

  if (!singleExpense) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No expense found');
  }

  return singleExpense;
};

const updateExpense = async (id: string, payload: TExpense) => {
  const sanitizedData = sanitizePayload(payload);
  const updatedExpense = await Expense.findByIdAndUpdate(
    id,
    {
      $set: sanitizedData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedExpense) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Expense not updated.');
  }

  return updatedExpense;
};

const deleteExpense = async (id: string) => {
  const expense = await Expense.findByIdAndDelete(id);

  if (!expense) {
    throw new AppError(StatusCodes.NOT_IMPLEMENTED, 'Expense not deleted.');
  }

  return null;
};

export const ExpenseServices = {
  createExpenseIntoDB,
  getAllExpensesFromDB,
  getSingleExpenseDetails,
  updateExpense,
  deleteExpense
};

import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { SearchableFields } from './bill-pay.const';
import sanitizePayload from '../../middlewares/updateDataValidation';
import { TBillPay } from './bill-pay.interface';
import { BillPay } from './bill-pay.model';
 

const createBillPayIntoDB = async (payload: TBillPay) => {
  const sanitizeData = sanitizePayload(payload);
  const bill = await BillPay.create(sanitizeData);
  return bill;
};

const getAllBillPaysFromDB = async (
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

    const billPaySearchQuery = SearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    const amountCondition = !isNaN(Number(searchTerm))
      ? [{ amount: Number(searchTerm) }]
      : [];

    searchQuery = {
      $or: [...billPaySearchQuery, ...amountCondition],
    };
  }

  const billPays = await BillPay.aggregate([
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

  const totalData = await BillPay.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalData / limit);

  return {
    billPays,
    meta: {
      totalPages,
    },
  };
};

const getSingleBillPayDetails = async (id: string) => {
  const singleBillPay = await BillPay.findById(id);

  if (!singleBillPay) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No bill pay found');
  }

  return singleBillPay;
};

const updateBillPay = async (id: string, payload: TBillPay) => {
  const sanitizedData = sanitizePayload(payload);
  const updatedBillPay = await BillPay.findByIdAndUpdate(
    id,
    {
      $set: sanitizedData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedBillPay) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Bill pay not updated.');
  }

  return updatedBillPay;
};

const deleteBillPay = async (id: string) => {
  const income = await BillPay.findByIdAndDelete(id);

  if (!income) {
    throw new AppError(StatusCodes.NOT_IMPLEMENTED, 'Bill pay not deleted.');
  }

  return null;
};

export const BillPayServices = {
  createBillPayIntoDB,
  getAllBillPaysFromDB,
  getSingleBillPayDetails,
  updateBillPay,
  deleteBillPay,
};

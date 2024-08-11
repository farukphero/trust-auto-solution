import mongoose, { Model } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import sanitizePayload from '../../middlewares/updateDataValidation';

import { TPurchase } from './purchase.interface';
import { Purchase } from './purchase.model';
import { generatePurchaseNo } from './purchase.utils';
import { SearchableFields } from './purchase.const';

const createPurchaseDetails = async (payload: TPurchase) => {
  const purchaseNo = await generatePurchaseNo();
  const quotationData = new Purchase({
    ...payload,
    purchase_no: purchaseNo,
  });

  const result = await quotationData.save();
  return result;
};

const getAllPurchasesFromDB = async (
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

    const purchaseSearchQuery = SearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    const amountCondition = !isNaN(Number(searchTerm))
      ? [{ amount: Number(searchTerm) }]
      : [];

    searchQuery = {
      $or: [...purchaseSearchQuery, ...amountCondition],
    };
  }

  const purchases = await Purchase.aggregate([
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

  const totalData = await Purchase.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalData / limit);

  return {
    purchases,
    meta: {
      totalPages,
    },
  };
};

const getSinglePurchaseDetails = async (id: string) => {
  const singlePurchase = await Purchase.findById(id);

  if (!singlePurchase) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No purchase found');
  }

  return singlePurchase;
};

const updatePurchase = async (id: string, payload: TPurchase) => {
  const sanitizedData = sanitizePayload(payload);
  const updatedPurchase = await Purchase.findByIdAndUpdate(
    id,
    {
      $set: sanitizedData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedPurchase) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Purchases not updated.');
  }

  return updatedPurchase;
};

const removePurchaseFromUpdate = async (id: string, index: number) => {
  const existingPurchase = await Purchase.findById(id);

  if (!existingPurchase) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No quotation exit.');
  }

  const updatePurchase = await Purchase.findByIdAndUpdate(
    existingPurchase._id,

    { $pull: { input_data: { $eq: existingPurchase.input_data[index] } } },

    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatePurchase) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No invoice found');
  }

  return updatePurchase;
};

const deletePurchase = async (id: string) => {
  const purchase = await Purchase.findByIdAndDelete(id);

  if (!purchase) {
    throw new AppError(StatusCodes.NOT_IMPLEMENTED, 'Purchase not deleted.');
  }

  return null;
};

export const PurchaseServices = {
  createPurchaseDetails,
  getAllPurchasesFromDB,
  getSinglePurchaseDetails,
  updatePurchase,
  deletePurchase,
  removePurchaseFromUpdate
};

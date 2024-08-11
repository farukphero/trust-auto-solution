import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import sanitizePayload from '../../middlewares/updateDataValidation';
import { SearchableFields, vehicleFields } from './supplier.const';
import { TSupplier } from './supplier.interface';
import { Supplier } from './supplier.model';
import { generateSupplierId } from './supplier.utils';

const createSupplierIntoDB = async (payload: TSupplier) => {
  const sanitizeData = sanitizePayload(payload);

  const supplierId = await generateSupplierId();
  const supplierData = new Supplier({
    ...sanitizeData,
    supplierId,
  });

  await supplierData.save();

  return null;
};

const getAllSuppliersFromDB = async (
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

    const supplierSearchQuery = SearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    searchQuery = {
      $or: [...supplierSearchQuery],
    };
  }

  const suppliers = await Supplier.aggregate([
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

  const totalData = await Supplier.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalData / limit);

  return {
    suppliers,
    meta: {
      totalPages,
    },
  };
};

const getSingleSupplierDetails = async (id: string) => {
  const singleSupplier = await Supplier.findById(id);

  if (!singleSupplier) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No supplier found');
  }

  return singleSupplier;
};
const updateSupplierIntoDB = async (id: string, payload: TSupplier) => {
  const sanitizeData = sanitizePayload(payload);

  const updateSupplier = await Supplier.findByIdAndUpdate(
    id,
    {
      $set: sanitizeData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updateSupplier) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No supplier found');
  }

  return updateSupplier;
};

 

const deleteSupplier = async (id: string) => {
  const supplier = await Supplier.findByIdAndDelete(id);

  if (!supplier) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No supplier available');
  }

  return null;
};

export const SupplierServices = {
  createSupplierIntoDB,
  getAllSuppliersFromDB,
  getSingleSupplierDetails,
  updateSupplierIntoDB,
  deleteSupplier,
};

import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import sanitizePayload from '../../middlewares/updateDataValidation';
import { TMoneyReceipt } from './money-receipt.interface';
import { MoneyReceipt } from './money-receipt.model';
import { Customer } from '../customer/customer.model';
import { Company } from '../company/company.model';
import { ShowRoom } from '../showRoom/showRoom.model';
import mongoose, { Model } from 'mongoose';
import { Vehicle } from '../vehicle/vehicle.model';
import { SearchableFields  } from './money-receipt.const';

const createMoneyReceiptDetails = async (payload: TMoneyReceipt) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { user_type, Id, chassis_no, full_reg_number } = payload;

    const sanitizeData = sanitizePayload(payload);
    const moneyReceiptData = new MoneyReceipt({
      ...sanitizeData,
    });

    if (user_type === 'customer') {
      const existingCustomer = await Customer.findOne({
        customerId: Id,
      }).session(session);
      if (existingCustomer) {
        await Customer.findByIdAndUpdate(
          existingCustomer._id,
          {
            $push: { money_receipts: moneyReceiptData._id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
        moneyReceiptData.customer = existingCustomer._id;
      }
    } else if (user_type === 'company') {
      const existingCompany = await Company.findOne({
        companyId: Id,
      }).session(session);
      if (existingCompany) {
        await Company.findByIdAndUpdate(
          existingCompany._id,
          {
            $push: { money_receipts: moneyReceiptData._id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
        moneyReceiptData.company = existingCompany._id;
      }
    } else if (user_type === 'showRoom') {
      const existingShowRoom = await ShowRoom.findOne({
        showRoomId: Id,
      }).session(session);
      if (existingShowRoom) {
        await ShowRoom.findByIdAndUpdate(
          existingShowRoom._id,
          {
            $push: { money_receipts: moneyReceiptData._id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
        moneyReceiptData.showRoom = existingShowRoom._id;
      }
    }

    if (chassis_no) {
      const vehicleData = await Vehicle.findOne({ chassis_no });

      if (vehicleData) {
        moneyReceiptData.vehicle = vehicleData._id;
        moneyReceiptData.full_reg_number = full_reg_number;
        await moneyReceiptData.save({ session });
      }
    }

    await moneyReceiptData.save({ session });

    await session.commitTransaction();
    session.endSession();
    return null;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllMoneyReceiptsFromDB = async (
  id: string | null, // id is optional
  limit: number,
  page: number,
  searchTerm: string,
) => {
  let idMatchQuery: any = {};
  let searchQuery: any = {};

  // If id is provided, filter by the id
  if (id) {
    idMatchQuery = {
      $or: [
        { 'customer._id': new mongoose.Types.ObjectId(id) },
        { 'company._id': new mongoose.Types.ObjectId(id) },
        { 'vehicle._id': new mongoose.Types.ObjectId(id) },
        { 'showRoom._id': new mongoose.Types.ObjectId(id) },
      ],
    };
  }

  // If a search term is provided, apply regex filtering
  if (searchTerm) {
    const escapedFilteringData = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );

    const moneyReceiptSearchQuery = SearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    const amountCondition = !isNaN(Number(searchTerm))
      ? [{ total_amount: Number(searchTerm) }]
      : [];
    const payableAmountCondition = !isNaN(Number(searchTerm))
      ? [{ remaining: Number(searchTerm) }]
      : [];

    searchQuery = {
      $or: [
        ...moneyReceiptSearchQuery,
        ...amountCondition,
        ...payableAmountCondition,
      ],
    };
  }

  // Construct the aggregation pipeline
  const moneyReceipts = await MoneyReceipt.aggregate([
    {
      $match: id ? idMatchQuery : {}, // Apply id filtering if id exists
    },
    {
      $match: searchQuery, // Apply search term filtering
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

  // Calculate total data count
  const totalData = await MoneyReceipt.countDocuments({
    $and: [
      idMatchQuery,
      searchQuery,
    ],
  });

  const totalPages = Math.ceil(totalData / limit);

  return {
    moneyReceipts,
    meta: {
      totalPages,
      currentPage: page,
    },
  };
};


const getSingleMoneyReceiptDetails = async (id: string) => {
  const singleMoneyReceipt = await MoneyReceipt.findById(id).populate("vehicle");

  if (!singleMoneyReceipt) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No money receipt found');
  }

  return singleMoneyReceipt;
};

const updateMoneyReceiptDetails = async (
  id: string,
  payload: TMoneyReceipt,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { user_type, Id, chassis_no, full_reg_number } = payload;

    const sanitizeData = sanitizePayload(payload);
    const moneyReceiptData = await MoneyReceipt.findByIdAndUpdate(
      id,
      {
        $set: sanitizeData,
      },
      {
        new: true,
        runValidators: true,
        session,
      },
    );

    if (!moneyReceiptData) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Money receipt not found.');
    }

    // Check if the money receipt is already associated with a customer
    if (user_type === 'customer') {
      const existingCustomer = await Customer.findOne({
        customerId: Id,
      }).session(session);
      if (existingCustomer) {
        // Check if the receipt is already in the customer's money_receipts
        if (!existingCustomer.money_receipts.includes(moneyReceiptData._id)) {
          await Customer.findByIdAndUpdate(
            existingCustomer._id,
            {
              $push: { money_receipts: moneyReceiptData._id },
            },
            {
              new: true,
              runValidators: true,
              session,
            },
          );
        }
        moneyReceiptData.customer = existingCustomer._id;
      }
    } else if (user_type === 'company') {
      const existingCompany = await Company.findOne({
        companyId: Id,
      }).session(session);
      if (existingCompany) {
        // Check if the receipt is already in the company's money_receipts
        if (!existingCompany.money_receipts.includes(moneyReceiptData._id)) {
          await Company.findByIdAndUpdate(
            existingCompany._id,
            {
              $push: { money_receipts: moneyReceiptData._id },
            },
            {
              new: true,
              runValidators: true,
              session,
            },
          );
        }
        moneyReceiptData.company = existingCompany._id;
      }
    } else if (user_type === 'showRoom') {
      const existingShowRoom = await ShowRoom.findOne({
        showRoomId: Id,
      }).session(session);
      if (existingShowRoom) {
        // Check if the receipt is already in the showroom's money_receipts
        if (!existingShowRoom.money_receipts.includes(moneyReceiptData._id)) {
          await ShowRoom.findByIdAndUpdate(
            existingShowRoom._id,
            {
              $push: { money_receipts: moneyReceiptData._id },
            },
            {
              new: true,
              runValidators: true,
              session,
            },
          );
        }
        moneyReceiptData.showRoom = existingShowRoom._id;
      }
    }

    // Update vehicle information if chassis_no is provided
    if (chassis_no) {
      const vehicleData = await Vehicle.findOne({ chassis_no }).session(
        session,
      );
      if (vehicleData) {
        moneyReceiptData.vehicle = vehicleData._id;
        moneyReceiptData.full_reg_number = full_reg_number;
      }
    }

    await moneyReceiptData.save({ session });

    await session.commitTransaction();
    session.endSession();
    return null;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const deleteMoneyReceipt = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingMoneyReceipt =
      await MoneyReceipt.findById(id).session(session);

    if (!existingMoneyReceipt) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Money receipt not available.');
    }

    type UserType = 'customer' | 'company' | 'showRoom';
    type UserMap = {
      [key in UserType]: {
        model: Model<any>;
        queryKey: string;
      };
    };

    const userTypeMap: UserMap = {
      customer: {
        model: Customer,
        queryKey: 'customerId',
      },
      company: {
        model: Company,
        queryKey: 'companyId',
      },
      showRoom: {
        model: ShowRoom,
        queryKey: 'showRoomId',
      },
    };

    const userTypeHandler =
      userTypeMap[existingMoneyReceipt.user_type as UserType];
    if (userTypeHandler) {
      const { model, queryKey } = userTypeHandler;
      const existingEntity = await model
        .findOne({ [queryKey]: existingMoneyReceipt.Id })
        .session(session);
      if (existingEntity) {
        await model.findByIdAndUpdate(
          existingEntity._id,
          {
            $pull: { money_receipts: id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
      }
    }

    const deleteMoneyReceipt = await MoneyReceipt.findByIdAndDelete(
      existingMoneyReceipt._id,
    ).session(session);
    if (!deleteMoneyReceipt) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No money receipt available');
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }

  return null;
};

export const MoneyReceiptServices = {
  createMoneyReceiptDetails,
  getAllMoneyReceiptsFromDB,
  getSingleMoneyReceiptDetails,
  updateMoneyReceiptDetails,
  deleteMoneyReceipt,
};

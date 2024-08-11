import mongoose from 'mongoose';
import { generateCustomerId } from './customer.utils';
import { Customer } from './customer.model';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import sanitizePayload from '../../middlewares/updateDataValidation';

import { Vehicle } from '../vehicle/vehicle.model';
import { TCustomer } from './customer.interface';
import { TVehicle } from '../vehicle/vehicle.interface';
import { CustomerSearchableFields, vehicleFields } from './customer.const';

const createCustomerDetails = async (payload: {
  customer: TCustomer;
  vehicle: TVehicle;
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customer, vehicle } = payload;

    const customerId = await generateCustomerId();

    // Create and save the customer
    const sanitizeData = sanitizePayload(customer);

    const customerData = new Customer({
      ...sanitizeData,
      customerId,
    });
    const savedCustomer = await customerData.save({ session });

    if (
      savedCustomer.user_type &&
      savedCustomer.user_type === 'customer' &&
      vehicle
    ) {
      const sanitizeData = sanitizePayload(vehicle);

      const vehicleData = new Vehicle({
        ...sanitizeData,
        customer: savedCustomer._id,
        Id: savedCustomer.customerId,
        user_type: savedCustomer.user_type,
      });
      if (!vehicleData.company) {
        vehicleData.company = undefined; // Ensure no null value
      }

      if (!vehicleData.showRoom) {
        vehicleData.showRoom = undefined; // Ensure no null value
      }

      await vehicleData.save({ session });

      savedCustomer.vehicles.push(vehicleData._id);

      await savedCustomer.save({ session });
    } else {
      throw new AppError(StatusCodes.CONFLICT, 'Something went wrong');
    }

    await session.commitTransaction();
    session.endSession();

    return null;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

const getAllCustomersFromDB = async (
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

    const customerSearchQuery = CustomerSearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    const vehicleSearchQuery = vehicleFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    searchQuery = {
      $or: [...customerSearchQuery, ...vehicleSearchQuery],
    };
  }

  const customers = await Customer.aggregate([
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicles',
        foreignField: '_id',
        as: 'vehicles',
      },
    },
    {
      $lookup: {
        from: 'quotations',
        localField: 'quotations',
        foreignField: '_id',
        as: 'quotations',
      },
    },
    {
      $lookup: {
        from: 'invoices',
        localField: 'invoices',
        foreignField: '_id',
        as: 'invoices',
      },
    },
    {
      $lookup: {
        from: 'money_receipts',
        localField: 'money_receipts',
        foreignField: '_id',
        as: 'money_receipts',
      },
    },
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

  const totalData = await Customer.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalData / limit);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return {
    customers,
    meta: {
      totalData,
      totalPages,
      currentPage: page,
      pageNumbers,
    },
  };
};

const getSingleCustomerDetails = async (id: string) => {
  const singleCustomer = await Customer.findById(id)
    .populate('jobCards')
    .populate({
      path: 'quotations',
      populate: { path: 'vehicle' },
    })
    .populate({
      path: 'invoices',
      populate: { path: 'vehicle' },
    })
    .populate('money_receipts')
    .populate({
      path: 'vehicles',
    })
    .exec();

  if (!singleCustomer) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No customer found');
  }

  return singleCustomer;
};

const updateCustomer = async (
  id: string,
  payload: {
    customer: Partial<TCustomer>;
    vehicle: Partial<TVehicle>;
  },
) => {
  const { customer, vehicle } = payload;

  // Start a session for transaction management
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sanitizedCustomerData = sanitizePayload(customer);
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      {
        $set: sanitizedCustomerData,
      },
      {
        new: true,
        runValidators: true,
        session, // use session for transaction
      },
    );

    if (!updatedCustomer) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No customer available');
    }

    if (vehicle.chassis_no) {
      const sanitizedVehicleData = sanitizePayload(vehicle);

      const existingVehicle = await Vehicle.findOne({
        chassis_no: vehicle.chassis_no,
      }).session(session);

      if (existingVehicle) {
        await Vehicle.findByIdAndUpdate(
          existingVehicle._id,
          {
            $set: sanitizedVehicleData,
          },
          {
            new: true,
            runValidators: true,
            session, // use session for transaction
          },
        );
      } else {
        const newVehicle = new Vehicle({
          ...sanitizedVehicleData,
          customer: updatedCustomer._id,
          Id: updatedCustomer.customerId,
          user_type: updatedCustomer.user_type,
        });

        await newVehicle.save({ session });

        updatedCustomer.vehicles.push(newVehicle._id);

        await updatedCustomer.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return updatedCustomer;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const deleteCustomer = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingCustomer = await Customer.findById(id).session(session);
    if (!existingCustomer) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No customer exist.');
    }

    const vehicle = await Vehicle.deleteMany({
      Id: existingCustomer.customerId,
    }).session(session);

    const customer = await Customer.findByIdAndDelete(
      existingCustomer._id,
    ).session(session);

    if (!customer || !vehicle) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No customer available');
    }

    await session.commitTransaction();
    session.endSession();

    return null;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const CustomerServices = {
  createCustomerDetails,
  getAllCustomersFromDB,
  getSingleCustomerDetails,
  deleteCustomer,
  updateCustomer,
};

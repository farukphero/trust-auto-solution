import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import sanitizePayload from '../../middlewares/updateDataValidation';
import {
  companyFields,
  customerFields,
  invoiceSearchableFields,
  showRoomFields,
  vehicleFields,
} from './invoice.const';
import { TInvoice } from './invoice.interface';
import { Invoice } from './invoice.model';
import { TCustomer } from '../customer/customer.interface';
import { TCompany } from '../company/company.interface';
import { TShowRoom } from '../showRoom/showRoom.interface';
import { TVehicle } from '../vehicle/vehicle.interface';
import mongoose from 'mongoose';
import { Customer } from '../customer/customer.model';
import { Company } from '../company/company.model';
import { ShowRoom } from '../showRoom/showRoom.model';
import { Vehicle } from '../vehicle/vehicle.model';
import { Model } from 'mongoose';
import { generateInvoiceNo } from './invoice.utils';

const createInvoiceDetails = async (payload: {
  customer: TCustomer;
  company: TCompany;
  showroom: TShowRoom;
  vehicle: TVehicle;
  invoice: TInvoice;
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { customer, company, showroom, invoice, vehicle } = payload;

    const sanitizeCustomer = sanitizePayload(customer);
    const sanitizeCompany = sanitizePayload(company);
    const sanitizeShowroom = sanitizePayload(showroom);
    const sanitizeVehicle = sanitizePayload(vehicle);
    const sanitizeInvoice = sanitizePayload(invoice);

    const invoiceNumber = await generateInvoiceNo();

    const invoiceData = new Invoice({
      ...sanitizeInvoice,
      invoice_no: invoiceNumber,
    });

    await invoiceData.save({ session });

    if (invoice.user_type === 'customer') {
      const existingCustomer = await Customer.findOne({
        customerId: invoice.Id,
      }).session(session);

      if (existingCustomer) {
        await Customer.findByIdAndUpdate(
          existingCustomer._id,
          {
            $set: sanitizeCustomer,
            $push: { invoices: invoiceData._id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
        invoiceData.customer = existingCustomer._id;
        await invoiceData.save({ session });
      }
    } else if (invoice.user_type === 'company') {
      const existingCompany = await Company.findOne({
        companyId: invoice.Id,
      }).session(session);
      if (existingCompany) {
        await Company.findByIdAndUpdate(
          existingCompany._id,
          {
            $set: sanitizeCompany,
            $push: { invoices: invoiceData._id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
        invoiceData.company = existingCompany._id;
        await invoiceData.save({ session });
      }
    } else if (invoice.user_type === 'showRoom') {
      const existingShowRoom = await ShowRoom.findOne({
        showRoomId: invoice.Id,
      }).session(session);
      if (existingShowRoom) {
        await ShowRoom.findByIdAndUpdate(
          existingShowRoom._id,
          {
            $set: sanitizeShowroom,
            $push: { invoices: invoiceData._id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
        invoiceData.showRoom = existingShowRoom._id;
        await invoiceData.save({ session });
      }
    }

    if (vehicle && vehicle.chassis_no) {
      const vehicleData = await Vehicle.findOneAndUpdate(
        { chassis_no: vehicle.chassis_no },
        { $set: sanitizeVehicle },
        {
          new: true,
          runValidators: true,
          session,
        },
      );
      if (vehicleData) {
        invoiceData.vehicle = vehicleData._id;
        await invoiceData.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();
    return invoiceData;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllInvoicesFromDB = async (
  id: string | null,  
  limit: number,
  page: number,
  searchTerm: string,
) => {
  let idMatchQuery: any = {};
  let searchQuery: any = {};

   
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

   
  if (searchTerm) {
    const escapedFilteringData = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );

    const invoiceSearchQuery = invoiceSearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    const vehicleSearchQuery = vehicleFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));
    const customerSearchQuery = customerFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));
    const companySearchQuery = companyFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));
    const showRoomSearchQuery = showRoomFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    searchQuery = {
      $or: [
        ...invoiceSearchQuery,
        ...vehicleSearchQuery,
        ...customerSearchQuery,
        ...companySearchQuery,
        ...showRoomSearchQuery,
      ],
    };
  }

  // Construct the aggregation pipeline
  const invoices = await Invoice.aggregate([
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicle',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    {
      $unwind: {
        path: '$vehicle',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'company',
      },
    },
    {
      $unwind: {
        path: '$company',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
      },
    },
    {
      $unwind: {
        path: '$customer',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'showrooms',
        localField: 'showRoom',
        foreignField: '_id',
        as: 'showRoom',
      },
    },
    {
      $unwind: {
        path: '$showRoom',
        preserveNullAndEmptyArrays: true,
      },
    },
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
  const totalData = await Invoice.countDocuments({
    $and: [
      idMatchQuery,
      searchQuery,
    ],
  });

  const totalPages = Math.ceil(totalData / limit);

  return {
    invoices,
    meta: {
      totalPages,
      currentPage: page,
    },
  };
};

const getSingleInvoiceDetails = async (id: string) => {
  const singleInvoice = await Invoice.findById(id)
    .populate('customer')
    .populate('company')
    .populate('showRoom')
    .populate('vehicle');

  if (!singleInvoice) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No Invoice found');
  }

  return singleInvoice;
};

const updateInvoiceIntoDB = async (
  id: string,
  payload: {
    customer: TCustomer;
    company: TCompany;
    showroom: TShowRoom;
    vehicle: TVehicle;
    invoice: TInvoice;
  },
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { customer, company, showroom, invoice, vehicle } = payload;

    const sanitizeCustomer = sanitizePayload(customer);
    const sanitizeCompany = sanitizePayload(company);
    const sanitizeShowroom = sanitizePayload(showroom);
    const sanitizeVehicle = sanitizePayload(vehicle);
    const sanitizeInvoice = sanitizePayload(invoice);

    const updateInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        $set: sanitizeInvoice,
      },
      {
        new: true,
        runValidators: true,
        session,
      },
    );

    if (!updateInvoice) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No invoice found');
    }

    if (invoice.user_type === 'customer') {
      const existingCustomer = await Customer.findOne({
        customerId: invoice.Id,
      }).session(session);

      if (existingCustomer) {
        await Customer.findByIdAndUpdate(
          existingCustomer._id,
          {
            $set: sanitizeCustomer,
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
      }
    } else if (invoice.user_type === 'company') {
      const existingCompany = await Company.findOne({
        companyId: invoice.Id,
      }).session(session);

      if (existingCompany) {
        await Company.findByIdAndUpdate(
          existingCompany._id,
          {
            $set: sanitizeCompany,
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
      }
    } else if (invoice.user_type === 'showRoom') {
      const existingShowRoom = await ShowRoom.findOne({
        showRoomId: invoice.Id,
      }).session(session);

      if (existingShowRoom) {
        await ShowRoom.findByIdAndUpdate(
          existingShowRoom._id,
          {
            $set: sanitizeShowroom,
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
      }
    }

    if (vehicle && vehicle.chassis_no) {
      await Vehicle.findOneAndUpdate(
        {
          chassis_no: vehicle.chassis_no,
        },
        {
          $set: sanitizeVehicle,
        },
        {
          new: true,
          runValidators: true,
          session,
        },
      );
    }

    await session.commitTransaction();
    session.endSession();
    return updateInvoice;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const removeInvoiceFromUpdate = async (
  id: string,
  index: number,
  invoice_name: string,
) => {
  const existingInvoice = await Invoice.findById(id);

  if (!existingInvoice) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No invoice exit.');
  }

  let updateInvoice;

  if (invoice_name === 'parts') {
    updateInvoice = await Invoice.findByIdAndUpdate(
      existingInvoice._id,

      { $pull: { input_data: { $eq: existingInvoice.input_data[index] } } },

      {
        new: true,
        runValidators: true,
      },
    );
  }
  if (invoice_name === 'service') {
    updateInvoice = await Invoice.findByIdAndUpdate(
      existingInvoice._id,

      {
        $pull: {
          service_input_data: {
            $eq: existingInvoice.service_input_data[index],
          },
        },
      },

      {
        new: true,
        runValidators: true,
      },
    );
  }

  if (!updateInvoice) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No invoice found');
  }

  return updateInvoice;
};

const deleteInvoice = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingInvoice = await Invoice.findById(id).session(session);

    if (!existingInvoice) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not available.');
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

    const userTypeHandler = userTypeMap[existingInvoice.user_type as UserType];
    if (userTypeHandler) {
      const { model, queryKey } = userTypeHandler;
      const existingEntity = await model
        .findOne({ [queryKey]: existingInvoice.Id })
        .session(session);
      if (existingEntity) {
        await model.findByIdAndUpdate(
          existingEntity._id,
          {
            $pull: { invoices: id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
      }
    }

    const deletedInvoice = await Invoice.findByIdAndDelete(
      existingInvoice._id,
    ).session(session);
    if (!deletedInvoice) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No invoice available');
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

export const InvoiceServices = {
  createInvoiceDetails,
  getAllInvoicesFromDB,
  getSingleInvoiceDetails,
  updateInvoiceIntoDB,
  deleteInvoice,
  removeInvoiceFromUpdate,
};

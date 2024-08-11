import mongoose, { Model } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import sanitizePayload from '../../middlewares/updateDataValidation';
import {
  companyFields,
  customerFields,
  QuotationSearchableFields,
  showRoomFields,
  vehicleFields,
} from './quotation.const';
import { TQuotation } from './quotation.interface';
import { Quotation } from './quotation.model';
import { TCustomer } from '../customer/customer.interface';
import { TCompany } from '../company/company.interface';
import { TShowRoom } from '../showRoom/showRoom.interface';
import { Customer } from '../customer/customer.model';
import { Company } from '../company/company.model';
import { ShowRoom } from '../showRoom/showRoom.model';
import { TVehicle } from '../vehicle/vehicle.interface';
import { Vehicle } from '../vehicle/vehicle.model';
import { generateQuotationNo } from './quotation.utils';

const createQuotationDetails = async (payload: {
  customer: TCustomer;
  company: TCompany;
  showroom: TShowRoom;
  quotation: TQuotation;
  vehicle: TVehicle;
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { customer, company, showroom, quotation, vehicle } = payload;

    const sanitizeCustomer = sanitizePayload(customer);
    const sanitizeCompany = sanitizePayload(company);
    const sanitizeShowroom = sanitizePayload(showroom);
    const sanitizeQuotation = sanitizePayload(quotation);
    const sanitizeVehicle = sanitizePayload(vehicle);

    const quotationNumber = await generateQuotationNo();

    const quotationData = new Quotation({
      ...sanitizeQuotation,
      quotation_no: quotationNumber,
    });

    await quotationData.save({ session });

    if (quotation.user_type === 'customer') {
      const existingCustomer = await Customer.findOne({
        customerId: quotation.Id,
      }).session(session);
      if (existingCustomer) {
        await Customer.findByIdAndUpdate(
          existingCustomer._id,
          {
            $set: sanitizeCustomer,
            $push: { quotations: quotationData._id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
        quotationData.customer = existingCustomer._id;
        await quotationData.save({ session });
      }
    } else if (quotation.user_type === 'company') {
      const existingCompany = await Company.findOne({
        companyId: quotation.Id,
      }).session(session);
      if (existingCompany) {
        await Company.findByIdAndUpdate(
          existingCompany._id,
          {
            $set: sanitizeCompany,
            $push: { quotations: quotationData._id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
        quotationData.company = existingCompany._id;
        await quotationData.save({ session });
      }
    } else if (quotation.user_type === 'showRoom') {
      const existingShowRoom = await ShowRoom.findOne({
        showRoomId: quotation.Id,
      }).session(session);
      if (existingShowRoom) {
        await ShowRoom.findByIdAndUpdate(
          existingShowRoom._id,
          {
            $set: sanitizeShowroom,
            $push: { quotations: quotationData._id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
        quotationData.showRoom = existingShowRoom._id;
        await quotationData.save({ session });
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
        quotationData.vehicle = vehicleData._id;
        await quotationData.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();
    return quotationData;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllQuotationsFromDB = async (
  id: string | null, // id is optional
  limit: number,
  page: number,
  searchTerm: string,
) => {
  let idMatchQuery: any = {};
  let searchQuery: any = {};

  // If id is provided, filter by the id in customer, company, vehicle, or showRoom
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

    const quotationSearchQuery = QuotationSearchableFields.map((field) => ({
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
        ...quotationSearchQuery,
        ...vehicleSearchQuery,
        ...customerSearchQuery,
        ...companySearchQuery,
        ...showRoomSearchQuery,
      ],
    };
  }

  // Construct the aggregation pipeline
  const quotations = await Quotation.aggregate([
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
  const totalData = await Quotation.countDocuments({
    $and: [idMatchQuery, searchQuery],
  });

  const totalPages = Math.ceil(totalData / limit);

  return {
    quotations,
    meta: {
      totalPages,
       
    },
  };
};

const getSingleQuotationDetails = async (id: string) => {
  const singleQuotation = await Quotation.findById(id)
    .populate('customer')
    .populate('company')
    .populate('showRoom')
    .populate('vehicle');

  if (!singleQuotation) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No quotation found');
  }

  return singleQuotation;
};

const updateQuotationIntoDB = async (
  id: string,
  payload: {
    customer: TCustomer;
    company: TCompany;
    showroom: TShowRoom;
    quotation: TQuotation;
    vehicle: TVehicle;
  },
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { customer, company, showroom, quotation, vehicle } = payload;

    const sanitizeCustomer = sanitizePayload(customer);
    const sanitizeCompany = sanitizePayload(company);
    const sanitizeShowroom = sanitizePayload(showroom);
    const sanitizeQuotation = sanitizePayload(quotation);
    const sanitizeVehicle = sanitizePayload(vehicle);

    const updateQuotation = await Quotation.findByIdAndUpdate(
      id,
      {
        $set: sanitizeQuotation,
      },
      {
        new: true,
        runValidators: true,
        session,
      },
    );

    if (!updateQuotation) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No quotation found');
    }

    if (quotation.user_type === 'customer') {
      const existingCustomer = await Customer.findOne({
        customerId: quotation.Id,
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
    } else if (quotation.user_type === 'company') {
      const existingCompany = await Company.findOne({
        companyId: quotation.Id,
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
    } else if (quotation.user_type === 'showRoom') {
      const existingShowRoom = await ShowRoom.findOne({
        showRoomId: quotation.Id,
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
    return updateQuotation;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const removeQuotationFromUpdate = async (
  id: string,
  index: number,
  quotation_name: string,
) => {
  const existingQuotation = await Quotation.findById(id);

  if (!existingQuotation) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No quotation exit.');
  }

  let updateQuotation;

  if (quotation_name === 'parts') {
    updateQuotation = await Quotation.findByIdAndUpdate(
      existingQuotation._id,

      { $pull: { input_data: { $eq: existingQuotation.input_data[index] } } },

      {
        new: true,
        runValidators: true,
      },
    );
  }
  if (quotation_name === 'service') {
    updateQuotation = await Quotation.findByIdAndUpdate(
      existingQuotation._id,

      {
        $pull: {
          service_input_data: {
            $eq: existingQuotation.service_input_data[index],
          },
        },
      },

      {
        new: true,
        runValidators: true,
      },
    );
  }

  if (!updateQuotation) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No invoice found');
  }

  return updateQuotation;
};

const deleteQuotation = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingQuotation = await Quotation.findById(id).session(session);

    if (!existingQuotation) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Quotation not available.');
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
      userTypeMap[existingQuotation.user_type as UserType];
    if (userTypeHandler) {
      const { model, queryKey } = userTypeHandler;
      const existingEntity = await model
        .findOne({ [queryKey]: existingQuotation.Id })
        .session(session);
      if (existingEntity) {
        await model.findByIdAndUpdate(
          existingEntity._id,
          {
            $pull: { quotations: id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
      }
    }

    const deletedQuotation = await Quotation.findByIdAndDelete(
      existingQuotation._id,
    ).session(session);
    if (!deletedQuotation) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No quotation available');
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

export const QuotationServices = {
  createQuotationDetails,
  getAllQuotationsFromDB,
  getSingleQuotationDetails,
  updateQuotationIntoDB,
  deleteQuotation,
  removeQuotationFromUpdate,
};

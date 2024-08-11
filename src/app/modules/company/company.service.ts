import mongoose from 'mongoose';
import { generateCompanyId } from './company.utils';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import sanitizePayload from '../../middlewares/updateDataValidation';
import { Vehicle } from '../vehicle/vehicle.model';
import { TVehicle } from '../vehicle/vehicle.interface';
import { CompanySearchableFields, vehicleFields } from './company.const';
import { TCompany } from './company.interface';
import { Company } from './company.model';

const createCompanyDetails = async (payload: {
  company: TCompany;
  vehicle: TVehicle;
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { company, vehicle } = payload;

    const companyId = await generateCompanyId();

    // Create and save the customer
    const sanitizeData = sanitizePayload(company);

    const companyData = new Company({
      ...sanitizeData,
      companyId,
    });

    const savedCompany = await companyData.save({ session });

    if (
      savedCompany.user_type &&
      savedCompany.user_type === 'company' &&
      vehicle
    ) {
      const sanitizeData = sanitizePayload(vehicle);

      const vehicleData = new Vehicle({
        ...sanitizeData,
        company: savedCompany._id,
        Id: savedCompany.companyId,
        user_type: savedCompany.user_type,
      });
      if (!vehicleData.customer) {
        vehicleData.customer = undefined; // Ensure no null value
      }

      if (!vehicleData.showRoom) {
        vehicleData.showRoom = undefined; // Ensure no null value
      }

      await vehicleData.save({ session });

      savedCompany.vehicles.push(vehicleData._id);

      await savedCompany.save({ session });
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

const getAllCompanyFromDB = async (
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

    const companySearchQuery = CompanySearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    const vehicleSearchQuery = vehicleFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    searchQuery = {
      $or: [...companySearchQuery, ...vehicleSearchQuery],
    };
  }

  const companies = await Company.aggregate([
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicles',
        foreignField: '_id',
        as: 'vehicles',
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
    // {
    //   $project: {
    //     _id: 1,
    //     companyId: 1,
    //     company_name: 1,
    //     company_contact: 1,
    //     fullCompanyNum: 1,

    //     vehicles: {
    //       $map: {
    //         input: '$vehicles',
    //         as: 'vehicle',
    //         in: {
    //           vehicle_name: '$$vehicle.vehicle_name',
    //           fullRegNum: '$$vehicle.fullRegNum',
    //           createdAt: '$$vehicle.createdAt',
    //         },
    //       },
    //     },
    //   },
    // },
  ]);

  const totalData = await Company.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalData / limit);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return {
    companies,
    meta: {
      totalData,
      totalPages,
      currentPage: page,
      pageNumbers,
    },
  };
};

const getSingleCompanyDetails = async (id: string) => {
  const singleCompany = await Company.findById(id)
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

  if (!singleCompany) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No company found');
  }

  return singleCompany;
};

const updateCompany = async (
  id: string,
  payload: {
    company: Partial<TCompany>;
    vehicle: Partial<TVehicle>;
  },
) => {
  const { company, vehicle } = payload;

  // Start a session for transaction management
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sanitizedCompanyData = sanitizePayload(company);
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      {
        $set: sanitizedCompanyData,
      },
      {
        new: true,
        runValidators: true,
        session, // use session for transaction
      },
    );

    if (!updatedCompany) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No company available');
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
          company: updatedCompany._id,
          Id: updatedCompany.companyId,
          user_type: updatedCompany.user_type,
        });

        await newVehicle.save({ session });

        updatedCompany.vehicles.push(newVehicle._id);

        await updatedCompany.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return updatedCompany;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const deleteCompany = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingCompany = await Company.findById(id).session(session);
    if (!existingCompany) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No company exist.');
    }

    const vehicle = await Vehicle.deleteMany({
      Id: existingCompany.companyId,
    }).session(session);

    const customer = await Company.findByIdAndDelete(
      existingCompany._id,
    ).session(session);

    if (!customer || !vehicle) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No company available');
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

export const CompanyServices = {
  createCompanyDetails,
  getAllCompanyFromDB,
  getSingleCompanyDetails,
  deleteCompany,
  updateCompany,
};

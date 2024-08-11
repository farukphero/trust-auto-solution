import mongoose from 'mongoose';
import { generateShowRoomId } from './showRoom.utils';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import sanitizePayload from '../../middlewares/updateDataValidation';
import { Vehicle } from '../vehicle/vehicle.model';
import { TVehicle } from '../vehicle/vehicle.interface';
import { ShowRoomSearchableFields, vehicleFields } from './showRoom.const';
import { TShowRoom } from './showRoom.interface';
import { ShowRoom } from './showRoom.model';

const createShowRoomDetails = async (payload: {
  showroom: TShowRoom;
  vehicle: TVehicle;
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { showroom, vehicle } = payload;

    const showRoomId = await generateShowRoomId();

    // Create and save the customer
    const sanitizeData = sanitizePayload(showroom);

    const showRoomData = new ShowRoom({
      ...sanitizeData,
      showRoomId,
    });

    const savedShowRoom = await showRoomData.save({ session });

    if (
      savedShowRoom.user_type &&
      savedShowRoom.user_type === 'showRoom' &&
      vehicle
    ) {
      const sanitizeData = sanitizePayload(vehicle);

      const vehicleData = new Vehicle({
        ...sanitizeData,
        showRoom: savedShowRoom._id,
        Id: savedShowRoom.showRoomId,
        user_type: savedShowRoom.user_type,
      });
      if (!vehicleData.customer) {
        vehicleData.customer = undefined; // Ensure no null value
      }

      if (!vehicleData.company) {
        vehicleData.company = undefined; // Ensure no null value
      }

      await vehicleData.save({ session });

      savedShowRoom.vehicles.push(vehicleData._id);

      await savedShowRoom.save({ session });
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

const getAllShowRoomFromDB = async (
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

    const companySearchQuery = ShowRoomSearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    const vehicleSearchQuery = vehicleFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    searchQuery = {
      $or: [...companySearchQuery, ...vehicleSearchQuery],
    };
  }

  const showrooms = await ShowRoom.aggregate([
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
    //     showRoomId: 1,
    //     showRoom_name: 1,
    //     showRoom_address: 1,
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

  const totalData = await ShowRoom.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalData / limit);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return {
    showrooms,
    meta: {
      totalData,
      totalPages,
      currentPage: page,
      pageNumbers,
    },
  };
};

const getSingleShowRoomDetails = async (id: string) => {
  const singleShowRoom = await ShowRoom.findById(id)
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

  if (!singleShowRoom) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No showroom found');
  }

  return singleShowRoom;
};

const updatedShowRoom = async (
  id: string,
  payload: {
    showroom: Partial<TShowRoom>;
    vehicle: Partial<TVehicle>;
  },
) => {
  const { showroom, vehicle } = payload;

  // Start a session for transaction management
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sanitizedShowRoomData = sanitizePayload(showroom);
    const updatedShowRoom = await ShowRoom.findByIdAndUpdate(
      id,
      {
        $set: sanitizedShowRoomData,
      },
      {
        new: true,
        runValidators: true,
        session, // use session for transaction
      },
    );

    if (!updatedShowRoom) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No showroom available');
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
          showRoom: updatedShowRoom._id,
          Id: updatedShowRoom.showRoomId,
          user_type: updatedShowRoom.user_type,
        });

        await newVehicle.save({ session });

        updatedShowRoom.vehicles.push(newVehicle._id);
        await updatedShowRoom.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return updatedShowRoom;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
const deleteShowRoom = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existingShowroom = await ShowRoom.findById(id).session(session);
    if (!existingShowroom) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No showroom exist.');
    }

    const vehicle = await Vehicle.deleteMany({
      Id: existingShowroom.showRoomId,
    }).session(session);

    const customer = await ShowRoom.findByIdAndDelete(
      existingShowroom._id,
    ).session(session);

    if (!customer || !vehicle) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No showroom available');
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

export const ShowRoomServices = {
  createShowRoomDetails,
  getAllShowRoomFromDB,
  getSingleShowRoomDetails,
  deleteShowRoom,
  updatedShowRoom,
};

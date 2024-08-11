import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import sanitizePayload from '../../middlewares/updateDataValidation';
import { Vehicle } from '../vehicle/vehicle.model';
import { TVehicle } from '../vehicle/vehicle.interface';
import { TJobCard } from './job-card.interface';
import { Customer } from '../customer/customer.model';
import { TCustomer } from '../customer/customer.interface';
import { TCompany } from '../company/company.interface';
import { TShowRoom } from '../showRoom/showRoom.interface';
import { JobCard } from './job-card.model';
import { generateCustomerId } from '../customer/customer.utils';
import { generateJobCardNo } from './job-card.utils';
import { SearchableFields, usersFields } from './job-card.const';
import { Company } from '../company/company.model';
import { generateCompanyId } from '../company/company.utils';
import { ShowRoom } from '../showRoom/showRoom.model';
import { generateShowRoomId } from '../showRoom/showRoom.utils';
import mongoose from 'mongoose';

const createJobCardDetails = async (payload: {
  jobCard: TJobCard;
  customer: TCustomer;
  company: TCompany;
  showroom: TShowRoom;
  vehicle: TVehicle;
}) => {
  const { jobCard, customer, company, showroom, vehicle } = payload;

  let newUserForJobCard;

  const sanitizeCustomerData = sanitizePayload(customer);
  const sanitizeCompanyData = sanitizePayload(company);
  const sanitizeShowRoomData = sanitizePayload(showroom);

  if (jobCard.Id && jobCard.user_type === 'customer') {
    newUserForJobCard = await Customer.findOneAndUpdate(
      { customerId: jobCard.Id },
      {
        $set: sanitizeCustomerData,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }
  if (!jobCard.Id && jobCard.user_type === 'customer') {
    const customerId = await generateCustomerId();

    newUserForJobCard = new Customer({
      ...sanitizeCustomerData,
      customerId,
    });
  }
  if (jobCard.Id && jobCard.user_type === 'company') {
    newUserForJobCard = await Company.findOneAndUpdate(
      { companyId: jobCard.Id },
      {
        $set: sanitizeCompanyData,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }
  if (!jobCard.Id && jobCard.user_type === 'company') {
    const companyId = await generateCompanyId();

    newUserForJobCard = new Company({
      ...sanitizeCompanyData,
      companyId,
    });
  }
  if (jobCard.Id && jobCard.user_type === 'showRoom') {
    newUserForJobCard = await ShowRoom.findOneAndUpdate(
      { showRoomId: jobCard.Id },
      {
        $set: sanitizeShowRoomData,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }
  if (!jobCard.Id && jobCard.user_type === 'showRoom') {
    const showRoomId = await generateShowRoomId();

    newUserForJobCard = new ShowRoom({
      ...sanitizeShowRoomData,
      showRoomId,
    });
  }

  const updateJobCard = await newUserForJobCard?.save();

  if (!updateJobCard) {
    throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'Something went wrong!');
  }

  let vehicleData;

  if (vehicle.chassis_no) {
    const sanitizedVehicleData = sanitizePayload(vehicle);

    const existingVehicle = await Vehicle.findOne({
      chassis_no: vehicle.chassis_no,
    });

    if (existingVehicle) {
      vehicleData = await Vehicle.findByIdAndUpdate(
        existingVehicle._id,
        {
          $set: sanitizedVehicleData,
        },
        {
          new: true,
          runValidators: true,
        },
      );
    } else {
      vehicleData = new Vehicle({
        ...sanitizedVehicleData,
        user_type: updateJobCard.user_type,
      });

      switch (jobCard.user_type) {
        case 'customer':
          vehicleData.customer = updateJobCard._id;
          //@ts-ignore
          vehicleData.Id = updateJobCard.customerId;
          break;
        case 'company':
          vehicleData.company = updateJobCard._id;
          //@ts-ignore
          vehicleData.Id = updateJobCard.companyId;
          break;
        case 'showRoom':
          vehicleData.showRoom = updateJobCard._id;
          //@ts-ignore
          vehicleData.Id = updateJobCard.showRoomId;
          break;
        default:
          throw new AppError(
            StatusCodes.CONFLICT,
            'Invalid user type provided',
          );
      }

      await vehicleData.save();

      updateJobCard.vehicles.push(vehicleData._id);
      await updateJobCard.save();
    }
  }

  const createJobCard = new JobCard({
    ...jobCard,
    vehicle: vehicleData?._id,
    job_no: await generateJobCardNo(),
  });

  switch (jobCard.user_type) {
    case 'customer':
      createJobCard.customer = updateJobCard._id;
      //@ts-ignore
      createJobCard.Id = updateJobCard?.customerId;
      break;
    case 'company':
      createJobCard.company = updateJobCard._id;
      //@ts-ignore
      createJobCard.Id = updateJobCard.companyId;
      break;
    case 'showRoom':
      createJobCard.showRoom = updateJobCard._id;
      //@ts-ignore
      createJobCard.Id = updateJobCard.showRoomId;
      break;
    default:
  }

  await createJobCard.save();

  updateJobCard.jobCards.push(createJobCard._id);
  await updateJobCard.save();

  return createJobCard;
};


const getAllJobCardsFromDB = async (
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

    const userSearchQuery = SearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    const usersSearchQuery = usersFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    searchQuery = {
      $or: [...userSearchQuery, ...usersSearchQuery],
    };
  }

  // Construct the aggregation pipeline
  const jobCards = await JobCard.aggregate([
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
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
      $lookup: {
        from: 'showrooms',
        localField: 'showRoom',
        foreignField: '_id',
        as: 'showRoom',
      },
    },
    {
      $unwind: {
        path: '$customer',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$company',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$showRoom',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: id ? idMatchQuery : {},  
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

  // Calculate total data count
  const totalData = await JobCard.countDocuments({
    $and: [
      idMatchQuery,
      searchQuery,
    ],
  });

  const totalPages = Math.ceil(totalData / limit);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return {
    jobCards,
    meta: {
      totalData,
      totalPages,
      currentPage: page,
      pageNumbers,
    },
  };
};


// const getAllJobCardsFromDB = async (
//   limit: number,
//   page: number,
//   searchTerm: string,
// ) => {
//   let searchQuery = {};

//   if (searchTerm) {
//     const escapedFilteringData = searchTerm.replace(
//       /[.*+?^${}()|[\]\\]/g,
//       '\\$&',
//     );

//     const userSearchQuery = SearchableFields.map((field) => ({
//       [field]: { $regex: escapedFilteringData, $options: 'i' },
//     }));

//     const usersSearchQuery = usersFields.map((field) => ({
//       [field]: { $regex: escapedFilteringData, $options: 'i' },
//     }));

    
//     searchQuery = {
//       $or: [...userSearchQuery, ...usersSearchQuery],
//     };
//   }

//   const jobCards = await JobCard.aggregate([
//     {
//       $lookup: {
//         from: 'customers',
//         localField: 'customer',
//         foreignField: '_id',
//         as: 'customer',
//       },
//     },
//     {
//       $lookup: {
//         from: 'companies',
//         localField: 'company',
//         foreignField: '_id',
//         as: 'company',
//       },
//     },
//     {
//       $lookup: {
//         from: 'showrooms',
//         localField: 'showRoom',
//         foreignField: '_id',
//         as: 'showRoom',
//       },
//     },
//     {
//       $match: searchQuery,
//     },
//     {
//       $sort: { createdAt: -1 },
//     },
//     {
//       $skip: (page - 1) * limit,
//     },
//     {
//       $limit: limit,
//     },
//   ]);

//   const totalData = await JobCard.countDocuments(searchQuery);
//   const totalPages = Math.ceil(totalData / limit);
//   const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

//   return {
//     jobCards,
//     meta: {
//       totalData,
//       totalPages,
//       currentPage: page,
//       pageNumbers,
//     },
//   };
// };

const getSingleJobCardDetails = async (id: string) => {
  const singleJobCard = await JobCard.findById(id)
    .populate({
      path: 'showRoom',
      populate: {
        path: 'vehicles',
      },
    })
    .populate({
      path: 'customer',
      populate: {
        path: 'vehicles',
      },
    })
    .populate({
      path: 'company',
      populate: {
        path: 'vehicles',
      },
    });

  if (!singleJobCard) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No job card found');
  }

  return singleJobCard;
};
const getSingleJobCardDetailsWithJobNo = async (jobNo: string) => {
  const singleJobCard = await JobCard.findOne({ job_no: jobNo })
    .populate({
      path: 'showRoom',
      populate: {
        path: 'vehicles',
      },
    })
    .populate({
      path: 'customer',
      populate: {
        path: 'vehicles',
      },
    })
    .populate({
      path: 'company',
      populate: {
        path: 'vehicles',
      },
    })
    .populate({
      path: 'vehicle',
    });

  if (!singleJobCard) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No job card found');
  }

  return singleJobCard;
};

const updateJobCardDetails = async (
  id: string,
  payload: {
    jobCard: TJobCard;
    customer: TCustomer;
    company: TCompany;
    showroom: TShowRoom;
    vehicle: TVehicle;
  },
) => {
  const { jobCard, customer, company, showroom, vehicle } = payload;

  const existingJobCard = await JobCard.findById(id);
  if (!existingJobCard) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No job card exist.');
  }

  let newUserForJobCard;

  const sanitizeCustomerData = sanitizePayload(customer);
  const sanitizeCompanyData = sanitizePayload(company);
  const sanitizeShowRoomData = sanitizePayload(showroom);

  if (jobCard.user_type === 'customer') {
    newUserForJobCard = await Customer.findOneAndUpdate(
      { customerId: existingJobCard.Id },
      {
        $set: sanitizeCustomerData,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  if (jobCard.user_type === 'company') {
    newUserForJobCard = await Company.findOneAndUpdate(
      { companyId: existingJobCard.Id },
      {
        $set: sanitizeCompanyData,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  if (jobCard.user_type === 'showRoom') {
    newUserForJobCard = await ShowRoom.findOneAndUpdate(
      { showRoomId: existingJobCard.Id },
      {
        $set: sanitizeShowRoomData,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  const updateJobCard = await newUserForJobCard?.save();

  if (!updateJobCard) {
    throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'Something went wrong!');
  }

  if (vehicle.chassis_no) {
    const sanitizedVehicleData = sanitizePayload(vehicle);

    const existingVehicle = await Vehicle.findOne({
      chassis_no: vehicle.chassis_no,
    });

    if (existingVehicle) {
      await Vehicle.findByIdAndUpdate(
        existingVehicle._id,
        {
          $set: sanitizedVehicleData,
        },
        {
          new: true,
          runValidators: true,
        },
      );
    }
  }

  const sanitizeJobCard = sanitizePayload(jobCard);

  const updateCard = await JobCard.findByIdAndUpdate(
    existingJobCard._id,
    {
      $set: sanitizeJobCard,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return updateCard;
};

const deleteJobCard = async (id: string) => {
  const existingJobCard = await JobCard.findById(id);
  if (!existingJobCard) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No job card exist.');
  }

  if (existingJobCard.user_type === 'customer') {
    await Customer.findOneAndUpdate(
      {
        customerId: existingJobCard.Id,
      },
      {
        $pull: { jobCards: existingJobCard._id },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  } else if (existingJobCard.user_type === 'company') {
    await Company.findOneAndUpdate(
      {
        companyId: existingJobCard.Id,
      },
      {
        $pull: { jobCards: existingJobCard._id },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  } else if (existingJobCard.user_type === 'showRoom') {
    await ShowRoom.findOneAndUpdate(
      {
        showRoomId: existingJobCard.Id,
      },
      {
        $pull: { jobCards: existingJobCard._id },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  } else {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user type');
  }

  const jobCard = await JobCard.findByIdAndDelete(existingJobCard._id);

  if (!jobCard) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No job card available');
  }

  return null;
};

export const JobCardServices = {
  createJobCardDetails,
  getAllJobCardsFromDB,
  getSingleJobCardDetails,
  updateJobCardDetails,
  deleteJobCard,
  getSingleJobCardDetailsWithJobNo,
};

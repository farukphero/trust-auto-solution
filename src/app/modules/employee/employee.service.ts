import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import sanitizePayload from '../../middlewares/updateDataValidation';
import { SearchableFields } from './employee.const';
import { TEmployee } from './employee.interface';
import { Employee } from './employee.model';
import { generateEmployeeId } from './employee.utils';

const createEmployeeIntoDB = async (payload: TEmployee) => {
  const sanitizeData = sanitizePayload(payload);

  const employeeId = await generateEmployeeId();
  const supplierData = new Employee({
    ...sanitizeData,
    employeeId,
  });

  await supplierData.save();

  return null;
};

const getAllEmployeesFromDB = async (
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

    const employeeSearchQuery = SearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    searchQuery = {
      $or: [...employeeSearchQuery],
    };
  }

  const employees = await Employee.aggregate([
    {
      $lookup: {
        from: 'attendances',
        localField: 'attendance',
        foreignField: '_id',
        as: 'attendance',
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

  const totalData = await Employee.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalData / limit);

  return {
    employees,
    meta: {
      totalPages,
    },
  };
};

const getSingleEmployeeDetails = async (id: string) => {
  const singleEmployee = await Employee.findById(id)
    .populate('attendance')
    .populate('salary');

  if (!singleEmployee) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No employee found');
  }

  return singleEmployee;
};
const updateEmployeeIntoDB = async (id: string, payload: TEmployee) => {
  const sanitizeData = sanitizePayload(payload);

  const updateEmployee = await Employee.findByIdAndUpdate(
    id,
    {
      $set: sanitizeData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updateEmployee) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No employee found');
  }

  return updateEmployee;
};

const deleteEmployee = async (id: string) => {
  const employee = await Employee.findByIdAndDelete(id);

  if (!employee) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No employee available');
  }

  return null;
};

export const EmployeeServices = {
  createEmployeeIntoDB,
  getAllEmployeesFromDB,
  getSingleEmployeeDetails,
  updateEmployeeIntoDB,
  deleteEmployee,
};

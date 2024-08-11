import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';

import { Employee } from '../employee/employee.model';
import { TSalary } from './salary.interface';
import { Salary } from './salary.model';
import mongoose from 'mongoose';
import { getMonthName } from './salary.const';

const createSalaryIntoDB = async (payload: TSalary[]) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Extract unique employee IDs from the payload
    const employeeIds = [...new Set(payload.map((entry) => entry.employee))];

    // Step 2: Fetch all employees and salaries in bulk
    const employees = await Employee.find({ _id: { $in: employeeIds } })
      .session(session)
      .lean();
    const existingSalaries = await Salary.find({
      employee: { $in: employeeIds },
      month_of_salary: { $in: payload.map((d) => d.month_of_salary) },
    })
      .session(session)
      .lean();

    // Step 3: Create a lookup for employees and existing salaries
    const employeeMap = new Map(employees.map((e) => [e._id.toString(), e]));
    const salaryMap = new Map(
      existingSalaries.map((s) => [`${s.employee}-${s.month_of_salary}`, s]),
    );

    // Step 4: Process each payload entry
    const salaryPromises = payload.map(async (data) => {
      const existingEmployee = employeeMap.get(data.employee.toString());

      if (!existingEmployee) {
        throw new AppError(
          StatusCodes.NOT_FOUND,
          `Employee with ID ${data.employee} not found.`,
        );
      }

      const salaryKey = `${data.employee}-${data.month_of_salary}`;
      const checkExistMonthSalary = salaryMap.get(salaryKey);

      if (checkExistMonthSalary) {
        throw new AppError(
          StatusCodes.CONFLICT,
          'Salary already added in this month.',
        );
      }

      const salary = new Salary({
        ...data,
        employee: existingEmployee._id,
      });

      await salary.save({ session });

      if (salary) {
        await Employee.findByIdAndUpdate(
          existingEmployee._id,
          { $push: { salary: salary._id } },
          { new: true, runValidators: true, session },
        );
      }
    });

    await Promise.all(salaryPromises);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    // Abort the transaction if any error occurs
    await session.abortTransaction();
    session.endSession();
    throw error;
  }

  return null;
};

 
const getSalariesForCurrentMonth = async (searchTerm: string) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  const currentMonthName = getMonthName(currentMonth);

  const query: any = {
    month_of_salary: currentMonthName,
  };

  if (searchTerm) {
    query.month_of_salary = searchTerm;
  }

  // Get all distinct dates from the filtered Salary collection
  const distinctMonths = await Salary.distinct('month_of_salary', query);

  // Initialize an array to store salary results for each date
  const salaryResults = [];

  // Iterate over each date and get the salaries
  for (const month of distinctMonths) {
    const salaries = await Salary.find({ month_of_salary: month });

    if (!salaries.length) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        `No salary found for : ${month}`,
      );
    }

    // Add the results for the current date to the array
    salaryResults.push({
      month,
      salaries,
    });
  }

  if (salaryResults.length === 0) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      `No salary data exist within ${searchTerm} month`,
    );
  }

  return salaryResults;
};

 

export const SalaryServices = {
  createSalaryIntoDB,
  getSalariesForCurrentMonth,
};

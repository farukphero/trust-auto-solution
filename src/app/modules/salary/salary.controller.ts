import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SalaryServices } from './salary.service';

const createSalary = catchAsync(async (req, res) => {
  const result = await SalaryServices.createSalaryIntoDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Salary details added successful!',
    data: result,
  });
});
const getSalariesForCurrentMonth = catchAsync(async (req, res) => {
  const searchTerm = req.query.searchTerm as string;
  const result = await SalaryServices.getSalariesForCurrentMonth(searchTerm);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Salary retrieves successful!',
    data: result,
  });
});

const getSingleSalary = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await SalaryServices.getSingleSalary(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Salary retrieved successful!',
    data: result,
  });
});
export const salaryController = {
  createSalary,
  getSalariesForCurrentMonth,
  getSingleSalary,
};

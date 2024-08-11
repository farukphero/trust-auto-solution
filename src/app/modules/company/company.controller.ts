import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CompanyServices } from './company.service';
 

const createCompany = catchAsync(async (req, res) => {
  const company = await CompanyServices.createCompanyDetails(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Company created successful!',
    data: company,
  });
});

const getAllCompanies = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string);

  const searchTerm = req.query.searchTerm as string;

  const result = await CompanyServices.getAllCompanyFromDB(
    limit,
    page,
    searchTerm,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Company are retrieved successful',
    data: result,
  });
});



const getSingleCompanyDetails = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await CompanyServices.getSingleCompanyDetails(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Company retrieved successful!',
      data: result,
    });
  },
);

const updateCompany = catchAsync(async (req, res) => {
  const { id } = req.params;

  const service = await CompanyServices.updateCompany(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Company update successful!',
    data: service,
  });
});
const deleteCompany = catchAsync(async (req, res) => {
  const { id } = req.params;

  const service = await CompanyServices.deleteCompany(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Company deleted successful!',
    data: service,
  });
});

export const companyController = {
  createCompany,
  getAllCompanies,
  getSingleCompanyDetails,
  deleteCompany,
  updateCompany
};

import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { QuotationServices } from './quotation.service';

const createQuotation = catchAsync(async (req, res) => {
  const result = await QuotationServices.createQuotationDetails(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Quotation created successful!',
    data: result,
  });
});

const getAllQuotations = catchAsync(async (req, res) => {
  const id = req.query.id as string;
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string);

  const searchTerm = req.query.searchTerm as string;

  const result = await QuotationServices.getAllQuotationsFromDB(
    id,
    limit,
    page,
    searchTerm,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Quotations are retrieved successful',
    data: result,
  });
});

const getSingleQuotation = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await QuotationServices.getSingleQuotationDetails(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Quotation retrieved successful!',
    data: result,
  });
});

const updateQuotation = catchAsync(async (req, res) => {
  const { id } = req.params;

  const quotation = await QuotationServices.updateQuotationIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Quotation update successful!',
    data: quotation,
  });
});

const removeQuotationFromUpdate = catchAsync(async (req, res) => {
  const { id } = req.query;

  const { index, quotation_name } = req.body;

  const invoice = await QuotationServices.removeQuotationFromUpdate(
    id as string,
    index,
    quotation_name,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Quotation removed successful!',
    data: invoice,
  });
});

const deleteQuotation = catchAsync(async (req, res) => {
  const { id } = req.params;

  const quotation = await QuotationServices.deleteQuotation(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Quotation deleted successful!',
    data: quotation,
  });
});

export const quotationController = {
  createQuotation,
  getAllQuotations,
  getSingleQuotation,
  updateQuotation,
  deleteQuotation,
  removeQuotationFromUpdate,
};

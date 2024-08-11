import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import {  SupplierServices } from './supplier.service';

const createSupplier = catchAsync(async (req, res) => {
  const result = await SupplierServices.createSupplierIntoDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Supplier created successful!',
    data: result,
  });
});

const getAllSuppliers = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string);

  const searchTerm = req.query.searchTerm as string;

  const result = await SupplierServices.getAllSuppliersFromDB(
    limit,
    page,
    searchTerm,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Suppliers are retrieved successful',
    data: result,
  });
});

const getSingleSupplier = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await SupplierServices.getSingleSupplierDetails(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Supplier retrieved successful!',
    data: result,
  });
});

const updateSupplier = catchAsync(async (req, res) => {
  const { id } = req.params;

  const supplier = await SupplierServices.updateSupplierIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Supplier update successful!',
    data: supplier,
  });
});

// const removeQuotationFromUpdate = catchAsync(async (req, res) => {
//   const { id } = req.query;

//   const { index, quotation_name } = req.body;

//   const invoice = await QuotationServices.removeQuotationFromUpdate(
//     id as string,
//     index,
//     quotation_name
//   );
//   sendResponse(res, {
//     statusCode: StatusCodes.OK,
//     success: true,
//     message: 'Quotation removed successful!',
//     data: invoice,
//   });
// });

const deleteSupplier = catchAsync(async (req, res) => {
  const { id } = req.params;

  const supplier = await SupplierServices.deleteSupplier(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Supplier deleted successful!',
    data: supplier,
  });
});

export const supplierController = {
  createSupplier,
  getAllSuppliers,
  getSingleSupplier,
  updateSupplier,
  deleteSupplier
};

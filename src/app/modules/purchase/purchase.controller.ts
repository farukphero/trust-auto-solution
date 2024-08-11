import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PurchaseServices } from './purchase.service';

const createPurchase = catchAsync(async (req, res) => {
  const result = await PurchaseServices.createPurchaseDetails(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Purchase added successful!',
    data: result,
  });
});

const getAllPurchases = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string);

  const searchTerm = req.query.searchTerm as string;

  const result = await PurchaseServices.getAllPurchasesFromDB(
    limit,
    page,
    searchTerm,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Purchases are retrieved successful',
    data: result,
  });
});

const getSinglePurchase = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await PurchaseServices.getSinglePurchaseDetails(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Purchase retrieved successful!',
    data: result,
  });
});

const updatePurchase = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await PurchaseServices.updatePurchase(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Purchase update successful!',
    data: result,
  });
});

const removePurchaseFromUpdate = catchAsync(async (req, res) => {
  const { id } = req.query;

  const { index } = req.body;

  const invoice = await PurchaseServices.removePurchaseFromUpdate(
    id as string,
    index,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Purchase removed successful!',
    data: invoice,
  });
});

const deletePurchase = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await PurchaseServices.deletePurchase(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Purchases deleted successful!',
    data: result,
  });
});

export const purchaseController = {
  createPurchase,
  getAllPurchases,
  getSinglePurchase,
  updatePurchase,
  deletePurchase,
  removePurchaseFromUpdate
};

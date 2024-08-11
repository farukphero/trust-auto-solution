import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MoneyReceiptServices } from './money-receipt.service';

const createMoneyReceipt = catchAsync(async (req, res) => {
  const result = await MoneyReceiptServices.createMoneyReceiptDetails(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Money receipt created successful!',
    data: result,
  });
});

const getAllMoneyReceipts = catchAsync(async (req, res) => {
  const id = req.query.id as string;
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string);

  const searchTerm = req.query.searchTerm as string;

  const result = await MoneyReceiptServices.getAllMoneyReceiptsFromDB(
    id,
    limit,
    page,
    searchTerm,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Money receipts are retrieved successful',
    data: result,
  });
});

const getSingleMoneyReceipt = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await MoneyReceiptServices.getSingleMoneyReceiptDetails(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Money receipt retrieved successful!',
    data: result,
  });
});

const updateMoneyReceipt = catchAsync(async (req, res) => {
  const { id } = req.params;

  const moneyReceipt = await MoneyReceiptServices.updateMoneyReceiptDetails(
    id,
    req.body,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Money receipt update successful!',
    data: moneyReceipt,
  });
});

const deleteMoneyReceipt = catchAsync(async (req, res) => {
  const { id } = req.params;

  const moneyReceipt = await MoneyReceiptServices.deleteMoneyReceipt(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Money receipt deleted successful!',
    data: moneyReceipt,
  });
});

export const moneyReceiptController = {
  createMoneyReceipt,
  getAllMoneyReceipts,
  getSingleMoneyReceipt,
  updateMoneyReceipt,
  deleteMoneyReceipt,
};

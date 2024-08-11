import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BillPayServices } from './bill-pay.service';
 

const createBillPay = catchAsync(async (req, res) => {
  const result = await BillPayServices.createBillPayIntoDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bill pay added successful!',
    data: result,
  });
});

const getAllBillPays = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string);

  const searchTerm = req.query.searchTerm as string;

  const result = await BillPayServices.getAllBillPaysFromDB(
    limit,
    page,
    searchTerm,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bill pays are retrieved successful',
    data: result,
  });
});

const getSingleBillPay = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await BillPayServices.getSingleBillPayDetails(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bill pay retrieved successful!',
    data: result,
  });
});

const updateBillPay = catchAsync(async (req, res) => {
  const { id } = req.params;

  const service = await BillPayServices.updateBillPay(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bill pay updated successful!',
    data: service,
  });
});
const deleteBillPay = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await BillPayServices.deleteBillPay(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bill pay deleted successful!',
    data: result,
  });
});

export const billPayController = {
  createBillPay,
  getAllBillPays,
  getSingleBillPay,
  updateBillPay,
  deleteBillPay,
};

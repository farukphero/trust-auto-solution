import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { InvoiceServices } from './invoice.service';

const createInvoice = catchAsync(async (req, res) => {
  const result = await InvoiceServices.createInvoiceDetails(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Invoice created successful!',
    data: result,
  });
});

const getAllInvoices = catchAsync(async (req, res) => {
  const id = req.query.id as string;
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string);

  const searchTerm = req.query.searchTerm as string;

  const result = await InvoiceServices.getAllInvoicesFromDB(
    id,
    limit,
    page,
    searchTerm,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Invoices are retrieved successful',
    data: result,
  });
});

const getSingleInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await InvoiceServices.getSingleInvoiceDetails(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Invoice retrieved successful!',
    data: result,
  });
});

const updateInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;

  const invoice = await InvoiceServices.updateInvoiceIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Invoice update successful!',
    data: invoice,
  });
});
const removeInvoiceFromUpdate = catchAsync(async (req, res) => {
  const { id } = req.query;

  const { index, invoice_name } = req.body;

  const invoice = await InvoiceServices.removeInvoiceFromUpdate(
    id as string,
    index,
    invoice_name,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Invoice removed successful!',
    data: invoice,
  });
});
const deleteInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;

  const invoice = await InvoiceServices.deleteInvoice(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Invoice deleted successful!',
    data: invoice,
  });
});

export const invoiceController = {
  createInvoice,
  getAllInvoices,
  getSingleInvoice,
  updateInvoice,
  deleteInvoice,
  removeInvoiceFromUpdate,
};

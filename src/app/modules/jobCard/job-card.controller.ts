import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { JobCardServices } from './job-card.service';

const createJobCard = catchAsync(async (req, res) => {
  const jobCard = await JobCardServices.createJobCardDetails(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job card created successful!',
    data: jobCard,
  });
});

const getAllJobCards = catchAsync(async (req, res) => {
  const id = req.query.id as string;
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string);

  const searchTerm = req.query.searchTerm as string;

  const result = await JobCardServices.getAllJobCardsFromDB(
    id,
    limit,
    page,
    searchTerm,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job cards are retrieved successful',
    data: result,
  });
});

const getSingleJobCardDetails = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await JobCardServices.getSingleJobCardDetails(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job card retrieved successful!',
    data: result,
  });
});
const getSingleJobCardDetailsWithJobNo = catchAsync(async (req, res) => {
  const jobNo = req.query.jobNo as string;

  const result = await JobCardServices.getSingleJobCardDetailsWithJobNo(jobNo);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job card retrieved successful!',
    data: result,
  });
});

const updateJobCardDetails = catchAsync(async (req, res) => {
  const { id } = req.params;

  const service = await JobCardServices.updateJobCardDetails(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job card update successful!',
    data: service,
  });
});
const deleteJobCard = catchAsync(async (req, res) => {
  const { id } = req.params;

  const card = await JobCardServices.deleteJobCard(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job card deleted successful!',
    data: card,
  });
});

export const jobCardController = {
  createJobCard,
  getAllJobCards,
  getSingleJobCardDetails,
  updateJobCardDetails,
  deleteJobCard,
  getSingleJobCardDetailsWithJobNo
};

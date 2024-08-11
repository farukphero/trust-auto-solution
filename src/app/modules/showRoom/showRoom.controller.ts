import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ShowRoomServices } from './showRoom.service';
 
 

const createShowRoom = catchAsync(async (req, res) => {
  const showRoom = await ShowRoomServices.createShowRoomDetails(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'ShowRoom created successful!',
    data: showRoom,
  });
});

const getAllShowRooms = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string);

  const searchTerm = req.query.searchTerm as string;

  const result = await ShowRoomServices.getAllShowRoomFromDB(
    limit,
    page,
    searchTerm,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Show Room are retrieves successful',
    data: result,
  });
});



const getSingleShowRoomDetails = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await ShowRoomServices.getSingleShowRoomDetails(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Show room retrieved successful!',
      data: result,
    });
  },
);

const updateShowRoom = catchAsync(async (req, res) => {
  const { id } = req.params;

  const showRoom = await ShowRoomServices.updatedShowRoom(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Showroom update successful!',
    data: showRoom,
  });
});
const deleteShowRoom = catchAsync(async (req, res) => {
  const { id } = req.params;

  const service = await ShowRoomServices.deleteShowRoom(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Show Room deleted successful!',
    data: service,
  });
});

export const showRoomController = {
  createShowRoom,
  getAllShowRooms,
  getSingleShowRoomDetails,
  deleteShowRoom,
  updateShowRoom
};

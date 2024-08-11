import express from 'express';
import { showRoomController } from './showRoom.controller';

const router = express.Router();

router
  .route('/')
  .post(showRoomController.createShowRoom)
  .get(showRoomController.getAllShowRooms);

router
  .route('/:id')
  .get(showRoomController.getSingleShowRoomDetails)
  .put(showRoomController.updateShowRoom)
  .delete(showRoomController.deleteShowRoom);

export const ShowRoomRoutes = router;

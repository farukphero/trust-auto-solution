import express from 'express';
import { jobCardController } from './job-card.controller';

const router = express.Router();

router
  .route('/')
  .get(jobCardController.getAllJobCards)
  .post(jobCardController.createJobCard);
router
  .route('/getWithJobNo')
  .get(jobCardController.getSingleJobCardDetailsWithJobNo);

router
  .route('/:id')
  .get(jobCardController.getSingleJobCardDetails)
  .put(jobCardController.updateJobCardDetails)
  .delete(jobCardController.deleteJobCard);

export const JobCardRoutes = router;

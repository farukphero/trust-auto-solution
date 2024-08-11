import express from 'express';
import { salaryController } from './salary.controller';

 

const router = express.Router();

router
  .route('/')
  .post(salaryController.createSalary)
  .get(salaryController.getSalariesForCurrentMonth);

// router.route('/remove').put(attendanceController.deleteAttendance);

// router.route('/today').get(attendanceController.getTodayAttendance);

// router.route('/:date').get(attendanceController.getSingleDateAttendance);

export const SalaryRoutes = router;

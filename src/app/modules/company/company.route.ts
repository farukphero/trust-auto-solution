import express from 'express';
import { companyController } from './company.controller';

const router = express.Router();

router
  .route('/')
  .post(companyController.createCompany)
  .get(companyController.getAllCompanies);

router
  .route('/:id')
  .get(companyController.getSingleCompanyDetails)
  .put(companyController.updateCompany)
  .delete(companyController.deleteCompany);

export const CompanyRoutes = router;

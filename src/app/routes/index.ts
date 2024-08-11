import { Router } from 'express';
import { CustomerRoutes } from '../modules/customer/customer.route';
import { CompanyRoutes } from '../modules/company/company.route';
import { ShowRoomRoutes } from '../modules/showRoom/showRoom.route';
import { VehicleRoutes } from '../modules/vehicle/vehicle.route';
import { JobCardRoutes } from '../modules/jobCard/job-card.route';
import { QuotationRoutes } from '../modules/quotation/quotation.route';
import { InvoiceRoutes } from '../modules/invoice/invoice.route';
import { SupplierRoutes } from '../modules/supplier/supplier.route';
import { EmployeeRoutes } from '../modules/employee/employee.route';
import { AttendanceRoutes } from '../modules/attendance/attendance.route';
import { SalaryRoutes } from '../modules/salary/salary.route';
import { ExpenseRoutes } from '../modules/expense/expense.route';
import { MoneyReceiptRoutes } from '../modules/money-receipt/money-receipt.route';
import { IncomeRoutes } from '../modules/income/income.route';
import { BillPayRoutes } from '../modules/bill-pay/bill-pay.route';
import { PurchaseRoutes } from '../modules/purchase/purchase.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/customers',
    route: CustomerRoutes,
  },
  {
    path: '/companies',
    route: CompanyRoutes,
  },
  {
    path: '/showrooms',
    route: ShowRoomRoutes,
  },
  {
    path: '/vehicles',
    route: VehicleRoutes,
  },
  {
    path: '/jobCards',
    route: JobCardRoutes,
  },
  {
    path: '/quotations',
    route: QuotationRoutes,
  },
  {
    path: '/invoices',
    route: InvoiceRoutes,
  },
  {
    path: '/suppliers',
    route: SupplierRoutes,
  },
  {
    path: '/employees',
    route: EmployeeRoutes,
  },
  {
    path: '/attendances',
    route: AttendanceRoutes,
  },
  {
    path: '/salary',
    route: SalaryRoutes,
  },
  {
    path: '/incomes',
    route: IncomeRoutes,
  },
  {
    path: '/expenses',
    route: ExpenseRoutes,
  },
  {
    path: '/money-receipts',
    route: MoneyReceiptRoutes,
  },
  {
    path: '/bill-pays',
    route: BillPayRoutes,
  },
  {
    path: '/purchases',
    route: PurchaseRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

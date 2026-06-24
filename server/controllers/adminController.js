import { asyncHandler } from '../utils/asyncHandler.js';
import { adminService } from '../services/adminService.js';

export const getOverview = asyncHandler(async (req, res) => {
  const data = await adminService.getOverview();

  res.status(200).json({
    success: true,
    data,
  });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const data = await adminService.getAnalytics();

  res.status(200).json({
    success: true,
    data,
  });
});

export const exportRevenue = asyncHandler(async (req, res) => {
  const csv = await adminService.exportRevenueCSV();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=revenue_report.csv');
  res.status(200).send(csv);
});

export const exportSales = asyncHandler(async (req, res) => {
  const csv = await adminService.exportSalesCSV();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=sales_report.csv');
  res.status(200).send(csv);
});

export const listUsers = asyncHandler(async (req, res) => {
  const users = await adminService.listUsers(req.query);

  res.status(200).json({
    success: true,
    data: users,
  });
});

export const listOrders = asyncHandler(async (req, res) => {
  const orders = await adminService.listOrders(req.query);

  res.status(200).json({
    success: true,
    data: orders,
  });
});
import { userRepository } from '../repositories/userRepository.js';
import { foodRepository } from '../repositories/foodRepository.js';
import { orderRepository } from '../repositories/orderRepository.js';

export const adminService = {
  getOverview: async () => {
    const [users, foods, orders, revenueResult] = await Promise.all([
      userRepository.count(),
      foodRepository.count(),
      orderRepository.count(),
      orderRepository.aggregateRevenue(),
    ]);

    return {
      users,
      foods,
      orders,
      revenue: revenueResult[0]?.revenue ?? 0,
    };
  },
  getAnalytics: async () => {
    const [overview, revenueOverTime, topSellingFoods] = await Promise.all([
      adminService.getOverview(),
      orderRepository.aggregateRevenueOverTime(),
      orderRepository.aggregateTopSellingFoods(),
    ]);

    return {
      ...overview,
      revenueOverTime,
      topSellingFoods,
    };
  },
  exportRevenueCSV: async () => {
    const data = await orderRepository.aggregateRevenueOverTime();
    const headers = ['Date', 'Revenue (INR)', 'Order Count'];
    const lines = data.map((row) => [row._id, row.revenue, row.count].join(','));
    return [headers.join(','), ...lines].join('\n');
  },
  exportSalesCSV: async () => {
    const data = await orderRepository.aggregateTopSellingFoods();
    const headers = ['Food Item', 'Quantity Sold', 'Revenue Generated (INR)'];
    const lines = data.map((row) => [row._id, row.quantity, row.revenue].join(','));
    return [headers.join(','), ...lines].join('\n');
  },
  listUsers: async (query) => userRepository.findMany(query),
  listOrders: async (query) => orderRepository.findMany(query),
};
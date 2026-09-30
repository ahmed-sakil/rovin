import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalOrders,
      ordersByStatus,
      recentOrders,
      recentLogs,
      categories,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({
        where: {
          stockQuantity: { gt: 0, lte: 5 },
        },
      }),
      prisma.product.count({
        where: { stockQuantity: { lte: 0 } },
      }),
      prisma.order.count(),
      prisma.order.groupBy({
        by: ['orderStatus'],
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: { include: { product: { select: { title: true, images: true } } } },
        },
      }),
      prisma.userActivityLog.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true, role: true } } },
      }),
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: { select: { products: true } },
        },
      }),
    ]);

    // Calculate total revenue from delivered or active orders
    const revenueSum = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { orderStatus: { not: 'CANCELLED' } },
    });
    const totalRevenue = revenueSum._sum.totalAmount || 0;

    // Build Order Status Distribution
    const statusMap: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PACKED: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      RETURNED: 0,
    };
    ordersByStatus.forEach((g) => {
      statusMap[g.orderStatus] = g._count.id;
    });

    // Simulated 7-day Sales Telemetry for visualization
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const salesTrend = days.map((day, idx) => ({
      day,
      sales: Math.round(25000 + (idx * 14500) % 35000),
      orders: 3 + ((idx * 4) % 9),
    }));

    // Stock Distribution Data
    const healthyStock = Math.max(0, totalProducts - lowStockProducts - outOfStockProducts);
    const stockDistribution = [
      { name: 'Optimal Stock', count: healthyStock, color: '#10B981' },
      { name: 'Low Stock (<= 5)', count: lowStockProducts, color: '#FFC837' },
      { name: 'Depleted (0 units)', count: outOfStockProducts, color: '#EF4444' },
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        lowStockCount: lowStockProducts,
        outOfStockCount: outOfStockProducts,
        statusDistribution: statusMap,
        stockDistribution,
        salesTrend,
        categories: categories.map((c) => ({ name: c.name, count: c._count.products })),
        recentOrders,
        recentLogs,
      },
    });
  } catch (error: any) {
    console.error('[getDashboardStats Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to aggregate dashboard telemetry.' });
  }
}

export async function getSettings(req: Request, res: Response): Promise<void> {
  try {
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        deliveryChargeInsideDhaka: 70,
        deliveryChargeOutsideDhaka: 130,
        freeShippingThreshold: 5000,
        bkashMerchantNumber: '01711000000',
        nagadMerchantNumber: '01711000000',
      },
    });
    res.status(200).json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve settings' });
  }
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  try {
    const {
      deliveryChargeInsideDhaka,
      deliveryChargeOutsideDhaka,
      freeShippingThreshold,
      bkashMerchantNumber,
      nagadMerchantNumber,
      maintenanceMode,
    } = req.body;

    const updated = await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: {
        deliveryChargeInsideDhaka: Number(deliveryChargeInsideDhaka),
        deliveryChargeOutsideDhaka: Number(deliveryChargeOutsideDhaka),
        freeShippingThreshold: freeShippingThreshold ? Number(freeShippingThreshold) : null,
        bkashMerchantNumber: bkashMerchantNumber || null,
        nagadMerchantNumber: nagadMerchantNumber || null,
        maintenanceMode: Boolean(maintenanceMode),
      },
      create: {
        id: 'default',
        deliveryChargeInsideDhaka: Number(deliveryChargeInsideDhaka) || 70,
        deliveryChargeOutsideDhaka: Number(deliveryChargeOutsideDhaka) || 130,
        freeShippingThreshold: freeShippingThreshold ? Number(freeShippingThreshold) : null,
        bkashMerchantNumber: bkashMerchantNumber || null,
        nagadMerchantNumber: nagadMerchantNumber || null,
        maintenanceMode: Boolean(maintenanceMode),
      },
    });

    res.status(200).json({ success: true, settings: updated, message: 'Delivery charges & settings updated.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to save settings' });
  }
}

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

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

// -------------------------------------------------------------
// USER MANAGEMENT & SECURITY AUDIT MODERATION
// -------------------------------------------------------------

export async function getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { search, role, status } = req.query;

    const where: any = {};

    if (search && typeof search === 'string') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'ALL') {
      where.role = role;
    }

    if (status === 'BANNED') {
      where.isBanned = true;
    } else if (status === 'ACTIVE') {
      where.isBanned = false;
    } else if (status === 'STRIKED') {
      where.strikeCount = { gt: 0 };
    }

    const [users, totalCount, bannedCount, strikedCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          gender: true,
          role: true,
          profileImageUrl: true,
          isBanned: true,
          banReason: true,
          banExpiresAt: true,
          strikeCount: true,
          createdAt: true,
          _count: { select: { orders: true, reviews: true } },
          orders: {
            select: { totalAmount: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.user.count({ where: { strikeCount: { gt: 0 } } }),
    ]);

    // Compute lifetime spent for each user
    const formatted = users.map((u) => {
      const lifetimeSpent = u.orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
      const { orders, ...rest } = u;
      return {
        ...rest,
        orderCount: u._count.orders,
        lifetimeSpent,
      };
    });

    res.status(200).json({
      success: true,
      users: formatted,
      stats: {
        total: totalCount,
        banned: bannedCount,
        striked: strikedCount,
        active: totalCount - bannedCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user roster', error: error.message });
  }
}

export async function banUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { reason, durationHours } = req.body;

    const targetUser = await prisma.user.findUnique({ where: { id: String(id) } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'Pilot not found in registry.' });
      return;
    }

    if (targetUser.role === 'ADMIN' && req.user?.id !== targetUser.id) {
      res.status(403).json({ success: false, message: 'Cannot ban an administrative officer.' });
      return;
    }

    let banExpiresAt: Date | null = null;
    if (durationHours && Number(durationHours) > 0) {
      banExpiresAt = new Date(Date.now() + Number(durationHours) * 60 * 60 * 1000);
    }

    const banReason = reason || 'Administrative policy violation';

    const updated = await prisma.user.update({
      where: { id: String(id) },
      data: {
        isBanned: true,
        banReason,
        banExpiresAt,
      },
    });

    // Security Audit Log
    await prisma.userActivityLog.create({
      data: {
        userId: targetUser.id,
        action: 'ADMIN_BAN_USER',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'ROVIN Admin Panel',
        metadata: {
          adminId: req.user?.id,
          reason: banReason,
          durationHours: durationHours || 'Permanent',
        },
      },
    });

    res.status(200).json({
      success: true,
      message: `Pilot ${targetUser.name} has been suspended.`,
      user: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to execute suspension protocol' });
  }
}

export async function unbanUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const targetUser = await prisma.user.findUnique({ where: { id: String(id) } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'Pilot not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: String(id) },
      data: {
        isBanned: false,
        banReason: null,
        banExpiresAt: null,
      },
    });

    // Security Audit Log
    await prisma.userActivityLog.create({
      data: {
        userId: targetUser.id,
        action: 'ADMIN_UNBAN_USER',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'ROVIN Admin Panel',
        metadata: {
          adminId: req.user?.id,
          restoredAt: new Date().toISOString(),
        },
      },
    });

    res.status(200).json({
      success: true,
      message: `Suspension lifted for pilot ${targetUser.name}.`,
      user: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to lift suspension' });
  }
}

export async function punishUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { strikeReason } = req.body;

    const targetUser = await prisma.user.findUnique({ where: { id: String(id) } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'Pilot not found.' });
      return;
    }

    const newStrikeCount = targetUser.strikeCount + 1;
    let autoBanned = false;
    let banReason = targetUser.banReason;
    let banExpiresAt = targetUser.banExpiresAt;

    // Automated Disciplinary Rule: 3 strikes triggers automated 7-day suspension
    if (newStrikeCount >= 3) {
      autoBanned = true;
      banReason = 'Automated 7-Day Suspension: Threshold of 3 Disciplinary Strikes Exceeded';
      banExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const updated = await prisma.user.update({
      where: { id: String(id) },
      data: {
        strikeCount: newStrikeCount,
        isBanned: autoBanned ? true : targetUser.isBanned,
        banReason: autoBanned ? banReason : targetUser.banReason,
        banExpiresAt: autoBanned ? banExpiresAt : targetUser.banExpiresAt,
      },
    });

    // Security Audit Log
    await prisma.userActivityLog.create({
      data: {
        userId: targetUser.id,
        action: 'ADMIN_STRIKE_USER',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'ROVIN Admin Panel',
        metadata: {
          adminId: req.user?.id,
          strikeCount: newStrikeCount,
          reason: strikeReason || 'Disciplinary violation (Fake COD / Spam)',
          autoBanned,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: autoBanned
        ? `Pilot received strike #${newStrikeCount} and has been AUTO-SUSPENDED for 7 days!`
        : `Disciplinary strike #${newStrikeCount} recorded for ${targetUser.name}.`,
      user: updated,
      autoBanned,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to issue disciplinary strike' });
  }
}

export async function getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { action, search, limit } = req.query;

    const where: any = {};
    if (action && action !== 'ALL') {
      where.action = String(action);
    }

    if (search && typeof search === 'string') {
      const q = search.trim();
      where.OR = [
        { action: { contains: q, mode: 'insensitive' } },
        { ipAddress: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const logs = await prisma.userActivityLog.findMany({
      where,
      take: limit ? Number(limit) : 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, isBanned: true },
        },
      },
    });

    res.status(200).json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
}


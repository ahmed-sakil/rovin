import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { BD_PHONE_REGEX } from '../utils/validators.js';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { logUserActivity } from '../middlewares/activityLogger.js';

const CreateOrderSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerPhone: z.string().regex(BD_PHONE_REGEX, 'Valid 11-digit BD mobile number is required'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  deliveryAddress: z.string().min(5, 'Full delivery address is required'),
  district: z.string().min(2, 'District is required'),
  thana: z.string().min(2, 'Thana/Area is required'),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.COD),
  couponCode: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1),
      chosenColor: z.string().optional(),
      chosenSize: z.string().optional(),
    })
  ).min(1, 'Order must contain at least 1 item'),
});

export async function createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in or create an account to place an order.',
      });
      return;
    }

    const parsed = CreateOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      district,
      thana,
      paymentMethod,
      couponCode,
      items,
    } = parsed.data;

    // 1. Fetch System Settings for delivery rates
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        deliveryChargeInsideDhaka: 70,
        deliveryChargeOutsideDhaka: 130,
        freeShippingThreshold: 5000,
      },
    });

    // 2. Fetch and Validate all products
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (dbProducts.length !== items.length) {
      res.status(400).json({ success: false, message: 'One or more items in cart could not be located.' });
      return;
    }

    // Check stock availability
    for (const item of items) {
      const prod = dbProducts.find((p) => p.id === item.productId);
      if (!prod || prod.stockQuantity < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Stock insufficient for '${prod?.title || 'Selected item'}'. Available: ${prod?.stockQuantity || 0} units.`,
        });
        return;
      }
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItemsData = items.map((item) => {
      const prod = dbProducts.find((p) => p.id === item.productId)!;
      const unitPrice = prod.discountPriceBDT || prod.priceBDT;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      return {
        productId: prod.id,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        chosenColor: item.chosenColor,
        chosenSize: item.chosenSize,
      };
    });

    // Calculate dynamic delivery fee
    const isDhaka = district.trim().toLowerCase() === 'dhaka';
    let deliveryCharge = isDhaka
      ? settings.deliveryChargeInsideDhaka
      : settings.deliveryChargeOutsideDhaka;

    // Free shipping threshold check
    if (settings.freeShippingThreshold && subtotal >= settings.freeShippingThreshold) {
      deliveryCharge = 0;
    }

    // Discount & Coupon check
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        if (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) {
          if (subtotal >= coupon.minOrderAmount) {
            if (coupon.discountType === 'PERCENTAGE') {
              discountAmount = (subtotal * coupon.discountValue) / 100;
              if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
              }
            } else {
              discountAmount = coupon.discountValue;
            }
          }
        }
      }
    }

    const totalAmount = Math.max(0, subtotal + deliveryCharge - discountAmount);

    // Generate Order Number: ROV-YYYYMM-XXXX
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ROV-${dateStr}-${randomSuffix}`;

    const currentUserId = req.user.id;

    // Atomic transaction: Create Order + OrderItems + Decrement Stock
    const newOrder = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: currentUserId,
          customerName,
          customerPhone,
          customerEmail: customerEmail || null,
          deliveryAddress,
          district,
          thana,
          subtotal,
          deliveryCharge,
          discountAmount,
          totalAmount,
          couponCode: couponCode || null,
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING_MFS',
          orderStatus: 'PENDING',
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: { include: { product: true } },
        },
      });

      // Atomically decrement stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      // If coupon used, increment count
      if (couponCode && discountAmount > 0) {
        await tx.coupon.update({
          where: { code: couponCode.trim().toUpperCase() },
          data: { usageCount: { increment: 1 } },
        });
      }

      return created;
    });

    // Security Audit Log: Record order creation
    await logUserActivity(currentUserId, 'ORDER_CREATED', req as any, {
      orderNumber: newOrder.orderNumber,
      totalAmount: newOrder.totalAmount,
      paymentMethod: newOrder.paymentMethod,
      itemCount: items.length,
    });

    res.status(201).json({
      success: true,
      message: `Order #${newOrder.orderNumber} placed successfully!`,
      order: newOrder,
    });
  } catch (error: any) {
    console.error('[createOrder Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to process order placement.' });
  }
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  try {
    const { orderNumberOrId } = req.params;
    const target = String(orderNumberOrId);

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: target }, { orderNumber: target }],
      },
      include: {
        orderItems: { include: { product: true } },
        consignments: true,
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.status(200).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve order' });
  }
}

export async function getAllOrders(req: Request, res: Response): Promise<void> {
  try {
    const { status, search } = req.query;
    const where: any = {};

    if (status && status !== 'ALL') {
      where.orderStatus = status;
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: { include: { product: { select: { title: true, images: true, sku: true } } } },
        consignments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const existing = await prisma.order.findUnique({
      where: { id: String(id) },
      include: { orderItems: true },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // If transitioning to CANCELLED from an active state, restore inventory stock!
    if (orderStatus === 'CANCELLED' && existing.orderStatus !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: String(id) },
          data: { orderStatus: 'CANCELLED' },
        });

        for (const item of existing.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        }
      });

      await logUserActivity((req as any).user?.id, 'ORDER_STATUS_UPDATED', req as any, {
        orderId: id,
        orderNumber: existing.orderNumber,
        previousStatus: existing.orderStatus,
        newStatus: 'CANCELLED',
      });

      res.status(200).json({ success: true, message: 'Order cancelled and stock restored to inventory.' });
      return;
    }

    const updated = await prisma.order.update({
      where: { id: String(id) },
      data: { orderStatus },
    });

    await logUserActivity((req as any).user?.id, 'ORDER_STATUS_UPDATED', req as any, {
      orderId: id,
      orderNumber: existing.orderNumber,
      previousStatus: existing.orderStatus,
      newStatus: orderStatus,
    });

    res.status(200).json({ success: true, message: `Status updated to ${orderStatus}`, order: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
}

export async function validateCoupon(req: Request, res: Response): Promise<void> {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      res.status(400).json({ success: false, message: 'Coupon code required' });
      return;
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: String(code).trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      res.status(404).json({ success: false, message: 'Invalid or inactive promotional code.' });
      return;
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      res.status(400).json({ success: false, message: 'This coupon code has expired.' });
      return;
    }

    const sub = Number(subtotal) || 0;
    if (sub < coupon.minOrderAmount) {
      res.status(400).json({
        success: false,
        message: `Minimum order amount of ৳${coupon.minOrderAmount} required for this coupon.`,
      });
      return;
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (sub * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.status(200).json({
      success: true,
      code: coupon.code,
      discountAmount: discount,
      discountType: coupon.discountType,
      message: `Coupon '${coupon.code}' verified: ৳${discount} discount applied.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to validate coupon' });
  }
}

import { getCourierService } from '../services/couriers/index.js';

export async function dispatchToCourier(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { provider = 'STEADFAST', note } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: String(id) },
      include: { orderItems: { include: { product: true } } },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const courierService = getCourierService(provider);
    const shipmentResult = await courierService.createShipment({
      invoice: order.orderNumber,
      recipientName: order.customerName,
      recipientPhone: order.customerPhone,
      recipientAddress: order.deliveryAddress,
      district: order.district,
      thana: order.thana,
      codAmount: order.paymentMethod === 'COD' ? order.totalAmount : 0,
      note,
      itemDescription: order.orderItems.map((i) => `${i.product.title} (x${i.quantity})`).join(', '),
    });

    if (!shipmentResult.success) {
      res.status(502).json({
        success: false,
        message: `Third-Party Courier Error: ${shipmentResult.error}`,
        error: shipmentResult.error,
        allowManualOverride: true,
      });
      return;
    }

    // Save Consignment Record
    const consignment = await prisma.courierConsignment.create({
      data: {
        orderId: order.id,
        courierProvider: shipmentResult.courierProvider,
        consignmentId: shipmentResult.consignmentId,
        trackingCode: shipmentResult.trackingCode,
        status: shipmentResult.status,
        codAmount: order.paymentMethod === 'COD' ? order.totalAmount : 0,
        deliveryFee: shipmentResult.deliveryFee || order.deliveryCharge,
        rawWebhookData: shipmentResult.rawResponse ? JSON.parse(JSON.stringify(shipmentResult.rawResponse)) : undefined,
      },
    });

    // Advance Order Status to SHIPPED
    await prisma.order.update({
      where: { id: order.id },
      data: { orderStatus: 'SHIPPED' },
    });

    res.status(200).json({
      success: true,
      message: `Order successfully dispatched with ${provider}. Consignment: ${shipmentResult.consignmentId}`,
      consignment,
    });
  } catch (error: any) {
    console.error('[dispatchToCourier Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to process courier dispatch' });
  }
}

export async function manualConsignmentOverride(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { courierProvider, consignmentId, trackingCode } = req.body;

    if (!consignmentId || !trackingCode) {
      res.status(400).json({ success: false, message: 'Consignment ID and Tracking Code are required' });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id: String(id) } });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const consignment = await prisma.courierConsignment.create({
      data: {
        orderId: order.id,
        courierProvider: courierProvider || 'MANUAL',
        consignmentId: String(consignmentId).trim(),
        trackingCode: String(trackingCode).trim(),
        status: 'manual_override',
        codAmount: order.paymentMethod === 'COD' ? order.totalAmount : 0,
        deliveryFee: order.deliveryCharge,
        rawWebhookData: { note: 'Admin manual consignment override applied.' },
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { orderStatus: 'SHIPPED' },
    });

    res.status(200).json({
      success: true,
      message: 'Manual consignment override registered. Order marked as SHIPPED.',
      consignment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to apply manual override' });
  }
}

export async function markLabelPrinted(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.courierConsignment.updateMany({
      where: { orderId: String(id) },
      data: { labelPrinted: true },
    });
    res.status(200).json({ success: true, message: 'Label print status recorded' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to record label print status' });
  }
}

export async function getMyOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        orderItems: {
          include: { product: true },
        },
        consignments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve personal orders',
      error: error.message,
    });
  }
}

/**
 * Delete Order (Admin Only)
 */
export async function deleteOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: String(id) },
      include: { orderItems: true },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // If order was not cancelled, return stock to products
    if (order.orderStatus !== 'CANCELLED') {
      for (const item of order.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
    }

    // Delete consignments & order items, then order
    await prisma.courierConsignment.deleteMany({ where: { orderId: String(id) } });
    await prisma.orderItem.deleteMany({ where: { orderId: String(id) } });
    await prisma.order.delete({ where: { id: String(id) } });

    await logUserActivity(req.user?.id || null, 'ORDER_DELETED', req as any, {
      orderId: id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
    });

    res.status(200).json({ success: true, message: `Order #${order.orderNumber} deleted permanently.` });
  } catch (error: any) {
    console.error('[deleteOrder Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to delete order' });
  }
}

/**
 * Customer Self-Cancel Pending Order
 */
export async function customerCancelOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const order = await prisma.order.findFirst({
      where: { id: String(id), userId },
      include: { orderItems: true },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found or unauthorized' });
      return;
    }

    if (order.orderStatus !== 'PENDING') {
      res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled because it is already confirmed or dispatched.',
      });
      return;
    }

    // Restore stock and mark as CANCELLED
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { orderStatus: 'CANCELLED' },
      });

      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
    });

    await logUserActivity(userId || null, 'CUSTOMER_ORDER_CANCELLED', req as any, {
      orderId: order.id,
      orderNumber: order.orderNumber,
    });

    res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} has been cancelled successfully.`,
    });
  } catch (error: any) {
    console.error('[customerCancelOrder Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
}



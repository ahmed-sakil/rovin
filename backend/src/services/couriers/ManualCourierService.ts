import { ICourierProvider, CourierOrderPayload, CourierShipmentResult } from './ICourierProvider.js';

export class ManualCourierService implements ICourierProvider {
  async createShipment(payload: CourierOrderPayload): Promise<CourierShipmentResult> {
    const timestamp = Date.now().toString().slice(-6);
    const consignmentId = `ROV-MAN-${timestamp}`;
    const trackingCode = `MANUAL-${payload.invoice}`;

    return {
      success: true,
      courierProvider: 'MANUAL',
      consignmentId,
      trackingCode,
      status: 'dispatched_manual',
      deliveryFee: payload.district.toLowerCase() === 'dhaka' ? 70 : 130,
      rawResponse: {
        mode: 'MANUAL_OVERRIDE',
        message: 'Order dispatched via admin manual override or in-house logistics rider.',
      },
    };
  }

  async trackShipment(consignmentId: string): Promise<{ status: string; raw?: any }> {
    return { status: 'manual_dispatch', raw: { consignmentId } };
  }
}

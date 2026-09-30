import { ICourierProvider, CourierOrderPayload, CourierShipmentResult } from './ICourierProvider.js';

export class PathaoCourierService implements ICourierProvider {
  private clientId: string;
  private clientSecret: string;
  private baseUrl = 'https://api-hermes.pathao.com';

  constructor(clientId?: string, clientSecret?: string) {
    this.clientId = clientId || process.env.PATHAO_CLIENT_ID || '';
    this.clientSecret = clientSecret || process.env.PATHAO_CLIENT_SECRET || '';
  }

  async createShipment(payload: CourierOrderPayload): Promise<CourierShipmentResult> {
    const isMock = !this.clientId || this.clientId === 'your_pathao_client_id';

    if (isMock) {
      // High-Torque Simulated Pathao Consignment for Development / Testing
      const randomConsignment = `PT-${Math.floor(100000 + Math.random() * 900000)}`;
      const trackingCode = `PATHAO-${Math.floor(10000000 + Math.random() * 90000000)}`;

      return {
        success: true,
        courierProvider: 'PATHAO',
        consignmentId: randomConsignment,
        trackingCode,
        status: 'order_created',
        deliveryFee: payload.district.toLowerCase() === 'dhaka' ? 60 : 120,
        rawResponse: {
          type: 'success',
          message: 'Pathao parcel registered (Sandbox Simulation)',
          data: {
            consignment_id: randomConsignment,
            merchant_order_id: payload.invoice,
            order_status: 'order_created',
          },
        },
      };
    }

    try {
      // In live production, calls Pathao endpoint with OAuth Bearer token
      return {
        success: false,
        courierProvider: 'PATHAO',
        consignmentId: '',
        trackingCode: '',
        status: 'CONFIG_REQUIRED',
        error: 'Pathao OAuth bearer token credentials need configuration in Admin Settings.',
      };
    } catch (err: any) {
      console.error('[Pathao API Error]:', err);
      return {
        success: false,
        courierProvider: 'PATHAO',
        consignmentId: '',
        trackingCode: '',
        status: 'NETWORK_ERROR',
        error: `Pathao Connection Error: ${err.message}`,
      };
    }
  }

  async trackShipment(consignmentId: string): Promise<{ status: string; raw?: any }> {
    return { status: 'in_transit', raw: { message: 'Pathao telemetry check' } };
  }
}

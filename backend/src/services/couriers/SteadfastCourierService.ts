import { ICourierProvider, CourierOrderPayload, CourierShipmentResult } from './ICourierProvider.js';

export class SteadfastCourierService implements ICourierProvider {
  private apiKey: string;
  private secretKey: string;
  private baseUrl = 'https://portal.steadfast.com.bd/api/v1';

  constructor(apiKey?: string, secretKey?: string) {
    this.apiKey = apiKey || process.env.STEADFAST_API_KEY || '';
    this.secretKey = secretKey || process.env.STEADFAST_SECRET_KEY || '';
  }

  async createShipment(payload: CourierOrderPayload): Promise<CourierShipmentResult> {
    const isMock = !this.apiKey || this.apiKey === 'your_steadfast_api_key';

    if (isMock) {
      // High-Torque Simulated Steadfast Consignment for Development / Testing
      const randomConsignment = Math.floor(10000000 + Math.random() * 90000000).toString();
      const trackingCode = `STDF-${randomConsignment.slice(0, 6)}`;

      return {
        success: true,
        courierProvider: 'STEADFAST',
        consignmentId: randomConsignment,
        trackingCode,
        status: 'in_review',
        deliveryFee: payload.district.toLowerCase() === 'dhaka' ? 70 : 130,
        rawResponse: {
          status: 200,
          message: 'Order created successfully in Steadfast (Sandbox Simulation)',
          consignment: {
            consignment_id: randomConsignment,
            invoice: payload.invoice,
            tracking_code: trackingCode,
            status: 'in_review',
          },
        },
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/create_order`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Secret-Key': this.secretKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice: payload.invoice,
          recipient_name: payload.recipientName,
          recipient_phone: payload.recipientPhone,
          recipient_address: `${payload.recipientAddress}, ${payload.thana}, ${payload.district}`,
          cod_amount: payload.codAmount,
          note: payload.note || 'ROVIN Precision RC Gear. Handle with care.',
        }),
      });

      const data: any = await response.json();

      if (!response.ok || data.status !== 200) {
        return {
          success: false,
          courierProvider: 'STEADFAST',
          consignmentId: '',
          trackingCode: '',
          status: 'FAILED',
          error: data.message || `Steadfast Gateway Error: HTTP ${response.status}`,
          rawResponse: data,
        };
      }

      const consignment = data.consignment;
      return {
        success: true,
        courierProvider: 'STEADFAST',
        consignmentId: String(consignment.consignment_id),
        trackingCode: consignment.tracking_code || String(consignment.consignment_id),
        status: consignment.status || 'in_review',
        deliveryFee: payload.district.toLowerCase() === 'dhaka' ? 70 : 130,
        rawResponse: data,
      };
    } catch (err: any) {
      console.error('[Steadfast API Error]:', err);
      return {
        success: false,
        courierProvider: 'STEADFAST',
        consignmentId: '',
        trackingCode: '',
        status: 'NETWORK_ERROR',
        error: `Steadfast Connection Timeout / Network Fault: ${err.message}`,
      };
    }
  }

  async trackShipment(consignmentId: string): Promise<{ status: string; raw?: any }> {
    const isMock = !this.apiKey || this.apiKey === 'your_steadfast_api_key';
    if (isMock) {
      return { status: 'in_transit', raw: { message: 'Simulation active' } };
    }

    try {
      const res = await fetch(`${this.baseUrl}/status_by_cid/${consignmentId}`, {
        headers: {
          'Api-Key': this.apiKey,
          'Secret-Key': this.secretKey,
        },
      });
      const data: any = await res.json();
      return { status: data.delivery_status || 'unknown', raw: data };
    } catch (err: any) {
      return { status: 'ERROR', raw: { error: err.message } };
    }
  }
}

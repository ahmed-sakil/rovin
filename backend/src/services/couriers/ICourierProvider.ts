export interface CourierOrderPayload {
  invoice: string;           // ROVIN Order Number, e.g. ROV-202609-1001
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  district: string;
  thana: string;
  codAmount: number;         // Amount in BDT to collect
  note?: string;
  weightGrams?: number;
  itemDescription?: string;
}

export interface CourierShipmentResult {
  success: boolean;
  courierProvider: 'STEADFAST' | 'PATHAO' | 'MANUAL';
  consignmentId: string;
  trackingCode: string;
  status: string;
  deliveryFee?: number;
  rawResponse?: any;
  error?: string;
}

export interface ICourierProvider {
  createShipment(order: CourierOrderPayload): Promise<CourierShipmentResult>;
  trackShipment(consignmentId: string): Promise<{ status: string; raw?: any }>;
}

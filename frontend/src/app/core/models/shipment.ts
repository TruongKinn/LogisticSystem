export interface Shipment {
  id?: number;
  shipmentCode: string;
  orderRef: string;
  driverId?: number;
  vehicleId?: number;
  status: ShipmentStatus;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  weightKg?: number;
  codAmount?: number;
  note?: string;
  estimatedAt?: Date;
  deliveredAt?: Date;
  createdAt?: Date;
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED'
}

export interface Vehicle {
  id?: number;
  plateNumber: string;
  type: VehicleType;
  brand?: string;
  model?: string;
  maxWeightKg?: number;
  volumeM3?: number;
  status: VehicleStatus;
  currentDriverId?: number;
  yearOfManufacture?: number;
  createdAt?: Date;
}

export enum VehicleType {
  MOTORBIKE = 'MOTORBIKE',
  CAR = 'CAR',
  VAN = 'VAN',
  TRUCK = 'TRUCK'
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE'
}

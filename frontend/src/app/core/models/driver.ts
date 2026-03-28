export interface Driver {
  id?: number;
  employeeCode: string;
  fullName: string;
  phone: string;
  email?: string;
  licenseNo?: string;
  licenseType?: string;
  status: DriverStatus;
  zone?: string;
  rating?: number;
  totalDeliveries?: number;
  createdAt?: Date;
}

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
  SUSPENDED = 'SUSPENDED'
}

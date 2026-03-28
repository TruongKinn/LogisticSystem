import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Shipment, ShipmentStatus } from '../models/shipment';
import { Driver, DriverStatus } from '../models/driver';
import { Vehicle } from '../models/vehicle';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:4953'; // URL API Gateway

  constructor(private http: HttpClient) { }

  // Shipment APIs
  getShipments(): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(`${this.baseUrl}/shipment`);
  }

  getShipmentByCode(code: string): Observable<Shipment> {
    return this.http.get<Shipment>(`${this.baseUrl}/shipment/code/${code}`);
  }

  createShipment(shipment: Partial<Shipment>): Observable<Shipment> {
    return this.http.post<Shipment>(`${this.baseUrl}/shipment`, shipment);
  }

  updateShipmentStatus(id: number, status: ShipmentStatus, note?: string): Observable<Shipment> {
    return this.http.put<Shipment>(`${this.baseUrl}/shipment/${id}/status`, { status, note });
  }

  // Driver APIs
  getDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${this.baseUrl}/driver`);
  }

  updateDriverStatus(id: number, status: DriverStatus): Observable<Driver> {
    return this.http.put<Driver>(`${this.baseUrl}/driver/${id}/status?status=${status}`, {});
  }

  // Vehicle APIs
  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.baseUrl}/vehicle`);
  }

  // Logistics Orchestrator API
  assignDelivery(shipmentCode: string, driverId: number, vehicleId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/logistics/assign?shipmentCode=${shipmentCode}&driverId=${driverId}&vehicleId=${vehicleId}`, {});
  }

  getFullDeliveryInfo(shipmentCode: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/logistics/info/${shipmentCode}`);
  }

  // Tracking API
  getTrackingHistory(shipmentCode: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tracking/shipment/${shipmentCode}/history`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class LogisticService {

  private baseUrl = API_CONFIG.GATEWAY_URL;

  constructor(private http: HttpClient) { }

  // Shipment APIs
  getShipments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/shipment`);
  }

  getShipmentByCode(code: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/shipment/code/${code}`);
  }

  getShipmentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/shipment/${id}`);
  }

  createShipment(shipment: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/shipment`, shipment);
  }

  updateShipmentStatus(id: number, status: string, note?: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/shipment/${id}/status`, { status, note });
  }

  // Driver APIs
  getDrivers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/driver`);
  }

  getDriverById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/driver/${id}`);
  }

  createDriver(driver: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/driver`, driver);
  }

  importDrivers(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/driver/import`, formData);
  }

  downloadDriverImportTemplate(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/driver/import-template`, { responseType: 'blob' });
  }

  updateDriverStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/driver/${id}/status?status=${status}`, {});
  }

  // Vehicle APIs
  getVehicles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/vehicle`);
  }

  getVehicleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/vehicle/${id}`);
  }

  createVehicle(vehicle: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/vehicle`, vehicle);
  }

  // Logistics Orchestrator API
  assignDelivery(shipmentCode: string, driverId: number, vehicleId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/logistics/assign?shipmentCode=${shipmentCode}&driverId=${driverId}&vehicleId=${vehicleId}`, {});
  }

  unassignShipment(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/shipment/${id}/unassign`, {});
  }

  getFullDeliveryInfo(shipmentCode: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/logistics/info/${shipmentCode}`);
  }

  // Tracking API
  getTrackingHistory(shipmentCode: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tracking/shipment/${shipmentCode}/history`);
  }

  getCurrentTracking(shipmentCode: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/tracking/shipment/${shipmentCode}/current`);
  }
}

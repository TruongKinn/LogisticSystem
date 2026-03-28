import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { Shipment } from '../../../../core/models/shipment';
import * as L from 'leaflet';

@Component({
  selector: 'app-shipment-detail',
  templateUrl: './shipment-detail.component.html',
  styleUrls: ['./shipment-detail.component.scss']
})
export class ShipmentDetailComponent implements OnInit, AfterViewInit {

  shipmentId: number = 0;
  shipment!: Shipment;
  trackingHistory: any[] = [];
  
  private map!: L.Map;
  private marker!: L.Marker;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.shipmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadShipmentData();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  loadShipmentData(): void {
    this.apiService.getShipments().subscribe(list => {
      this.shipment = list.find(s => s.id === this.shipmentId)!;
      if (this.shipment) {
        this.loadTrackingHistory(this.shipment.shipmentCode);
      }
    });
  }

  loadTrackingHistory(code: string): void {
    this.apiService.getTrackingHistory(code).subscribe(history => {
      this.trackingHistory = history;
      if (history.length > 0) {
        // Cập nhật vị trí trên bản đồ giả lập
        this.updateMapLocation(10.7769, 106.7009); // Tọa độ giả lập TP.HCM
      }
    });
  }

  private initMap(): void {
    this.map = L.map('map').setView([10.7769, 106.7009], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap drivers'
    }).addTo(this.map);
    
    this.marker = L.marker([10.7769, 106.7009]).addTo(this.map)
      .bindPopup('Vị trí hiện tại của tài xế')
      .openPopup();
  }

  private updateMapLocation(lat: number, lng: number): void {
    if (this.map) {
      this.map.setView([lat, lng], 15);
      this.marker.setLatLng([lat, lng]);
    }
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }
}

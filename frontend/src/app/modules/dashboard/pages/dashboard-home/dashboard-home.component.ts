import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { Shipment } from '../../../../core/models/shipment';
import { Driver } from '../../../../core/models/driver';
import { Vehicle } from '../../../../core/models/vehicle';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {

  stats = {
    totalShipments: 0,
    activeDrivers: 0,
    availableVehicles: 0,
    pendingTask: 0
  };

  recentShipments: Shipment[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.getShipments().subscribe(data => {
      this.recentShipments = data.slice(0, 5);
      this.stats.totalShipments = data.length;
      this.stats.pendingTask = data.filter(s => s.status === 'PENDING').length;
    });

    this.apiService.getDrivers().subscribe(data => {
      this.stats.activeDrivers = data.filter(d => d.status === 'AVAILABLE' || d.status === 'BUSY').length;
    });

    this.apiService.getVehicles().subscribe(data => {
      this.stats.availableVehicles = data.filter(v => v.status === 'AVAILABLE').length;
    });
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }
}

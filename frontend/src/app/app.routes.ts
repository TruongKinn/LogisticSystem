import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule) 
  },
  { 
    path: 'shipment', 
    loadChildren: () => import('./modules/shipment/shipment.module').then(m => m.ShipmentModule) 
  },
  { 
    path: 'driver', 
    loadChildren: () => import('./modules/driver/driver.module').then(m => m.DriverModule) 
  },
  { 
    path: 'vehicle', 
    loadChildren: () => import('./modules/vehicle/vehicle.module').then(m => m.VehicleModule) 
  }
];

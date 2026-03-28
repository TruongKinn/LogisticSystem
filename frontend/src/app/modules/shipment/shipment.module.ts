import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShipmentListComponent } from './pages/shipment-list/shipment-list.component';
import { ShipmentDetailComponent } from './pages/shipment-detail/shipment-detail.component';
import { ShipmentRoutingModule } from './shipment-routing.module';

@NgModule({
  declarations: [
    ShipmentListComponent,
    ShipmentDetailComponent
  ],
  imports: [
    CommonModule,
    ShipmentRoutingModule
  ]
})
export class ShipmentModule { }

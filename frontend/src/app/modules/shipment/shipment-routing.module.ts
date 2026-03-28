import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShipmentListComponent } from './pages/shipment-list/shipment-list.component';
import { ShipmentDetailComponent } from './pages/shipment-detail/shipment-detail.component';

const routes: Routes = [
  { path: '', component: ShipmentListComponent },
  { path: ':id', component: ShipmentDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShipmentRoutingModule { }

import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard), canActivate: [authGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: '2fa-setup', loadComponent: () => import('./auth/two-factor-setup/two-factor-setup').then(m => m.TwoFactorSetupComponent), canActivate: [authGuard] },
    { path: 'crypto', loadComponent: () => import('./crypto/crypto.component').then(m => m.CryptoComponent), canActivate: [authGuard] },
    { path: 'user', loadChildren: () => import('./user/user.routes').then(m => m.USER_ROUTES), canActivate: [authGuard] },
    { path: 'shipments', loadComponent: () => import('./shipment/shipment-list/shipment-list').then(m => m.ShipmentList), canActivate: [authGuard] },
    { path: 'shipments/:id', loadComponent: () => import('./shipment/shipment-detail/shipment-detail').then(m => m.ShipmentDetail), canActivate: [authGuard] },
    { path: 'drivers', loadComponent: () => import('./driver/driver-list/driver-list').then(m => m.DriverList), canActivate: [authGuard] },
    { path: 'vehicles', loadComponent: () => import('./vehicle/vehicle-list/vehicle-list').then(m => m.VehicleList), canActivate: [authGuard] },
    { path: 'tracking', loadComponent: () => import('./tracking/tracking-view/tracking-view').then(m => m.TrackingView), canActivate: [authGuard] },
    { path: 'orchestrator', loadComponent: () => import('./orchestrator/saga-transaction-list/saga-transaction-list.component').then(m => m.SagaTransactionListComponent), canActivate: [authGuard] },
    { path: 'ai-assistant', loadComponent: () => import('./ai-assistant/components/chat/chat.component').then(m => m.ChatComponent), canActivate: [authGuard] },
    { path: 'excel-io', loadComponent: () => import('./common/excel-io/excel-io.component').then(m => m.ExcelIoComponent), canActivate: [authGuard] },
    { path: 'file-extraction', loadComponent: () => import('./common/file-extraction/file-extraction.component').then(m => m.FileExtractionComponent), canActivate: [authGuard] },
    { path: '403', loadComponent: () => import('./shared/components/forbidden/forbidden.component').then(m => m.ForbiddenComponent) },
    { path: '**', redirectTo: '' }
];

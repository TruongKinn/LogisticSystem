import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { UserStats, OrderStats, ProductStats, DashboardStats } from '../models/dashboard-stats.model';
import { API_CONFIG } from '../constants/api.constant';

@Injectable({
    providedIn: 'root'
})
export class DashboardService extends BaseApiService {

    constructor() {
        super(API_CONFIG.GATEWAY_URL);
    }

    getUserStats(): Observable<UserStats> {
        return this.get<UserStats>('/account/user/stats');
    }

    getOrderStats(): Observable<OrderStats> {
        return this.get<OrderStats>('/order/statistics');
    }

    getProductStats(): Observable<ProductStats> {
        return this.get<ProductStats>('/product/stats');
    }

    getAllStats(): Observable<DashboardStats> {
        return forkJoin({
            userStats: this.getUserStats(),
            orderStats: this.getOrderStats(),
            productStats: this.getProductStats()
        });
    }
}

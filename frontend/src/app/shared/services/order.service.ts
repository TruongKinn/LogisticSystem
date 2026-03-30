import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../constants/api.constant';

export interface OrderItemRequest {
    productId: number;
    quantity: number;
    price: number;
    unit: string;
    productName: string;
}

export interface PlaceOrderRequest {
    customerId: number;
    amount: number;
    currency: string;
    paymentMethod: string;
    orderItems: OrderItemRequest[];
}

export interface OrderRequest {
    orderId: string;
    amount: number;
}

export interface OrderResponse {
    id: string;
    customerId: number;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: number;
    statusName: string;
    createdAt: string;
    updatedAt: string;
    orderItems: any[];
}

export interface OrderStatistics {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
}

@Injectable({
    providedIn: 'root'
})
export class OrderService extends BaseApiService {

    constructor() {
        super(`${API_CONFIG.GATEWAY_URL}/order`);
    }

    getAllOrders(): Observable<OrderResponse[]> {
        return this.get<OrderResponse[]>('/list');
    }

    placeOrder(request: PlaceOrderRequest): Observable<string> {
        return this.postText('/placeOrder', request);
    }

    generateQRCode(qrCode: string): Observable<Blob> {
        return this.http.post(`${this.baseUrl}/qrcode`, null, {
            params: { qrCode },
            responseType: 'blob'
        });
    }

    generateBarcode(barcode: string): Observable<Blob> {
        return this.http.post(`${this.baseUrl}/bar-code`, null, {
            params: { barcode },
            responseType: 'blob'
        });
    }

    checkoutOrder(orderId: string): Observable<string> {
        return this.postText(`/checkout/${orderId}`, {});
    }

    createOrder(request: OrderRequest): Observable<string> {
        return this.postText('', request);
    }

    cancelOrder(request: OrderRequest): Observable<string> {
        return this.postText('/compensate', request);
    }

    getStatistics(): Observable<OrderStatistics> {
        return this.get<OrderStatistics>('/statistics');
    }

    exportOrders(): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/export`, {
            responseType: 'blob'
        });
    }
}

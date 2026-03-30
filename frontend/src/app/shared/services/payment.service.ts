import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { Payment } from '../models/payment.model';
import { API_CONFIG } from '../constants/api.constant';

@Injectable({
    providedIn: 'root'
})
export class PaymentService extends BaseApiService {

    constructor() {
        super(`${API_CONFIG.GATEWAY_URL}/payment`);
    }

    getAllPayments(): Observable<Payment[]> {
        return this.get<Payment[]>('');
    }
}

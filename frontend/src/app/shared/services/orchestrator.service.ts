import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { SagaTransaction } from '../models/saga-transaction.model';
import { API_CONFIG } from '../constants/api.constant';

@Injectable({
    providedIn: 'root'
})
export class OrchestratorService extends BaseApiService {

    constructor() {
        super(`${API_CONFIG.GATEWAY_URL}/orchestrator`);
    }

    getTransactions(): Observable<SagaTransaction[]> {
        return this.get<SagaTransaction[]>('/order-saga/transactions');
    }

    getTransaction(id: string): Observable<SagaTransaction> {
        return this.get<SagaTransaction>(`/order-saga/transactions/${id}`);
    }
}

import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { Inventory } from '../models/inventory.model';
import { API_CONFIG } from '../constants/api.constant';

export interface InventoryPageResponse {
    content: Inventory[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

@Injectable({
    providedIn: 'root'
})
export class InventoryService extends BaseApiService {

    constructor() {
        super(`${API_CONFIG.GATEWAY_URL}/inventory`);
    }

    getAllInventory(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'id',
        sortDirection: string = 'DESC'
    ): Observable<InventoryPageResponse> {
        const params = {
            page: page.toString(),
            size: size.toString(),
            sortBy,
            sortDirection
        };
        return this.get<InventoryPageResponse>('', params);
    }

    getInventoryById(id: number): Observable<Inventory> {
        return this.get<Inventory>(`/${id}`);
    }

    addInventory(inventory: Inventory): Observable<Inventory> {
        return this.post<Inventory>('', inventory);
    }

    updateInventory(id: number, inventory: Inventory): Observable<Inventory> {
        return this.put<Inventory>(`/${id}`, inventory);
    }

    deleteInventory(id: number): Observable<void> {
        return this.delete<void>(`/${id}`);
    }
}

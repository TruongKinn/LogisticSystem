import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { ProductCreationRequest, ProductResponse, ProductUpdateRequest, Page } from '../models/product.model';
import { API_CONFIG } from '../constants/api.constant';

@Injectable({
    providedIn: 'root'
})
export class ProductService extends BaseApiService {

    constructor() {
        super(`${API_CONFIG.GATEWAY_URL}/product`);
    }

    getProducts(name?: string, page: number = 0, size: number = 50): Observable<Page<ProductResponse>> {
        const params: any = { page, size };
        if (name) {
            params.name = name;
        }
        return this.get<Page<ProductResponse>>('/list', params);
    }

    addProduct(product: ProductCreationRequest): Observable<number> {
        return this.post<number>('/add', product);
    }

    updateProduct(product: ProductUpdateRequest): Observable<void> {
        return this.put<void>('/upd', product);
    }

    deleteProduct(productId: number): Observable<void> {
        return this.delete<void>(`/del/${productId}`);
    }

    generateTestData(count: number): Observable<string> {
        // Use longer timeout for generating large datasets (5 minutes)
        return this.postTextWithTimeout(`/generate-test-data?count=${count}`, {});
    }

    fixElasticsearch(): Observable<string> {
        // Use longer timeout for fixing Elasticsearch (5 minutes)
        return this.postTextWithTimeout('/fix-elasticsearch', {});
    }
}

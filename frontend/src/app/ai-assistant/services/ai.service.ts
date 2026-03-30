import { Injectable } from '@angular/core';
import { BaseApiService } from '../../shared/services/base-api.service';
import { Observable } from 'rxjs';
import { GeminiChatRequest, GeminiChatResponse, RagChatRequest, RagChatResponse, RagStatusResponse } from '../models/ai.model';
import { API_CONFIG } from '../../shared/constants/api.constant';

@Injectable({
    providedIn: 'root'
})
export class AiService extends BaseApiService {

    constructor() {
        super(`${API_CONFIG.GATEWAY_URL}/ai`);
    }

    /** Plain Gemini chat — không có context sản phẩm */
    chat(prompt: string): Observable<GeminiChatResponse> {
        return this.post<GeminiChatResponse>('/gemini/chat', { prompt });
    }

    /** RAG chat — AI trả lời dựa trên catalog sản phẩm thực */
    ragChat(message: string, topK: number = 5): Observable<RagChatResponse> {
        return this.post<RagChatResponse>('/rag/chat', { message, topK } as RagChatRequest);
    }

    /** Lấy trạng thái index pgvector */
    getRagStatus(): Observable<RagStatusResponse> {
        return this.get<RagStatusResponse>('/rag/status');
    }

    /** Trigger bulk-index toàn bộ sản phẩm từ product-service → pgvector */
    syncRagIndex(): Observable<{ message: string; checkStatusAt: string }> {
        return this.post<{ message: string; checkStatusAt: string }>('/rag/index/sync', {});
    }
}

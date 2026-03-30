export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    source?: 'gemini' | 'rag';  // nguồn trả lời
    isRag?: boolean;            // có dùng RAG không
}

export interface GeminiChatRequest {
    prompt: string;
}

export interface GeminiChatResponse {
    answer: string;
}

export interface RagChatRequest {
    message: string;
    topK?: number;
}

export interface RagChatResponse {
    question: string;
    answer: string;
    source: string;
}

export interface RagStatusResponse {
    indexedProducts: number;
    status: string;
    embeddingModel: string;
    dimensions: number;
    syncing: boolean;
}

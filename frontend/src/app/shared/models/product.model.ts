export interface ProductCreationRequest {
    name: string;
    description: string;
    price: number;
    userId: number;
}

export interface ProductUpdateRequest {
    id: number;
    name: string;
    description: string;
    price: number;
    userId: number;
}

export interface ProductResponse {
    id: number;
    name: string;
    description: string;
    price: number;
    userId: number;
}

export interface Page<T> {
    page: number;
    size: number;
    total: number;
    items: T[];
}

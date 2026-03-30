export interface PageResponse<T> {
    page: number;
    size: number;
    total: number;
    items: T[];
}

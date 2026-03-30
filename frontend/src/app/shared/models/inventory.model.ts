export interface Inventory {
    id: number;
    product: string;
    quantity: number;
    createdAt: string;
    updatedAt: string;
}

export enum InventoryStatus {
    LOW = 'LOW',        // < 10
    WARNING = 'WARNING', // 10-49
    SUFFICIENT = 'SUFFICIENT' // >= 50
}

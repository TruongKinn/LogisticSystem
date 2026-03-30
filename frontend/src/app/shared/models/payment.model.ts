export interface Payment {
    id: number;
    orderId: string;
    customerId: number;
    amount: number;
    currency: string;
    description: string;
    provider: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export enum PaymentStatus {
    NEW = 'NEW',
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    PROCESSING = 'PROCESSING',
    CANCELED = 'CANCELED',
    PAID = 'PAID',
    CLOSED = 'CLOSED'
}

export interface SagaTransaction {
    id: string;
    orderId: string;
    status: string;
    currentStep: string;
    logs: string[];
    createdAt: string;
    updatedAt: string;
}

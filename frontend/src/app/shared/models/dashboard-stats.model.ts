export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    blockedUsers: number;
    newUsersLast7Days: number;
    newUsersLast30Days: number;
}

export interface OrderStats {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
}

export interface ProductStats {
    totalProducts: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    productsLast7Days: number;
    productsLast30Days: number;
    topCategories: { [key: string]: number };
}

export interface DashboardStats {
    userStats?: UserStats;
    orderStats?: OrderStats;
    productStats?: ProductStats;
}

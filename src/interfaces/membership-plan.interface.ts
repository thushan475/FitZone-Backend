
export interface IMembershipPlan {
    name: string;
    description?: string;
    durationDays: number;
    price: number;
    features: string[];
    isActive: boolean;
}

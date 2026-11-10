
export type UserRole = "ADMIN" | "TRAINER" | "MEMBER";

export interface IUser {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
    isActive: boolean;
    specialization?: string;
    experience?: number;
    qualifications?: string;
}

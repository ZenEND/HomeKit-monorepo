import { apiInstance } from "./instance";
import type { RolesEnum } from "@/store/useUserStore";

export type User = {
    id: string;
    email: string;
    roles: RolesEnum[];
};

export const login = async (email: string, password: string): Promise<string> => {
    const response = await apiInstance.post<string>('/auth/login', { email, password });
    return response.data;
}

export const register = async (email: string, password: string): Promise<User> => {
    const response = await apiInstance.post<User>('/auth/register', { email, password });
    return response.data;
}

export const getMe = async (): Promise<User> => {
    const response = await apiInstance.get<User>('/users/me');
    return response.data;
}
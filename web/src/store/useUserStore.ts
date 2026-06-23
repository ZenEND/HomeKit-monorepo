import { getMe, login as loginUser, register as registerUser, type User } from "@/api/auth";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/api/instance";
import { create } from "zustand";

const PROFILE_AVATAR_SRC_KEY = 'homekit.profileAvatarSrc';
const PROFILE_AVATAR_EMOJI_KEY = 'homekit.profileAvatarEmoji';

const getStoredValue = (key: string) => {
    if (typeof window === 'undefined') return null;

    return window.localStorage.getItem(key);
};

export enum RolesEnum {
    Any = "ANY",
    Guest = "GUEST",
    Admin = "ADMIN"
}

type UserState = {
    user: User | null;
    token: string | null;
    avatarSrc: string | null;
    avatarEmoji: string | null;
    isInitialized: boolean;
    isLoading: boolean;
    initialize: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
    setProfilePhoto: (avatarSrc: string) => void;
    setProfileAvatar: (avatarEmoji: string) => void;
    setUser: (user: User) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    token: getAuthToken(),
    avatarSrc: getStoredValue(PROFILE_AVATAR_SRC_KEY),
    avatarEmoji: getStoredValue(PROFILE_AVATAR_EMOJI_KEY),
    isInitialized: false,
    isLoading: false,
    initialize: async () => {
        const token = getAuthToken();

        if (!token) {
            set({ user: null, token: null, isInitialized: true });
            return;
        }

        set({ token, isLoading: true });

        try {
            const user = await getMe();
            set({ user, isInitialized: true });
        } catch {
            clearAuthToken();
            set({ user: null, token: null, isInitialized: true });
        } finally {
            set({ isLoading: false });
        }
    },
    login: async (email, password) => {
        set({ isLoading: true });

        try {
            const token = await loginUser(email, password);
            setAuthToken(token);

            const user = await getMe();
            set({ user, token, isInitialized: true });
        } catch (error) {
            clearAuthToken();
            set({ user: null, token: null });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
    register: async (email, password) => {
        await registerUser(email, password);
        await get().login(email, password);
    },
    logout: () => {
        clearAuthToken();
        set({ user: null, token: null, isInitialized: true });
    },
    setProfilePhoto: (avatarSrc) => {
        window.localStorage.setItem(PROFILE_AVATAR_SRC_KEY, avatarSrc);
        window.localStorage.removeItem(PROFILE_AVATAR_EMOJI_KEY);
        set({ avatarSrc, avatarEmoji: null });
    },
    setProfileAvatar: (avatarEmoji) => {
        window.localStorage.setItem(PROFILE_AVATAR_EMOJI_KEY, avatarEmoji);
        window.localStorage.removeItem(PROFILE_AVATAR_SRC_KEY);
        set({ avatarSrc: null, avatarEmoji });
    },
    setUser: (user) => set({ user }),
}));


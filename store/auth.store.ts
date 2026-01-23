import { AuthStoreType } from "@/types/auth.types";
import { create } from "zustand";
import storageService from "@/services/storage.service";
import { persist, createJSONStorage } from "zustand/middleware";
import { secureStore } from "@/utils";

export const useAuthStore = create<AuthStoreType>()(
  persist(
    (set) => {
      return {
        user: null,
        _hydrated: false,
        hasCompletedOnboarding: false,
        setOnboarding: (value: boolean) => {
          set({ hasCompletedOnboarding: value });
        },
        completeOnboarding: () => {
          console.log("set")
          set({ hasCompletedOnboarding: true });
        },

        setHasHydrated: (value: boolean) => {
          set({ _hydrated: value });
        },

        logout: async () => {
          await storageService.removeItem("access");
          await storageService.removeItem("refresh");
          set({ user: null });
        },
        setTokens: async (access: string, refresh: string) => {
          await storageService.setItem("access", access);
          await storageService.setItem("refresh", refresh);
        },
      };
    },
    {
      name: "auth-store",
      storage: createJSONStorage(() => secureStore),
      partialize: (state) => ({
        user: state.user,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
      onRehydrateStorage: (state) => {
        state.setHasHydrated(true);
      },
    }
  )
);


export const authStore = useAuthStore;
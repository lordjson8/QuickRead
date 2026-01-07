import { StateStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

export const secureStore: StateStorage = {
  getItem: async (key: string) => {
    const item = await SecureStore.getItemAsync(key);
    return item ?? null;
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key);
  },
};

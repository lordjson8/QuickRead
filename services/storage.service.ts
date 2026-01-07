import * as SecureStore from "expo-secure-store";

class StorageService {
  async getItem(key: string): Promise<string | null> {
    try {
      const item = await SecureStore.getItemAsync(key);
      return item;
    } catch (error) {
      console.info(`Error getting ${key} item error: ${error}`);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.info(`Error setting ${key} item error: ${error}`);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.info(`Error deleting ${key} item error: ${error}`);
      throw error;
    }
  }
}

export default new StorageService()

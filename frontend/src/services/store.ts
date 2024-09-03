// /src/services/store.ts
import { create } from "zustand";

interface Store {
  username: string;
  setUsername: (username: string) => void;
}

export const useStore = create<Store>((set) => ({
  username: "N/A",
  setUsername: (username) => set({ username }),
}));

export const useUsername = () => useStore((state) => state.username);
export const useSetUsername = () => useStore((state) => state.setUsername);

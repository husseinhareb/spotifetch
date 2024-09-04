// /src/services/store.ts
import { create } from "zustand";

interface Store {
  username: string;
  email: string;
  profileImage: string | null;
  country: string;
  product: string;
  setUsername: (username: string) => void;
  setEmail: (email: string) => void;
  setProfileImage: (profileImage: string | null) => void;
  setCountry: (country: string) => void;
  setProduct: (product: string) => void;
}

export const useStore = create<Store>((set) => ({
  username: "N/A",
  email: "N/A",
  profileImage: null,
  country: "N/A",
  product: "N/A",
  setUsername: (username) => set({ username }),
  setEmail: (email) => set({ email }),
  setProfileImage: (profileImage) => set({ profileImage }),
  setCountry: (country) => set({ country }),
  setProduct: (product) => set({ product }),
}));

export const useUsername = () => useStore((state) => state.username);
export const useEmail = () => useStore((state) => state.email);
export const useProfileImage = () => useStore((state) => state.profileImage);
export const useCountry = () => useStore((state) => state.country);
export const useProduct = () => useStore((state) => state.product);
export const useSetUsername = () => useStore((state) => state.setUsername);
export const useSetEmail = () => useStore((state) => state.setEmail);
export const useSetProfileImage = () => useStore((state) => state.setProfileImage);
export const useSetCountry = () => useStore((state) => state.setCountry);
export const useSetProduct = () => useStore((state) => state.setProduct);

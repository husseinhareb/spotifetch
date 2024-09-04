// /src/services/store.ts
import { create } from "zustand";
interface Store {
  username: string;
  email: string;
  profileImage: string | null;
  country: string;
  product: string;
  currentTrack: string;
  currentArtist: string;
  albumImage: string | null;
  isPlaying: boolean;
  setUsername: (username: string) => void;
  setEmail: (email: string) => void;
  setProfileImage: (profileImage: string | null) => void;
  setCountry: (country: string) => void;
  setProduct: (product: string) => void;
  setCurrentTrack: (track: string) => void;
  setCurrentArtist: (artist: string) => void;
  setAlbumImage: (image: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  username: "N/A",
  email: "N/A",
  profileImage: null,
  country: "N/A",
  product: "N/A",
  currentTrack: "N/A",
  currentArtist: "N/A",
  albumImage: null,
  isPlaying: false,
  setUsername: (username) => set({ username }),
  setEmail: (email) => set({ email }),
  setProfileImage: (profileImage) => set({ profileImage }),
  setCountry: (country) => set({ country }),
  setProduct: (product) => set({ product }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setCurrentArtist: (artist) => set({ currentArtist: artist }),
  setAlbumImage: (image) => set({ albumImage: image }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
}));

export const useUsername = () => useStore((state) => state.username);
export const useEmail = () => useStore((state) => state.email);
export const useProfileImage = () => useStore((state) => state.profileImage);
export const useCountry = () => useStore((state) => state.country);
export const useProduct = () => useStore((state) => state.product);
export const useCurrentTrack = () => useStore((state) => state.currentTrack);
export const useCurrentArtist = () => useStore((state) => state.currentArtist);
export const useAlbumImage = () => useStore((state) => state.albumImage);
export const useIsPlaying = () => useStore((state) => state.isPlaying);
export const useSetUsername = () => useStore((state) => state.setUsername);
export const useSetEmail = () => useStore((state) => state.setEmail);
export const useSetProfileImage = () => useStore((state) => state.setProfileImage);
export const useSetCountry = () => useStore((state) => state.setCountry);
export const useSetProduct = () => useStore((state) => state.setProduct);
export const useSetCurrentTrack = () => useStore((state) => state.setCurrentTrack);
export const useSetCurrentArtist = () => useStore((state) => state.setCurrentArtist);
export const useSetAlbumImage = () => useStore((state) => state.setAlbumImage);
export const useSetIsPlaying = () => useStore((state) => state.setIsPlaying);

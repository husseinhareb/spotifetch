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
  isLoggedIn: boolean;
  authChecked: boolean;                     // ← new
  topArtists: { name: string; genres: string[]; imageUrl: string | null }[];
  setUsername: (username: string) => void;
  setEmail: (email: string) => void;
  setProfileImage: (profileImage: string | null) => void;
  setCountry: (country: string) => void;
  setProduct: (product: string) => void;
  setCurrentTrack: (track: string) => void;
  setCurrentArtist: (artist: string) => void;
  setAlbumImage: (image: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsLoggedIn: (status: boolean) => void; // <-- Add a setter
  setAuthChecked: (checked: boolean) => void; // ← new
  setTopArtists: (
    artists: { name: string; genres: string[]; imageUrl: string | null }[]
  ) => void;
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
  isLoggedIn: false,
  authChecked: false,
  topArtists: [],
  setUsername: (username) => set({ username }),
  setEmail: (email) => set({ email }),
  setProfileImage: (profileImage) => set({ profileImage }),
  setCountry: (country) => set({ country }),
  setProduct: (product) => set({ product }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setCurrentArtist: (artist) => set({ currentArtist: artist }),
  setAlbumImage: (image) => set({ albumImage: image }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setTopArtists: (artists) => set({ topArtists: artists }),
  setIsLoggedIn: (status) => set({ isLoggedIn: status }), // Setter for isLoggedIn
  setAuthChecked: (checked) => set({ authChecked: checked }), // ← new
}));

// Selectors for accessing state
export const useUsername = () => useStore((state) => state.username);
export const useEmail = () => useStore((state) => state.email);
export const useProfileImage = () => useStore((state) => state.profileImage);
export const useCountry = () => useStore((state) => state.country);
export const useProduct = () => useStore((state) => state.product);
export const useCurrentTrack = () => useStore((state) => state.currentTrack);
export const useCurrentArtist = () => useStore((state) => state.currentArtist);
export const useAlbumImage = () => useStore((state) => state.albumImage);
export const useIsPlaying = () => useStore((state) => state.isPlaying);
export const useTopArtists = () => useStore((state) => state.topArtists);
export const useIsLoggedIn = () => useStore((state) => state.isLoggedIn); // Selector for isLoggedIn
// Setters for updating state
export const useSetUsername = () => useStore((state) => state.setUsername);
export const useSetEmail = () => useStore((state) => state.setEmail);
export const useSetProfileImage = () => useStore((state) => state.setProfileImage);
export const useSetCountry = () => useStore((state) => state.setCountry);
export const useSetProduct = () => useStore((state) => state.setProduct);
export const useSetCurrentTrack = () => useStore((state) => state.setCurrentTrack);
export const useSetCurrentArtist = () => useStore((state) => state.setCurrentArtist);
export const useSetAlbumImage = () => useStore((state) => state.setAlbumImage);
export const useSetIsPlaying = () => useStore((state) => state.setIsPlaying);
export const useSetTopArtists = () => useStore((state) => state.setTopArtists);
export const useSetIsLoggedIn = () => useStore((state) => state.setIsLoggedIn); 

// at the bottom, alongside your other exports:
export const useAuthChecked = () => useStore((s) => s.authChecked);
export const useSetAuthChecked = () => useStore((s) => s.setAuthChecked);

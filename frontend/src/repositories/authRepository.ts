// src/repositories/authRepository.ts
import { api } from "./apiConfig";

export interface UserInfo {
  id: string;                   
  display_name: string;
  email: string;
  images?: { url: string }[];
  country: string;
  product: string;
}

export async function checkLoginStatus(): Promise<UserInfo> {
  // NOTE: calls /auth/user_info, which must now return { id, display_name, email, images, country, product }
  const resp = await api.get<UserInfo>("/auth/user_info");
  return resp.data;
}

export async function getLoginUrl(): Promise<{ auth_url: string }> {
  // calls /auth/login to fetch the OAuth URL
  const resp = await api.get<{ auth_url: string }>("/auth/login");
  return resp.data;
}

export async function logout(): Promise<void> {
  // calls /auth/logout on your backend
  await api.get("/auth/logout");
}

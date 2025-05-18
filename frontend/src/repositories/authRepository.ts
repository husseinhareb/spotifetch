// src/repositories/authRepository.ts
import axios from 'axios';

export interface UserInfo {
  display_name: string;
  email: string;
  images?: { url: string }[];
  country: string;
  product: string;
}

export async function checkLoginStatus(): Promise<UserInfo> {
  const resp = await axios.get<UserInfo>('/auth/login', { withCredentials: true });
  return resp.data;
}

export async function getLoginUrl(): Promise<{ auth_url: string }> {
  const resp = await axios.get<{ auth_url: string }>('/auth/login', { withCredentials: true });
  return resp.data;
}

export async function logout(): Promise<void> {
  await axios.get('/auth/logout', { withCredentials: true });
}

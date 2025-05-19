// src/repositories/authRepository.ts
import axios from 'axios';

export interface UserInfo {
  display_name: string;
  email: string;
  images?: { url: string }[];
  country: string;
  product: string;
}

// create *one* axios instance for your backend
const api = axios.create({
  baseURL: 'http://localhost:8000',  // your FastAPI server
  withCredentials: true,             // include cookies
});

export async function checkLoginStatus(): Promise<UserInfo> {
  // NOTE: calls /auth/user_info, *not* /auth/login
  const resp = await api.get<UserInfo>('/auth/user_info');
  return resp.data;
}

export async function getLoginUrl(): Promise<{ auth_url: string }> {
  // calls /auth/login to fetch the OAuth URL
  const resp = await api.get<{ auth_url: string }>('/auth/login');
  return resp.data;
}

export async function logout(): Promise<void> {
  // calls /auth/logout on your backend
  await api.get('/auth/logout');
}

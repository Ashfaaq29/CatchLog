import { api } from './api';

export async function uploadFile(file: File): Promise<{ url: string; key: string }> {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post<{ url: string; key: string }>('/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

import { apiInstance } from './instance';

export interface GameRecord {
  id: string;
  name: string;
  description: string;
  imageFileId: string | null;
  imageFolderId: string | null;
  pluginIds: string[];
  config: Record<string, unknown>;
  enabled: boolean;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface CreateGamePayload {
  name: string;
  description?: string;
  imageFileId?: string;
  pluginIds?: string[];
  config?: Record<string, unknown>;
  enabled?: boolean;
  status?: 'draft' | 'published';
}

export async function getGames(): Promise<GameRecord[]> {
  const { data } = await apiInstance.get<GameRecord[]>('/admin/games');
  return data;
}

export async function getGame(id: string): Promise<GameRecord> {
  const { data } = await apiInstance.get<GameRecord>(`/admin/games/${id}`);
  return data;
}

export async function createGame(payload: CreateGamePayload): Promise<GameRecord> {
  const { data } = await apiInstance.post<GameRecord>('/admin/games', payload);
  return data;
}

export async function updateGame(id: string, payload: Partial<CreateGamePayload>): Promise<GameRecord> {
  const { data } = await apiInstance.patch<GameRecord>(`/admin/games/${id}`, payload);
  return data;
}

export async function deleteGame(id: string): Promise<void> {
  await apiInstance.delete(`/admin/games/${id}`);
}

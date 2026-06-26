import { apiInstance } from './instance';
import type { EffectCategory, EffectDefinition } from '@homekit/engine';
import type {
  Card,
  CardsQuery,
  CarryEffect,
  CreateCardPayload,
  GmApprovalPayload,
} from '@homekit/types';

// Re-exports so consumers can import types from this module as before
export type { EffectCategory, EffectDefinition } from '@homekit/engine';
export type { EffectCondition, EffectInstance, EffectParam } from '@homekit/engine';
export type {
  Card,
  CardType,
  CardStats,
  CardStatus,
  CardsQuery,
  CarryEffect,
  CreateCardPayload,
  GmApprovalPayload,
} from '@homekit/types';

export interface CardFormData {
  name?: string;
  description?: string;
  flavorText?: string;
  level?: number;
  treasureCount?: number;
  badStuff?: string;
  itemBonus?: number;
  itemValue?: number;
  tags?: string[];
}

// ─── API functions ─────────────────────────────────────────────────────────────

export async function getCards(query: CardsQuery = {}): Promise<Card[]> {
  const { data } = await apiInstance.get<Card[]>('/admin/cards', { params: query });
  return data;
}

export async function getCard(id: string): Promise<Card> {
  const { data } = await apiInstance.get<Card>(`/admin/cards/${id}`);
  return data;
}

export async function createCard(payload: CreateCardPayload): Promise<Card> {
  const { data } = await apiInstance.post<Card>('/admin/cards', payload);
  return data;
}

export async function updateCard(id: string, payload: Partial<CreateCardPayload>): Promise<Card> {
  const { data } = await apiInstance.patch<Card>(`/admin/cards/${id}`, payload);
  return data;
}

export async function deleteCard(id: string): Promise<void> {
  await apiInstance.delete(`/admin/cards/${id}`);
}

export async function duplicateCard(id: string): Promise<Card> {
  const { data } = await apiInstance.post<Card>(`/admin/cards/${id}/duplicate`);
  return data;
}

export async function uploadGameImage(file: File, folderId?: string): Promise<{ id: string }> {
  const fd = new FormData();
  fd.append('file', file);
  if (folderId) fd.append('folderId', folderId);
  const { data } = await apiInstance.post('/files/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return { id: data.id as string };
}

export function fileViewUrl(id: string): string {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  return `${base}/files/${id}/view-public`;
}

export async function getEffectDefinitions(category?: EffectCategory): Promise<EffectDefinition[]> {
  const { data } = await apiInstance.get<EffectDefinition[]>('/admin/effects', {
    params: category ? { category } : undefined,
  });
  return data;
}

export async function getCarryEffects(): Promise<CarryEffect[]> {
  const { data } = await apiInstance.get<CarryEffect[]>('/admin/carry-effects');
  return data;
}

export async function removeCarryEffect(id: string): Promise<void> {
  await apiInstance.delete(`/admin/carry-effects/${id}`);
}

export async function submitGmApproval(
  payload: GmApprovalPayload,
): Promise<{ applied: boolean; decision: string }> {
  const { data } = await apiInstance.post('/admin/carry-effects/gm-approval', payload);
  return data;
}

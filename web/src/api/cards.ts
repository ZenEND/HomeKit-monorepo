import { apiInstance } from './instance';

// ─── Shared types (mirror of @homekit/engine & API DTOs) ──────────────────────

export type EffectCategory =
  | 'progress'
  | 'inventory'
  | 'loot'
  | 'turn'
  | 'combat'
  | 'situation'
  | 'quest'
  | 'gm';

export interface EffectParam {
  key: string;
  label: string;
  type: 'number' | 'select' | 'boolean' | 'player_target' | 'text';
  options?: string[];
  defaultValue: unknown;
  min?: number;
  max?: number;
}

export interface EffectDefinition {
  id: string;
  label: string;
  description: string;
  module: string;
  category: EffectCategory;
  params: EffectParam[];
}

export interface EffectCondition {
  type: 'phase' | 'player_level' | 'has_item' | 'random_percent';
  value: unknown;
}

export interface EffectInstance {
  definitionId: string;
  params: Record<string, unknown>;
  condition?: EffectCondition;
}

export type CardType = 'DOOR' | 'TREASURE' | 'PARTY' | 'SITUATION' | 'MINIGAME';
export type CardStatus = 'draft' | 'published';

export interface CardStats {
  monsterLevel?: number;
  treasureReward?: number;
  badStuff?: string;
  slot?: 'Head' | 'Body' | 'Feet' | 'Hand' | 'Accessory' | 'None';
  combatBonus?: number;
  goldValue?: number;
  bigItem?: boolean;
  raceRestriction?: string[];
  classRestriction?: string[];
  itemBonus?: number;
  itemValue?: number;
}

export interface Card {
  id: string;
  game: string;
  type: CardType;
  subtype?: string;
  name: string;
  description?: string;
  flavorText?: string;
  imageUrl?: string;
  stats?: CardStats;
  effects: EffectInstance[];
  tags?: string[];
  enabled: boolean;
  status: CardStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardPayload {
  game?: string;
  type: CardType;
  subtype?: string;
  name: string;
  description?: string;
  flavorText?: string;
  imageUrl?: string;
  stats?: CardStats;
  effects?: EffectInstance[];
  tags?: string[];
  enabled?: boolean;
  status?: CardStatus;
}

export interface CardsQuery {
  type?: CardType;
  subtype?: string;
  tag?: string;
  effectId?: string;
  status?: CardStatus;
  game?: string;
}

export interface CarryEffect {
  id: string;
  playerId: string;
  playerEmail?: string;
  effectLabel: string;
  effectDescription?: string;
  duration: string;
  sourceCardId?: string;
  sourceCardName?: string;
  gameSessionId?: string;
  active: boolean;
  createdAt: string;
}

export interface GmApprovalPayload {
  decision: 'success' | 'fail';
  gameId: string;
  cardId: string;
  playerId: string;
}

// ─── AI assist types ───────────────────────────────────────────────────────────

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

export async function uploadCardImage(file: File): Promise<{ imageUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiInstance.post<{ imageUrl: string }>(
    '/admin/cards/upload-image',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
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

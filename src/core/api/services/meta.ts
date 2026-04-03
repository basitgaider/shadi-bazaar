/**
 * Meta/reference APIs – categories, cities, conditions, item types (no auth).
 */

import { apiData } from '../client';

export interface CategoryRecord {
  id: number;
  title: string;
  image?: string;
  [key: string]: unknown;
}

export interface CityRecord {
  id: number;
  title: string;
  [key: string]: unknown;
}

export interface ConditionRecord {
  id: number;
  title: string;
  [key: string]: unknown;
}

export interface ItemTypeRecord {
  id: number;
  title: string;
  [key: string]: unknown;
}

export async function getCategories(): Promise<CategoryRecord[]> {
  const res = await apiData<{ records: CategoryRecord[] }>('categories');
  return res?.records ?? [];
}

export async function getCities(): Promise<CityRecord[]> {
  const res = await apiData<{ records: CityRecord[] }>('cities');
  return res?.records ?? [];
}

export async function getConditions(): Promise<ConditionRecord[]> {
  const res = await apiData<{ records: ConditionRecord[] }>('conditions');
  return res?.records ?? [];
}

export async function getItemTypes(): Promise<ItemTypeRecord[]> {
  const res = await apiData<{ records: ItemTypeRecord[] }>('itemTypes');
  return res?.records ?? [];
}

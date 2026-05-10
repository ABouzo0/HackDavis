import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import type { AppData, Donation, ShelterNeed, UserProfile } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

function emptyData(): AppData {
  return { users: {}, donations: {}, shelterNeeds: {}, sessions: {} };
}

export function loadData(): AppData {
  try {
    if (!existsSync(DATA_FILE)) {
      mkdirSync(DATA_DIR, { recursive: true });
      return emptyData();
    }
    const raw = readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as AppData;
  } catch {
    return emptyData();
  }
}

let cache: AppData | null = null;

export function getData(): AppData {
  if (!cache) cache = loadData();
  return cache;
}

export function saveData(data: AppData) {
  mkdirSync(DATA_DIR, { recursive: true });
  cache = data;
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function upsertUser(user: UserProfile) {
  const data = getData();
  data.users[user.id] = user;
  saveData(data);
}

export function createSession(userId: string, ttlHours = 72): string {
  const data = getData();
  const token = uuid();
  const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000).toISOString();
  data.sessions[token] = { userId, expiresAt };
  pruneSessions(data);
  saveData(data);
  return token;
}

function pruneSessions(data: AppData) {
  const now = Date.now();
  for (const [k, s] of Object.entries(data.sessions)) {
    if (new Date(s.expiresAt).getTime() < now) delete data.sessions[k];
  }
}

export function getSessionUserId(token: string | undefined): string | null {
  if (!token) return null;
  const data = getData();
  pruneSessions(data);
  const s = data.sessions[token];
  if (!s) return null;
  if (new Date(s.expiresAt).getTime() < Date.now()) {
    delete data.sessions[token];
    saveData(data);
    return null;
  }
  return s.userId;
}

export function deleteSession(token: string) {
  const data = getData();
  delete data.sessions[token];
  saveData(data);
}

export function listDonations(): Donation[] {
  return Object.values(getData().donations);
}

export function getDonation(id: string): Donation | undefined {
  return getData().donations[id];
}

export function upsertDonation(d: Donation) {
  const data = getData();
  data.donations[d.id] = d;
  saveData(data);
}

export function listUsers(): UserProfile[] {
  return Object.values(getData().users);
}

export function getUser(id: string): UserProfile | undefined {
  return getData().users[id];
}

export function setShelterNeed(n: ShelterNeed) {
  const data = getData();
  data.shelterNeeds[n.id] = n;
  saveData(data);
}

export function getShelterNeedForShelter(shelterId: string): ShelterNeed | undefined {
  return Object.values(getData().shelterNeeds).find((n) => n.shelterId === shelterId);
}

export function invalidateCacheForTests() {
  cache = null;
}

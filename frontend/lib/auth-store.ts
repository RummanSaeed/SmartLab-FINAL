import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export type Role = "student" | "teacher" | "admin";

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: Role;
  school?: string;
  class?: string;
  createdAt: string;
}

const dataPath = path.join(process.cwd(), "data", "users.json");

async function ensureFile() {
  try {
    await fs.access(dataPath);
  } catch {
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, "[]", "utf8");
  }
}

export async function readUsers(): Promise<UserRecord[]> {
  await ensureFile();
  const raw = await fs.readFile(dataPath, "utf8");
  return JSON.parse(raw) as UserRecord[];
}

export async function writeUsers(users: UserRecord[]) {
  await ensureFile();
  await fs.writeFile(dataPath, JSON.stringify(users, null, 2), "utf8");
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const verify = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return hash === verify;
}

export function makeUser(
  partial: Omit<UserRecord, "id" | "createdAt" | "passwordHash"> & { password: string },
): UserRecord {
  return {
    id: crypto.randomUUID(),
    fullName: partial.fullName,
    email: partial.email.toLowerCase(),
    passwordHash: hashPassword(partial.password),
    role: partial.role,
    school: partial.school,
    class: partial.class,
    createdAt: new Date().toISOString(),
  };
}

export function toPublicUser(user: UserRecord) {
  const { passwordHash, ...rest } = user;
  return rest;
}

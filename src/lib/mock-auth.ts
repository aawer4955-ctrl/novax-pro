"use client";

import { DemoUser } from "./auth-types";

const USERS_KEY = "novax-demo-users";
const SESSION_KEY = "novax-current-user";

const defaultAdmin: DemoUser = {
  id: "admin-default",
  uid: "90000001",
  email: "admin@novax.demo",
  // : production must use bcrypt/argon2 password hashing and never store plain passwords.
  password: "Admin123456",
  country: "Global",
  language: "en",
  role: "admin",
  kycStatus: "approved",
  accountStatus: "active",
  createdAt: "2026-05-18T00:00:00.000Z",
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function readUsers(): DemoUser[] {
  if (!canUseStorage()) return [defaultAdmin];
  const raw = window.localStorage.getItem(USERS_KEY);
  const users = raw ? (JSON.parse(raw) as DemoUser[]) : [];
  if (!users.some((user) => user.email === defaultAdmin.email)) users.unshift(defaultAdmin);
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return users;
}

function writeUsers(users: DemoUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function publicUser(user: DemoUser) {
  return user;
}

export function registerUser(input: { email: string; password: string; country: string; language: string }) {
  const users = readUsers();
  const normalizedEmail = input.email.trim().toLowerCase();
  if (users.some((user) => user.email === normalizedEmail)) throw new Error("Email already registered");
  const user: DemoUser = {
    id: crypto.randomUUID(),
    uid: String(10000000 + users.length + 1),
    email: normalizedEmail,
    // : production must hash with bcrypt/argon2 before persistence.
    password: input.password,
    country: input.country,
    language: input.language,
    role: "user",
    kycStatus: "pending",
    accountStatus: "inactive",
    createdAt: new Date().toISOString(),
  };
  const nextUsers = [...users, user];
  writeUsers(nextUsers);
  window.localStorage.setItem(SESSION_KEY, user.id);
  window.dispatchEvent(new Event("novax-auth-change"));
  return publicUser(user);
}

export function loginUser(email: string, password: string) {
  const user = readUsers().find((item) => item.email === email.trim().toLowerCase() && item.password === password);
  if (!user) throw new Error("Invalid email or password");
  window.localStorage.setItem(SESSION_KEY, user.id);
  window.dispatchEvent(new Event("novax-auth-change"));
  return publicUser(user);
}

export function logoutUser() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("novax-auth-change"));
}

export function getCurrentUser() {
  if (!canUseStorage()) return null;
  const currentId = window.localStorage.getItem(SESSION_KEY);
  if (!currentId) return null;
  return readUsers().find((user) => user.id === currentId) ?? null;
}

export function listUsers() {
  return readUsers().map(publicUser);
}

export function updateUserAccountStatus(userId: string, accountStatus: DemoUser["accountStatus"]) {
  const users = readUsers();
  const nextUsers = users.map((user) => (user.id === userId ? { ...user, accountStatus } : user));
  writeUsers(nextUsers);
  window.dispatchEvent(new Event("novax-auth-change"));
  return nextUsers.find((user) => user.id === userId) ?? null;
}

export function requireAuth() {
  const user = getCurrentUser();
  if (!user) throw new Error("Authentication required");
  return user;
}

export function requireAdmin() {
  const user = requireAuth();
  if (user.role !== "admin") throw new Error("Admin access required");
  return user;
}

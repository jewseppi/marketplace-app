"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_MOCK_USERS, type MockUser } from "@/lib/mock-users";

export type { MockUser, UserRole } from "@/lib/mock-users";

export type AuthRole = "seller" | "admin";
export type MockSession = {
  id: string;
  role: AuthRole;
  username: string;
  displayName: string;
  createdAt: string;
};

const credentialsByRole: Record<AuthRole, { username: string; password: string; displayName: string }> = {
  seller: {
    username: "seller",
    password: "seller123",
    displayName: "Atelier Seller",
  },
  admin: {
    username: "admin",
    password: "admin123",
    displayName: "Platform Admin",
  },
};

let currentSession: MockSession | null = null;
let users: MockUser[] = [...DEFAULT_MOCK_USERS];

const listeners = new Set<() => void>();
const userListeners = new Set<() => void>();

function emitSession() {
  listeners.forEach((listener) => listener());
}

function emitUsers() {
  userListeners.forEach((listener) => listener());
}

export async function login(
  role: AuthRole,
  credentials: { username: string; password: string },
) {
  const expected = credentialsByRole[role];
  const username = credentials.username.trim().toLowerCase();

  if (username !== expected.username || credentials.password !== expected.password) {
    throw new Error(`Use ${expected.username}/${expected.password}`);
  }

  currentSession = {
    id: `${role}-session`,
    role,
    username: expected.username,
    displayName: expected.displayName,
    createdAt: new Date().toISOString(),
  };
  emitSession();
  return currentSession;
}

export function logout() {
  currentSession = null;
  emitSession();
}

export function getSession() {
  return currentSession;
}

export function requireAuth(requiredRole: string) {
  return <T,>(handler: (session: MockSession) => T) => {
    const session = getSession();
    if (!session || session.role !== requiredRole) {
      throw new Error("Unauthorized");
    }
    return handler(session);
  };
}

export function subscribeToSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMockSession() {
  return useSyncExternalStore(subscribeToSession, getSession, getSession);
}

export function listMockUsers() {
  return users;
}

export function subscribeToUsers(listener: () => void) {
  userListeners.add(listener);
  return () => userListeners.delete(listener);
}

export function useMockUsers() {
  return useSyncExternalStore(subscribeToUsers, listMockUsers, listMockUsers);
}

export function addMockUser(input: Omit<MockUser, "id">) {
  users = [
    {
      ...input,
      id: `user-${Math.random().toString(36).slice(2, 10)}`,
    },
    ...users,
  ];
  emitUsers();
}

export function removeMockUser(id: string) {
  users = users.filter((user) => user.id !== id);
  emitUsers();
}

export function toggleMockUserStatus(id: string) {
  users = users.map((user) =>
    user.id === id
      ? { ...user, status: user.status === "active" ? "suspended" : "active" }
      : user,
  );
  emitUsers();
}

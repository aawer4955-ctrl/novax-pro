import { generateDepositAddress, generateMemo } from "./address-generator";

export type DepositAddress = { id: string; userId: string; asset: string; network: string; address: string; memo: string; isActive: boolean; createdAt: string; updatedAt: string };
export type WithdrawalAddress = { id: string; userId: string; asset: string; network: string; label: string; address: string; memo: string; isWhitelisted: boolean; isActive: boolean; createdAt: string; updatedAt: string };

const g = globalThis as typeof globalThis & { novaxDepositAddresses?: DepositAddress[]; novaxWithdrawalAddresses?: WithdrawalAddress[] };

function ensure() {
  g.novaxDepositAddresses ??= [];
  g.novaxWithdrawalAddresses ??= [];
}

export function getOrCreateDepositAddress(input: { userId: string; asset: string; network: string }) {
  ensure();
  const existing = g.novaxDepositAddresses!.find((item) => item.userId === input.userId && item.asset === input.asset && item.network === input.network);
  if (existing) return existing;
  const now = new Date().toISOString();
  const record: DepositAddress = { id: crypto.randomUUID(), userId: input.userId, asset: input.asset, network: input.network, address: generateDepositAddress(input.asset, input.network, input.userId), memo: generateMemo(input.asset, input.network, input.userId), isActive: true, createdAt: now, updatedAt: now };
  g.novaxDepositAddresses!.push(record);
  return record;
}

export function listDepositAddresses() { ensure(); return g.novaxDepositAddresses!; }
export function listWithdrawalAddresses(userId?: string) { ensure(); return userId ? g.novaxWithdrawalAddresses!.filter((item) => item.userId === userId) : g.novaxWithdrawalAddresses!; }
export function addWithdrawalAddress(input: { userId: string; asset: string; network: string; label: string; address: string; memo?: string }) {
  ensure();
  const now = new Date().toISOString();
  const record: WithdrawalAddress = { id: crypto.randomUUID(), userId: input.userId, asset: input.asset, network: input.network, label: input.label, address: input.address, memo: input.memo ?? "", isWhitelisted: true, isActive: true, createdAt: now, updatedAt: now };
  g.novaxWithdrawalAddresses!.push(record);
  return record;
}
export function deleteWithdrawalAddress(id: string, userId?: string) { ensure(); const before = g.novaxWithdrawalAddresses!.length; g.novaxWithdrawalAddresses = g.novaxWithdrawalAddresses!.filter((item) => item.id !== id || (userId && item.userId !== userId)); return before !== g.novaxWithdrawalAddresses.length; }
export function setAddressActive(id: string, isActive: boolean) { ensure(); const all = [...g.novaxDepositAddresses!, ...g.novaxWithdrawalAddresses!]; const item = all.find((entry) => entry.id === id); if (item) { item.isActive = isActive; item.updatedAt = new Date().toISOString(); } return item; }

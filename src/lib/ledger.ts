import { LedgerType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type DbClient = typeof prisma | Prisma.TransactionClient;

type LedgerMutation = {
  userId: string;
  asset: string;
  amount: number | string | Prisma.Decimal;
  type?: LedgerType;
  referenceType?: string;
  referenceId?: string;
  reason?: string;
  createdByAdminId?: string;
  status?: string;
};

type CreateLedgerInput = {
  userId: string;
  asset: string;
  type: LedgerType;
  amount: Prisma.Decimal;
  beforeBalance: Prisma.Decimal;
  afterBalance: Prisma.Decimal;
  referenceType?: string;
  referenceId?: string;
  reason?: string;
  createdByAdminId?: string;
  status?: string;
};

const ZERO = new Prisma.Decimal(0);

function decimal(value: number | string | Prisma.Decimal) {
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
}

function assertPositive(value: Prisma.Decimal, label: string) {
  if (value.lte(ZERO)) throw new Error(`${label} must be positive.`);
}

async function ensureBalance(tx: Prisma.TransactionClient, userId: string, asset: string) {
  const normalizedAsset = asset.toUpperCase();
  const existing = await tx.assetBalance.findUnique({
    where: { userId_asset: { userId, asset: normalizedAsset } },
  });

  if (existing) return existing;

  return tx.assetBalance.create({
    data: {
      userId,
      asset: normalizedAsset,
      available: ZERO,
      frozen: ZERO,
    },
  });
}

async function withTransaction<T>(client: DbClient | undefined, fn: (tx: Prisma.TransactionClient) => Promise<T>) {
  if (client) return fn(client as Prisma.TransactionClient);
  return prisma.$transaction(fn);
}

export async function getBalance(userId: string, asset: string, client?: DbClient) {
  if (client) {
    return ensureBalance(client as Prisma.TransactionClient, userId, asset);
  }
  return prisma.$transaction((tx) => ensureBalance(tx, userId, asset));
}

export async function createLedgerEntry(input: CreateLedgerInput, client?: DbClient) {
  const data = {
    userId: input.userId,
    asset: input.asset.toUpperCase(),
    type: input.type,
    amount: input.amount,
    beforeBalance: input.beforeBalance,
    afterBalance: input.afterBalance,
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    reason: input.reason,
    createdByAdminId: input.createdByAdminId,
    status: input.status ?? "POSTED",
  };

  if (client) return (client as Prisma.TransactionClient).ledgerEntry.create({ data });
  return prisma.ledgerEntry.create({ data });
}

export async function creditBalance(input: LedgerMutation, client?: DbClient) {
  const amount = decimal(input.amount);
  assertPositive(amount, "Credit amount");

  return withTransaction(client, async (tx) => {
    const balance = await ensureBalance(tx, input.userId, input.asset);
    const before = balance.available;
    const after = before.plus(amount);

    const updatedBalance = await tx.assetBalance.update({
      where: { userId_asset: { userId: input.userId, asset: input.asset.toUpperCase() } },
      data: { available: after },
    });

    const ledgerEntry = await createLedgerEntry(
      {
        userId: input.userId,
        asset: input.asset,
        type: input.type ?? LedgerType.DEPOSIT,
        amount,
        beforeBalance: before,
        afterBalance: after,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        reason: input.reason,
        createdByAdminId: input.createdByAdminId,
        status: input.status,
      },
      tx,
    );

    return { balance: updatedBalance, ledgerEntry };
  });
}

export async function debitBalance(input: LedgerMutation, client?: DbClient) {
  const amount = decimal(input.amount);
  assertPositive(amount, "Debit amount");

  return withTransaction(client, async (tx) => {
    const balance = await ensureBalance(tx, input.userId, input.asset);
    if (balance.available.lt(amount)) throw new Error("Insufficient available balance.");

    const before = balance.available;
    const after = before.minus(amount);

    const updatedBalance = await tx.assetBalance.update({
      where: { userId_asset: { userId: input.userId, asset: input.asset.toUpperCase() } },
      data: { available: after },
    });

    const ledgerEntry = await createLedgerEntry(
      {
        userId: input.userId,
        asset: input.asset,
        type: input.type ?? LedgerType.WITHDRAWAL,
        amount: amount.negated(),
        beforeBalance: before,
        afterBalance: after,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        reason: input.reason,
        createdByAdminId: input.createdByAdminId,
        status: input.status,
      },
      tx,
    );

    return { balance: updatedBalance, ledgerEntry };
  });
}

export async function freezeBalance(input: LedgerMutation, client?: DbClient) {
  const amount = decimal(input.amount);
  assertPositive(amount, "Freeze amount");

  return withTransaction(client, async (tx) => {
    const balance = await ensureBalance(tx, input.userId, input.asset);
    if (balance.available.lt(amount)) throw new Error("Insufficient available balance to freeze.");

    const before = balance.available;
    const after = before.minus(amount);

    const updatedBalance = await tx.assetBalance.update({
      where: { userId_asset: { userId: input.userId, asset: input.asset.toUpperCase() } },
      data: {
        available: after,
        frozen: balance.frozen.plus(amount),
      },
    });

    const ledgerEntry = await createLedgerEntry(
      {
        userId: input.userId,
        asset: input.asset,
        type: LedgerType.FREEZE,
        amount: amount.negated(),
        beforeBalance: before,
        afterBalance: after,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        reason: input.reason,
        createdByAdminId: input.createdByAdminId,
        status: input.status,
      },
      tx,
    );

    return { balance: updatedBalance, ledgerEntry };
  });
}

export async function unfreezeBalance(input: LedgerMutation, client?: DbClient) {
  const amount = decimal(input.amount);
  assertPositive(amount, "Unfreeze amount");

  return withTransaction(client, async (tx) => {
    const balance = await ensureBalance(tx, input.userId, input.asset);
    if (balance.frozen.lt(amount)) throw new Error("Insufficient frozen balance to unfreeze.");

    const before = balance.available;
    const after = before.plus(amount);

    const updatedBalance = await tx.assetBalance.update({
      where: { userId_asset: { userId: input.userId, asset: input.asset.toUpperCase() } },
      data: {
        available: after,
        frozen: balance.frozen.minus(amount),
      },
    });

    const ledgerEntry = await createLedgerEntry(
      {
        userId: input.userId,
        asset: input.asset,
        type: LedgerType.UNFREEZE,
        amount,
        beforeBalance: before,
        afterBalance: after,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        reason: input.reason,
        createdByAdminId: input.createdByAdminId,
        status: input.status,
      },
      tx,
    );

    return { balance: updatedBalance, ledgerEntry };
  });
}

export async function settleFrozenWithdrawal(input: LedgerMutation, client?: DbClient) {
  const amount = decimal(input.amount);
  assertPositive(amount, "Withdrawal settlement amount");

  return withTransaction(client, async (tx) => {
    const balance = await ensureBalance(tx, input.userId, input.asset);
    if (balance.frozen.lt(amount)) throw new Error("Insufficient frozen balance to settle withdrawal.");

    const before = balance.frozen;
    const after = before.minus(amount);

    const updatedBalance = await tx.assetBalance.update({
      where: { userId_asset: { userId: input.userId, asset: input.asset.toUpperCase() } },
      data: { frozen: after },
    });

    const ledgerEntry = await createLedgerEntry(
      {
        userId: input.userId,
        asset: input.asset,
        type: LedgerType.WITHDRAWAL,
        amount: amount.negated(),
        beforeBalance: before,
        afterBalance: after,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        reason: input.reason,
        createdByAdminId: input.createdByAdminId,
        status: input.status,
      },
      tx,
    );

    return { balance: updatedBalance, ledgerEntry };
  });
}

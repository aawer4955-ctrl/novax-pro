import { AccountStatus, KycStatus, Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DEFAULT_ASSETS = ["USDT", "BTC", "ETH", "SOL", "BNB"];

type CreateUserInput = {
  email: string;
  password: string;
  country?: string;
  language?: string;
  role?: UserRole;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createUid() {
  return `U${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function demoHashPassword(password: string) {
  // Platform only. Production must replace this with bcrypt/argon2 password hashing.
  return `demo:${Buffer.from(password, "utf8").toString("base64")}`;
}

export function verifyDemoPassword(password: string, passwordHash: string) {
  // Platform only. Production must use a constant-time bcrypt/argon2 verifier.
  return demoHashPassword(password) === passwordHash;
}

export function safeUser<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
}

export async function createUserWithDefaultAssets(input: CreateUserInput) {
  const email = normalizeEmail(input.email);
  const passwordHash = demoHashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        uid: createUid(),
        email,
        passwordHash,
        country: input.country ?? "US",
        language: input.language ?? "en",
        role: input.role ?? UserRole.USER,
        kycStatus: KycStatus.UNVERIFIED,
        accountStatus: AccountStatus.ACTIVE,
        riskLevel: "LOW",
        termsAcceptedAt: new Date(),
      },
    });

    await tx.assetBalance.createMany({
      data: DEFAULT_ASSETS.map((asset) => ({
        userId: user.id,
        asset,
        available: new Prisma.Decimal(0),
        frozen: new Prisma.Decimal(0),
      })),
      skipDuplicates: true,
    });

    return user;
  });
}

export async function verifyUserPassword(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  return verifyDemoPassword(password, user.passwordHash) ? user : null;
}

export async function createDefaultAdminIfMissing() {
  const email = "admin@novax.demo";
  const existing = await findUserByEmail(email);
  if (existing) return existing;

  return createUserWithDefaultAssets({
    email,
    password: "Admin123456",
    country: "US",
    language: "en",
    role: UserRole.ADMIN,
  });
}

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'FROZEN', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRADE', 'FEE', 'ADJUSTMENT', 'FREEZE', 'UNFREEZE');

-- CreateEnum
CREATE TYPE "DepositSourceType" AS ENUM ('CARD', 'BANK_TRANSFER', 'CRYPTO');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "AmlStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "OrderSide" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('MARKET', 'LIMIT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('OPEN', 'FILLED', 'CANCELED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "termsAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerApplicantId" TEXT,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "level" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "KycProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetBalance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "available" DECIMAL(36,18) NOT NULL,
    "frozen" DECIMAL(36,18) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "type" "LedgerType" NOT NULL,
    "amount" DECIMAL(36,18) NOT NULL,
    "balanceBefore" DECIMAL(36,18) NOT NULL,
    "balanceAfter" DECIMAL(36,18) NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "amount" DECIMAL(36,18) NOT NULL,
    "sourceType" "DepositSourceType" NOT NULL,
    "provider" TEXT NOT NULL,
    "providerRef" TEXT,
    "txHash" TEXT,
    "status" "DepositStatus" NOT NULL DEFAULT 'PENDING',
    "amlStatus" "AmlStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "DepositRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawalRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "amount" DECIMAL(36,18) NOT NULL,
    "fee" DECIMAL(36,18) NOT NULL,
    "destinationAddress" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerRef" TEXT,
    "amlStatus" "AmlStatus" NOT NULL DEFAULT 'PENDING',
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pair" TEXT NOT NULL,
    "side" "OrderSide" NOT NULL,
    "type" "OrderType" NOT NULL,
    "amount" DECIMAL(36,18) NOT NULL,
    "price" DECIMAL(36,18),
    "total" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "fee" DECIMAL(36,18) NOT NULL,
    "filledAmount" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "status" "OrderStatus" NOT NULL DEFAULT 'OPEN',
    "regionAllowed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" "RiskLevel" NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionRule" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegionRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketPair" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "baseAsset" TEXT NOT NULL,
    "quoteAsset" TEXT NOT NULL,
    "latestPrice" DECIMAL(36,18) NOT NULL,
    "change24h" DECIMAL(18,6) NOT NULL,
    "high24h" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "low24h" DECIMAL(36,18) NOT NULL DEFAULT 0,
    "volume24h" DECIMAL(36,18) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coin" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconUrl" TEXT,
    "description" TEXT,
    "latestPrice" DECIMAL(36,18) NOT NULL,
    "change24h" DECIMAL(18,6) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "content" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDepositAddress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "memo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDepositAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawalAddress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "memo" TEXT,
    "isWhitelisted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WithdrawalAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "KycProfile_userId_idx" ON "KycProfile"("userId");

-- CreateIndex
CREATE INDEX "KycProfile_provider_providerApplicantId_idx" ON "KycProfile"("provider", "providerApplicantId");

-- CreateIndex
CREATE INDEX "AssetBalance_asset_idx" ON "AssetBalance"("asset");

-- CreateIndex
CREATE UNIQUE INDEX "AssetBalance_userId_asset_key" ON "AssetBalance"("userId", "asset");

-- CreateIndex
CREATE INDEX "LedgerEntry_userId_asset_idx" ON "LedgerEntry"("userId", "asset");

-- CreateIndex
CREATE INDEX "LedgerEntry_referenceType_referenceId_idx" ON "LedgerEntry"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "DepositRequest_userId_status_idx" ON "DepositRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "DepositRequest_provider_providerRef_idx" ON "DepositRequest"("provider", "providerRef");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_userId_status_idx" ON "WithdrawalRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_provider_providerRef_idx" ON "WithdrawalRequest"("provider", "providerRef");

-- CreateIndex
CREATE INDEX "Order_userId_pair_idx" ON "Order"("userId", "pair");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "RiskEvent_userId_severity_idx" ON "RiskEvent"("userId", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "RegionRule_country_feature_key" ON "RegionRule"("country", "feature");

-- CreateIndex
CREATE UNIQUE INDEX "MarketPair_symbol_key" ON "MarketPair"("symbol");

-- CreateIndex
CREATE INDEX "MarketPair_isActive_sortOrder_idx" ON "MarketPair"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Coin_symbol_key" ON "Coin"("symbol");

-- CreateIndex
CREATE INDEX "Coin_isActive_symbol_idx" ON "Coin"("isActive", "symbol");

-- CreateIndex
CREATE INDEX "NewsArticle_isActive_sortOrder_publishedAt_idx" ON "NewsArticle"("isActive", "sortOrder", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- CreateIndex
CREATE INDEX "UserDepositAddress_asset_network_idx" ON "UserDepositAddress"("asset", "network");

-- CreateIndex
CREATE UNIQUE INDEX "UserDepositAddress_userId_asset_network_key" ON "UserDepositAddress"("userId", "asset", "network");

-- CreateIndex
CREATE INDEX "WithdrawalAddress_userId_asset_network_idx" ON "WithdrawalAddress"("userId", "asset", "network");

-- AddForeignKey
ALTER TABLE "KycProfile" ADD CONSTRAINT "KycProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBalance" ADD CONSTRAINT "AssetBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositRequest" ADD CONSTRAINT "DepositRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskEvent" ADD CONSTRAINT "RiskEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

type ComplianceUser = {
  country: string;
  kycStatus: string;
  accountStatus: string;
  riskLevel?: string;
};

const blockedCountries = new Set(["North Korea", "Iran", "Syria", "Cuba", "Crimea"]);
const kycRequiredFeatures = new Set(["deposit", "withdrawal", "trade", "derivatives"]);

export function checkRegionAllowed(country: string, feature: string) {
  if (blockedCountries.has(country)) {
    return { allowed: false, error: `${feature} is not available in ${country}.` };
  }
  return { allowed: true as const };
}

export function checkKycRequired(feature: string) {
  return kycRequiredFeatures.has(feature);
}

export function checkKycApproved(user: ComplianceUser) {
  if (user.kycStatus !== "APPROVED" && user.kycStatus !== "approved") {
    return { allowed: false, error: "KYC approval is required before deposits, withdrawals, or trading." };
  }
  return { allowed: true as const };
}

export function checkAmlRequired(asset: string, amount: number) {
  const normalizedAsset = asset.toUpperCase();
  return normalizedAsset !== "USDT" || amount >= 1000;
}

export function checkWithdrawalLimit(user: ComplianceUser, amount: number) {
  const limit = user.riskLevel === "HIGH" || user.riskLevel === "high" ? 1000 : 10000;
  if (amount > limit) return { allowed: false, error: `Withdrawal exceeds platform limit of ${limit}.` };
  return { allowed: true as const };
}

export function checkAccountActive(user: ComplianceUser) {
  if (user.accountStatus === "FROZEN" || user.accountStatus === "frozen") {
    return { allowed: false, error: "Account is frozen. Trading and withdrawals are disabled." };
  }
  if (user.accountStatus === "SUSPENDED") {
    return { allowed: false, error: "Account is suspended." };
  }
  return { allowed: true as const };
}

export function assertCanTrade(user: ComplianceUser, feature: string) {
  const region = checkRegionAllowed(user.country, feature);
  if (!region.allowed) throw new Error(region.error);
  const account = checkAccountActive(user);
  if (!account.allowed) throw new Error(account.error);
  if (checkKycRequired(feature)) {
    const kyc = checkKycApproved(user);
    if (!kyc.allowed) throw new Error(kyc.error);
  }
  return true;
}

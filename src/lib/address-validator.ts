const SUPPORTED_ASSETS = ["USDT", "BTC", "ETH", "SOL", "BNB", "XRP", "LTC", "DOGE"] as const;
const SUPPORTED_NETWORKS = ["TRC20", "ERC20", "BEP20", "BTC", "SOL", "XRP", "LTC", "DOGE"] as const;

export function normalizeAsset(value: string) {
  return value.trim().toUpperCase();
}

export function normalizeNetwork(value: string) {
  return value.trim().toUpperCase();
}

export function isSupportedAsset(value: string) {
  return SUPPORTED_ASSETS.includes(normalizeAsset(value) as (typeof SUPPORTED_ASSETS)[number]);
}

export function isSupportedNetwork(value: string) {
  return SUPPORTED_NETWORKS.includes(normalizeNetwork(value) as (typeof SUPPORTED_NETWORKS)[number]);
}

export function validateAddressFormat(asset: string, network: string, address: string) {
  const normalizedAsset = normalizeAsset(asset);
  const normalizedNetwork = normalizeNetwork(network);
  const normalizedAddress = address.trim();

  if (!normalizedAsset || !normalizedNetwork || !normalizedAddress) return false;
  if (!isSupportedAsset(normalizedAsset) || !isSupportedNetwork(normalizedNetwork)) return false;

  if (normalizedNetwork === "ERC20" || normalizedNetwork === "BEP20") {
    return /^0x[a-fA-F0-9]{40}$/.test(normalizedAddress);
  }

  if (normalizedNetwork === "TRC20") {
    return /^T[1-9A-HJ-NP-Za-km-z]{32,33}$/.test(normalizedAddress);
  }

  if (normalizedNetwork === "BTC") {
    return /^(bc1|1|3)[a-zA-Z0-9]{20,90}$/.test(normalizedAddress);
  }

  if (normalizedNetwork === "SOL") {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(normalizedAddress);
  }

  if (normalizedNetwork === "XRP") {
    return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(normalizedAddress);
  }

  if (normalizedNetwork === "LTC") {
    return /^(ltc1|L|M)[a-zA-Z0-9]{20,90}$/.test(normalizedAddress);
  }

  if (normalizedNetwork === "DOGE") {
    return /^D[1-9A-HJ-NP-Za-km-z]{25,40}$/.test(normalizedAddress);
  }

  return false;
}

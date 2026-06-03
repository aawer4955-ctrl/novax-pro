import { createHash } from "crypto";

const base58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function hash(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function base58FromHex(hex: string, length: number) {
  let output = "";
  for (let i = 0; output.length < length; i += 2) {
    const value = Number.parseInt(hex.slice(i % hex.length, (i % hex.length) + 2), 16);
    output += base58[value % base58.length];
  }
  return output;
}

export function generateDepositAddress(asset: string, network: string, userId: string) {
  const seed = hash(`${userId}:${asset}:${network}:novax`);
  const normalizedNetwork = network.toUpperCase();

  if (normalizedNetwork === "ERC20" || normalizedNetwork === "BEP20") return `0x${seed.slice(0, 40)}`;
  if (normalizedNetwork === "TRC20") return `T${base58FromHex(seed, 33)}`;
  if (normalizedNetwork === "BTC") return `bc1q${base58FromHex(seed, 38).toLowerCase()}`;
  if (normalizedNetwork === "SOL") return base58FromHex(seed, 44);
  if (normalizedNetwork === "XRP") return `r${base58FromHex(seed, 33)}`;
  if (normalizedNetwork === "LTC") return `ltc1q${base58FromHex(seed, 38).toLowerCase()}`;
  if (normalizedNetwork === "DOGE") return `D${base58FromHex(seed, 33)}`;

  return `0x${seed.slice(0, 40)}`;
}

export function generateMemo(asset: string, network: string, userId: string) {
  if (asset.toUpperCase() === "XRP" || network.toUpperCase() === "XRP") return String(Number.parseInt(hash(`${userId}:memo`).slice(0, 8), 16)).slice(0, 10);
  return "";
}

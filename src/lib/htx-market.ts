export type HtxKline = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type HtxTicker = {
  symbol: string;
  lastPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  fallback: boolean;
};

export type HtxDepth = {
  symbol: string;
  bids: Array<{ price: number; amount: number; total: number }>;
  asks: Array<{ price: number; amount: number; total: number }>;
  fallback: boolean;
};

export type HtxTrade = {
  id: number;
  price: number;
  amount: number;
  side: "buy" | "sell";
  time: number;
};

const HTX_BASE_URL = "https://api.huobi.pro";
const FALLBACK_BASE: Record<string, number> = {
  btcusdt: 68421.2,
  ethusdt: 3724.88,
  solusdt: 184.32,
  bnbusdt: 612.45,
  xrpusdt: 0.6421,
  dogeusdt: 0.1648,
  ltcusdt: 86.42,
};

const PERIOD_MAP: Record<string, string> = {
  "1m": "1min",
  "5m": "5min",
  "15m": "15min",
  "1h": "60min",
  "4h": "4hour",
  "1d": "1day",
};

function finite(value: unknown, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function fallbackPrice(symbol: string) {
  return FALLBACK_BASE[normalizeSymbol(symbol)] ?? 100;
}

function normalizePeriod(period: string) {
  return PERIOD_MAP[period] ?? period;
}

async function requestHtx<T>(path: string): Promise<T> {
  const response = await fetch(`${HTX_BASE_URL}${path}`, {
    cache: "no-store",
    headers: { "User-Agent": "NovaX-Pro-Market/1.0" },
  });
  if (!response.ok) throw new Error(`HTX request failed: ${response.status}`);
  const data = await response.json();
  if (data?.status && data.status !== "ok") throw new Error(data?.["err-msg"] ?? "HTX response error");
  return data as T;
}

export function normalizeSymbol(pair: string) {
  return pair.trim().replace("/", "").replace("-", "").toLowerCase();
}

function fallbackKlines(symbol: string, period: string, size: number) {
  const base = fallbackPrice(symbol);
  const now = Math.floor(Date.now() / 1000);
  const step = normalizePeriod(period).includes("day") ? 86400 : normalizePeriod(period).includes("hour") ? 3600 : 60;

  return Array.from({ length: size }).map((_, index) => {
    const time = now - (size - index) * step;
    const wave = Math.sin(index / 7) * base * 0.008;
    const drift = (index - size / 2) * base * 0.00008;
    const open = base + wave + drift;
    const close = open + Math.cos(index / 5) * base * 0.003;
    const high = Math.max(open, close) + base * (0.002 + (index % 5) * 0.0002);
    const low = Math.min(open, close) - base * (0.002 + (index % 4) * 0.0002);
    return { time, open, high, low, close, volume: 20 + index * 0.8 };
  });
}

function fallbackTicker(symbol: string): HtxTicker {
  const price = fallbackPrice(symbol);
  return {
    symbol: normalizeSymbol(symbol),
    lastPrice: price,
    change24h: 1.24,
    high24h: price * 1.018,
    low24h: price * 0.982,
    volume24h: price > 1000 ? 42000 : 820000,
    quoteVolume24h: price > 1000 ? price * 42000 : price * 820000,
    fallback: true,
  };
}

function fallbackDepth(symbol: string): HtxDepth {
  const price = fallbackPrice(symbol);
  const makeLevel = (index: number, side: "bid" | "ask") => {
    const levelPrice = side === "ask" ? price * (1 + (index + 1) * 0.0008) : price * (1 - (index + 1) * 0.0008);
    const amount = 0.18 + index * 0.07;
    return { price: levelPrice, amount, total: levelPrice * amount };
  };
  return {
    symbol: normalizeSymbol(symbol),
    bids: Array.from({ length: 12 }).map((_, index) => makeLevel(index, "bid")),
    asks: Array.from({ length: 12 }).map((_, index) => makeLevel(index, "ask")),
    fallback: true,
  };
}

function fallbackTrades(symbol: string) {
  const price = fallbackPrice(symbol);
  return Array.from({ length: 20 }).map((_, index) => ({
    id: Date.now() - index,
    price: price * (1 + (index - 8) * 0.00045),
    amount: 0.02 + index * 0.013,
    side: index % 3 === 0 ? "sell" as const : "buy" as const,
    time: Date.now() - index * 12000,
  }));
}

export async function getHtxKlines(symbol: string, period = "1min", size = 200) {
  const normalizedSymbol = normalizeSymbol(symbol);
  const normalizedPeriod = normalizePeriod(period);
  const normalizedSize = Math.min(Math.max(Number(size) || 200, 1), 500);

  try {
    const data = await requestHtx<{ data: Array<{ id: number; open: number; high: number; low: number; close: number; amount: number }> }>(
      `/market/history/kline?symbol=${normalizedSymbol}&period=${normalizedPeriod}&size=${normalizedSize}`,
    );
    return {
      symbol: normalizedSymbol,
      period: normalizedPeriod,
      fallback: false,
      data: data.data
        .map((item) => ({
          time: finite(item.id),
          open: finite(item.open),
          high: finite(item.high),
          low: finite(item.low),
          close: finite(item.close),
          volume: finite(item.amount),
        }))
        .sort((a, b) => a.time - b.time),
    };
  } catch {
    return { symbol: normalizedSymbol, period: normalizedPeriod, fallback: true, data: fallbackKlines(normalizedSymbol, normalizedPeriod, normalizedSize) };
  }
}

export async function getHtxTicker(symbol: string) {
  const normalizedSymbol = normalizeSymbol(symbol);

  try {
    const data = await requestHtx<{ tick: { close: number; open: number; high: number; low: number; amount: number; vol: number } }>(
      `/market/detail/merged?symbol=${normalizedSymbol}`,
    );
    const close = finite(data.tick.close, fallbackPrice(normalizedSymbol));
    const open = finite(data.tick.open, close);
    return {
      symbol: normalizedSymbol,
      lastPrice: close,
      change24h: open ? ((close - open) / open) * 100 : 0,
      high24h: finite(data.tick.high, close),
      low24h: finite(data.tick.low, close),
      volume24h: finite(data.tick.amount),
      quoteVolume24h: finite(data.tick.vol),
      fallback: false,
    };
  } catch {
    return fallbackTicker(normalizedSymbol);
  }
}

export async function getHtxDepth(symbol: string) {
  const normalizedSymbol = normalizeSymbol(symbol);

  try {
    const data = await requestHtx<{ tick: { bids: number[][]; asks: number[][] } }>(
      `/market/depth?symbol=${normalizedSymbol}&type=step0`,
    );
    const mapRows = (rows: number[][]) => rows.slice(0, 20).map(([price, amount]) => ({ price: finite(price), amount: finite(amount), total: finite(price) * finite(amount) }));
    return { symbol: normalizedSymbol, bids: mapRows(data.tick.bids ?? []), asks: mapRows(data.tick.asks ?? []), fallback: false };
  } catch {
    return fallbackDepth(normalizedSymbol);
  }
}

export async function getHtxTrades(symbol: string) {
  const normalizedSymbol = normalizeSymbol(symbol);

  try {
    const data = await requestHtx<{ tick: { data: Array<{ id: number; price: number; amount: number; direction: "buy" | "sell"; ts: number }> } }>(
      `/market/trade?symbol=${normalizedSymbol}`,
    );
    return {
      symbol: normalizedSymbol,
      fallback: false,
      data: (data.tick.data ?? []).map((item) => ({
        id: finite(item.id),
        price: finite(item.price),
        amount: finite(item.amount),
        side: item.direction === "sell" ? "sell" as const : "buy" as const,
        time: finite(item.ts),
      })),
    };
  } catch {
    return { symbol: normalizedSymbol, fallback: true, data: fallbackTrades(normalizedSymbol) };
  }
}

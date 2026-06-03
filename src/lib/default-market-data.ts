export type DefaultMarketPair = {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  latestPrice: string;
  change24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
};

export const defaultMarketPairs: DefaultMarketPair[] = [
  { symbol: "BTC/USDT", baseAsset: "BTC", quoteAsset: "USDT", latestPrice: "68421.20", change24h: "2.84", high24h: "69180.00", low24h: "66120.40", volume24h: "2410000000" },
  { symbol: "ETH/USDT", baseAsset: "ETH", quoteAsset: "USDT", latestPrice: "3724.88", change24h: "1.46", high24h: "3812.60", low24h: "3610.20", volume24h: "1180000000" },
  { symbol: "LTC/USDT", baseAsset: "LTC", quoteAsset: "USDT", latestPrice: "86.42", change24h: "0.92", high24h: "88.10", low24h: "83.80", volume24h: "129000000" },
  { symbol: "SOL/USDT", baseAsset: "SOL", quoteAsset: "USDT", latestPrice: "184.32", change24h: "5.19", high24h: "189.80", low24h: "171.90", volume24h: "824500000" },
  { symbol: "BNB/USDT", baseAsset: "BNB", quoteAsset: "USDT", latestPrice: "612.45", change24h: "0.63", high24h: "620.00", low24h: "598.50", volume24h: "390000000" },
  { symbol: "XRP/USDT", baseAsset: "XRP", quoteAsset: "USDT", latestPrice: "0.6421", change24h: "-0.72", high24h: "0.6610", low24h: "0.6312", volume24h: "312800000" },
  { symbol: "DOGE/USDT", baseAsset: "DOGE", quoteAsset: "USDT", latestPrice: "0.1648", change24h: "3.11", high24h: "0.1712", low24h: "0.1540", volume24h: "239100000" },
  { symbol: "ADA/USDT", baseAsset: "ADA", quoteAsset: "USDT", latestPrice: "0.4820", change24h: "-1.25", high24h: "0.4960", low24h: "0.4710", volume24h: "168500000" },
  { symbol: "AVAX/USDT", baseAsset: "AVAX", quoteAsset: "USDT", latestPrice: "38.76", change24h: "4.06", high24h: "40.12", low24h: "36.80", volume24h: "115300000" },
  { symbol: "LINK/USDT", baseAsset: "LINK", quoteAsset: "USDT", latestPrice: "17.36", change24h: "2.41", high24h: "18.02", low24h: "16.82", volume24h: "92200000" },
];

export const defaultCoins = [
  { symbol: "USDT", name: "Tether USD", latestPrice: "1", change24h: "0.00", description: "Quote asset" },
  { symbol: "BTC", name: "Bitcoin", latestPrice: "68421.20", change24h: "2.84", description: "Bitcoin market asset" },
  { symbol: "ETH", name: "Ethereum", latestPrice: "3724.88", change24h: "1.46", description: "Ethereum market asset" },
  { symbol: "LTC", name: "Litecoin", latestPrice: "86.42", change24h: "0.92", description: "Litecoin market asset" },
  { symbol: "SOL", name: "Solana", latestPrice: "184.32", change24h: "5.19", description: "Solana market asset" },
  { symbol: "BNB", name: "BNB", latestPrice: "612.45", change24h: "0.63", description: "BNB market asset" },
  { symbol: "XRP", name: "XRP", latestPrice: "0.6421", change24h: "-0.72", description: "XRP market asset" },
  { symbol: "DOGE", name: "Dogecoin", latestPrice: "0.1648", change24h: "3.11", description: "Dogecoin market asset" },
  { symbol: "ADA", name: "Cardano", latestPrice: "0.4820", change24h: "-1.25", description: "Cardano market asset" },
  { symbol: "AVAX", name: "Avalanche", latestPrice: "38.76", change24h: "4.06", description: "Avalanche market asset" },
  { symbol: "LINK", name: "Chainlink", latestPrice: "17.36", change24h: "2.41", description: "Chainlink market asset" },
];

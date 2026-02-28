export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface ExchangeRate {
  [key: string]: number;
}

export interface ExchangeRatesResponse {
  rates: ExchangeRate;
  base: string;
  date: string;
}

export interface RatesApiResponse {
  success: boolean;
  rates?: ExchangeRate;
  base?: string;
  date?: string;
  source?: string;
  isFallback?: boolean;
  warning?: string;
  error?: string;
}

export interface ConversionHistory {
  id: string;
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  timestamp: Date;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface FavoriteStorageRecord {
  codes: string[];
}

export interface FavoriteMutationResult {
  success: boolean;
  favorites: string[];
  error?: string;
}
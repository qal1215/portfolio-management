import cors from "cors";
import express from "express";
import WebSocket from "ws";
import YahooFinance from "yahoo-finance2";

const app = express();
const port = process.env.PORT || 4000;
const corsOrigin = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

const binanceStreams = new Map();

const normalizeSymbol = (symbol) => symbol.trim().toUpperCase();
const normalizeCryptoSymbol = (symbol) => {
  const cleaned = normalizeSymbol(symbol).replace(/[-/]/g, "");
  const quoteCurrencies = ["USDT", "USDC", "BUSD", "USD", "BTC", "ETH", "BNB"];
  if (quoteCurrencies.some((quote) => cleaned.endsWith(quote))) {
    return cleaned;
  }
  return `${cleaned}USDT`;
};

const ensureBinanceStream = (symbol) => {
  const normalized = normalizeCryptoSymbol(symbol);
  const existing = binanceStreams.get(normalized);
  if (
    existing?.ws &&
    (existing.ws.readyState === WebSocket.OPEN || existing.ws.readyState === WebSocket.CONNECTING)
  ) {
    return existing;
  }

  const streamSymbol = normalized.toLowerCase();
  const ws = new WebSocket(
    `wss://fstream.binance.com/stream?streams=${streamSymbol}@markPrice`
  );
  const state = existing || {
    symbol: normalized,
    ws: null,
    price: null,
    lastUpdated: null,
    reconnectTimer: null,
  };

  state.ws = ws;
  binanceStreams.set(normalized, state);

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());

      if (message?.data?.p) {
        state.price = Number(message.data.p);
        state.lastUpdated = new Date(message.data.E || message.data.T || Date.now()).toISOString();
      }
    } catch (error) {
      console.warn("Binance message parse error", error);
    }
  });
  
  ws.on("close", () => scheduleReconnect(normalized));
  ws.on("error", (error) => {
    console.warn(`Binance WS error for ${normalized}`, error);
    ws.close();
  });

  return state;
};

const getBinanceSnapshot = (symbol) => {
  const normalized = normalizeCryptoSymbol(symbol);
  let state = binanceStreams.get(normalized);
  if (!state) {
    state = ensureBinanceStream(normalized);
  }

  return {
    symbol: state.symbol,
    price: state.price,
    lastUpdated: state.lastUpdated,
    source: "binance-ws",
    status: state.price ? "ready" : "warming",
  };
};

const scheduleReconnect = (symbol) => {
  const state = binanceStreams.get(symbol);
  if (!state || state.reconnectTimer) {
    return;
  }

  state.reconnectTimer = setTimeout(() => {
    state.reconnectTimer = null;
    ensureBinanceStream(symbol);
  }, 1500);
};

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/stock/quote", async (req, res) => {
  const symbolParam = req.query.symbol;
  if (typeof symbolParam !== "string" || symbolParam.trim().length === 0) {
    res.status(400).json({ error: "symbol is required" });
    return;
  }

  const symbol = normalizeSymbol(symbolParam);

  try {
    const yf = new YahooFinance(); 
    const quote = await yf.quote(`${symbol}.vn`);
    const price =
      quote?.regularMarketPrice ??
      quote?.postMarketPrice ??
      quote?.preMarketPrice ??
      null;

    res.json({
      symbol: quote?.symbol ?? symbol,
      currency: quote?.currency ?? null,
      price,
      change: quote?.regularMarketChange ?? null,
      changePercent: quote?.regularMarketChangePercent ?? null,
      marketTime: quote?.regularMarketTime
        ? new Date(quote.regularMarketTime * 1000).toISOString()
        : null,
      source: "yahoo-finance2",
    });
  } catch (error) {
    console.error("Yahoo Finance error", error);
    res.status(500).json({ error: "Failed to fetch quote" });
  }
});

app.get("/api/crypto/price", (req, res) => {
  const symbolParam = req.query.symbol;
  if (typeof symbolParam !== "string" || symbolParam.trim().length === 0) {
    res.status(400).json({ error: "symbol is required" });
    return;
  }

  res.json(getBinanceSnapshot(symbolParam));
});

app.get("/api/crypto/subscribe", (req, res) => {
  const symbolsParam = req.query.symbols ?? req.query.symbol;
  if (typeof symbolsParam !== "string" || symbolsParam.trim().length === 0) {
    res.status(400).json({ error: "symbols is required" });
    return;
  }

  const symbols = symbolsParam
    .split(",")
    .map((symbol) => normalizeCryptoSymbol(symbol))
    .filter((symbol) => symbol.length > 0);

  const data = symbols.map((symbol) => {
    const state = ensureBinanceStream(symbol);
    return {
      symbol: state.symbol,
      price: state.price,
      lastUpdated: state.lastUpdated,
      source: "binance-ws",
      status: state.price ? "ready" : "warming",
    };
  });

  res.json({ data });
});

app.get("/api/crypto/prices", (req, res) => {
  const symbolsParam = req.query.symbols;
  if (typeof symbolsParam !== "string" || symbolsParam.trim().length === 0) {
    res.status(400).json({ error: "symbols is required" });
    return;
  }

  const symbols = symbolsParam.split(",").map((symbol) => symbol.trim()).filter(Boolean);
  const data = symbols.map((symbol) => getBinanceSnapshot(symbol));

  res.json({ data });
});

app.listen(port, () => {
  console.log(`Portfolio backend running on http://localhost:${port}`);
});

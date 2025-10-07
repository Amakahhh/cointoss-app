import { useEffect, useState, useRef } from 'react';

/*
 Hook: useMarketData
 Fetches Binance klines for BTCUSDT based on interval.
 Provides:
  - candles: [{ open, high, low, close, volume, time }]
  - line: [{ t, price }]
  - loading, error, source ('live' | 'mock')
  - refresh() manual trigger
 Fallback: If network fails or CORS blocked, generates mock walk data.
*/

const BINANCE_ENDPOINT = 'https://api.binance.com/api/v3/klines';

const intervalToLimit = (interval) => {
  switch(interval) {
    case '1m': return 120; // last 2 hours
    case '5m': return 144; // last 12 hours
    case '15m': return 96; // last 24 hours
    case '1h': return 168; // last 7 days
    default: return 120;
  }
};

const useMarketData = (interval = '1m', symbol = 'BTCUSDT') => {
  const [candles, setCandles] = useState([]);
  const [line, setLine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('live');
  const [wsConnected, setWsConnected] = useState(false);
  const abortRef = useRef(null);
  const wsRef = useRef(null);

  const buildMock = () => {
    const limit = intervalToLimit(interval);
    let price = 50000 + Math.random() * 500 - 250;
    const mock = [];
    for (let i = limit - 1; i >= 0; i--) {
      const open = price;
      const jitter = price * 0.002 * (Math.random() - 0.5);
      const close = Math.max(100, open + jitter);
      const high = Math.max(open, close) + Math.random() * price * 0.001;
      const low = Math.min(open, close) - Math.random() * price * 0.001;
      const vol = (Math.random() * 15 + 5).toFixed(3);
      price = close;
      mock.push({
        time: Date.now() - i * intervalMs(interval),
        open, high, low, close, volume: parseFloat(vol)
      });
    }
    setCandles(mock);
    setLine(mock.map(c => ({ t: c.time, price: c.close })));
    setSource('mock');
  };

  const intervalMs = (intv) => {
    if (intv.endsWith('m')) return parseInt(intv) * 60 * 1000;
    if (intv.endsWith('h')) return parseInt(intv) * 60 * 60 * 1000;
    return 60 * 1000;
  };

  const fetchData = async () => {
    setLoading(true); setError(null);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const limit = intervalToLimit(interval);
  const params = new URLSearchParams({ symbol, interval, limit: String(limit) });
    try {
      const resp = await fetch(`${BINANCE_ENDPOINT}?${params.toString()}`, { signal: controller.signal });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const raw = await resp.json();
      // raw format: [ openTime, open, high, low, close, volume, closeTime, ... ]
      const parsed = raw.map(r => ({
        time: r[0],
        open: parseFloat(r[1]),
        high: parseFloat(r[2]),
        low: parseFloat(r[3]),
        close: parseFloat(r[4]),
        volume: parseFloat(r[5])
      }));
      setCandles(parsed);
      setLine(parsed.map(c => ({ t: c.time, price: c.close })));
      setSource('live');
    } catch (e) {
      console.warn('Market data fetch failed, using mock:', e.message);
      setError(e.message);
      buildMock();
    } finally {
      setLoading(false);
    }
  };

  // WebSocket setup for near real-time updates.
  // Strategy:
  // 1. Perform a full REST fetch on interval / symbol change to seed historical candles.
  // 2. Open a kline stream and update (replace) the last candle while it's forming.
  // 3. When the exchange rolls over to a new kline (kline start time differs), append it and trim to limit.
  // 4. Poll occasionally as a reconciliation layer in case of missed WS frames.
  // Source semantics:
  //   source === 'live' => Data came from REST/WS.
  //   source === 'mock' => Fallback synthetic series due to fetch failure (network / CORS / rate limit).
  useEffect(() => {
    // Refresh base data whenever interval or symbol changes
    fetchData();

    // Clear old websocket if any
    if (wsRef.current) {
      try { wsRef.current.close(); } catch(_) {}
    }

    // Binance kline stream format: wss://stream.binance.com:9443/ws/{symbolLower}@kline_{interval}
    const streamSymbol = symbol.toLowerCase();
    const wsUrl = `wss://stream.binance.com:9443/ws/${streamSymbol}@kline_${interval}`;
  const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

  ws.onopen = () => setWsConnected(true);

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (!msg.k) return; // ensure kline payload
        const k = msg.k; // kline data
        const kline = {
          time: k.t,
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v)
        };
        setCandles(prev => {
          if (!prev.length) return [kline];
          const last = prev[prev.length - 1];
            // If same open time, replace (updating forming candle)
          if (last.time === kline.time) {
            const updated = [...prev.slice(0, -1), kline];
            setLine(updated.map(c => ({ t: c.time, price: c.close })));
            return updated;
          }
          // Append only if new and keep size bounded similar to initial limit
          const limit = intervalToLimit(interval);
          const next = [...prev, kline].slice(-limit);
          setLine(next.map(c => ({ t: c.time, price: c.close })));
          return next;
        });
      } catch (e) {
        // Silently ignore malformed messages
      }
    };

    ws.onerror = () => {
      // On error, fallback to timed polling only
      console.warn('WebSocket error; falling back to polling');
      try { ws.close(); } catch(_) {}
    };

    ws.onclose = () => setWsConnected(false);

    // Polling still used as periodic reconciliation in case of missed frames
    const pollId = setInterval(fetchData, interval === '1m' ? 120_000 : 180_000);

    return () => {
      clearInterval(pollId);
      if (abortRef.current) abortRef.current.abort();
      if (wsRef.current) {
        try { wsRef.current.close(); } catch(_) {}
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, symbol]);

  return { candles, line, loading, error, source, wsConnected, refresh: fetchData };
};

export default useMarketData;

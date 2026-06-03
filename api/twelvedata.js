const MEMORY_CACHE_MS = Number(process.env.TWELVE_CACHE_MS || 3000); // set 3000 in Vercel, can use 2000-5000
const memoryCache = globalThis.__tmTwelveCache || (globalThis.__tmTwelveCache = new Map());

export default async function handler(req, res) {
  // V2.4.7:
  // Twelve Data endpoint no longer validates Supabase token on every polling request.
  // The dashboard page itself is still protected by Supabase login.
  // This prevents 401 loops when 5 timeframes are polled every 5 seconds.
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ status: 'error', message: 'Missing TWELVE_DATA_API_KEY on server' });
  }

  const allowedIntervals = new Set(['1min', '5min', '15min', '30min', '1h', '4h', '1day']);
  const symbol = String(req.query.symbol || 'XAU/USD');
  const endpoint = String(req.query.endpoint || 'time_series');
  const interval = String(req.query.interval || '15min');
  const outputsize = Math.min(Math.max(parseInt(req.query.outputsize || '160', 10), 40), 500);

  if (symbol !== 'XAU/USD') {
    return res.status(400).json({ status: 'error', message: 'Only XAU/USD is enabled in this POC' });
  }

  if (endpoint === 'price') {
    const priceCacheKey = `${symbol}:price`;
    const cachedPrice = memoryCache.get(priceCacheKey);
    if (cachedPrice && (Date.now() - cachedPrice.ts) < MEMORY_CACHE_MS) {
      res.setHeader('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');
      res.setHeader('X-TM-Cache', 'price-memory-hit');
      return res.status(200).json(cachedPrice.data);
    }

    // V2.4.5: Safe real-price mode.
    // First try /price. If Twelve Data rejects it for XAU/USD, fallback to latest 1min time_series close.
    let lastError = '';
    try {
      const priceUrl = new URL('https://api.twelvedata.com/price');
      priceUrl.searchParams.set('symbol', symbol);
      priceUrl.searchParams.set('apikey', apiKey);
      const upstream = await fetch(priceUrl.toString(), { headers: { 'Accept': 'application/json' } });
      const data = await upstream.json();

      if (upstream.ok && data && !data.code && data.status !== 'error' && data.price && Number.isFinite(Number(data.price))) {
        const clean = { price: String(data.price), source: 'price' };
        memoryCache.set(priceCacheKey, { ts: Date.now(), data: clean });
        res.setHeader('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');
        res.setHeader('X-TM-Cache', 'price-fresh');
        return res.status(200).json(clean);
      }
      lastError = data?.message || data?.status || 'price endpoint rejected response';
    } catch (err) {
      lastError = err.message || 'price endpoint failed';
    }

    try {
      const tsUrl = new URL('https://api.twelvedata.com/time_series');
      tsUrl.searchParams.set('symbol', symbol);
      tsUrl.searchParams.set('interval', '1min');
      tsUrl.searchParams.set('outputsize', '1');
      tsUrl.searchParams.set('apikey', apiKey);
      const upstream = await fetch(tsUrl.toString(), { headers: { 'Accept': 'application/json' } });
      const data = await upstream.json();

      const latest = Array.isArray(data?.values) ? data.values[0] : null;
      const close = latest?.close;
      if (upstream.ok && latest && close && Number.isFinite(Number(close))) {
        const clean = { price: String(close), source: 'time_series_1min_close', datetime: latest.datetime };
        memoryCache.set(priceCacheKey, { ts: Date.now(), data: clean });
        res.setHeader('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');
        res.setHeader('X-TM-Cache', 'price-fallback-fresh');
        return res.status(200).json(clean);
      }

      return res.status(502).json({
        status: 'error',
        message: data?.message || `Twelve Data price fallback failed. First error: ${lastError}`
      });
    } catch (err) {
      return res.status(500).json({ status: 'error', message: err.message || `Server error. First error: ${lastError}` });
    }
  }
  if (!allowedIntervals.has(interval)) {
    return res.status(400).json({ status: 'error', message: 'Invalid interval' });
  }

  const url = new URL('https://api.twelvedata.com/time_series');
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('interval', interval);
  url.searchParams.set('outputsize', String(outputsize));
  url.searchParams.set('apikey', apiKey);

  const cacheKey = `${symbol}:${interval}:${outputsize}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && (Date.now() - cached.ts) < MEMORY_CACHE_MS) {
    res.setHeader('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-TM-Cache', 'memory-hit');
    return res.status(200).json(cached.data);
  }

  try {
    const upstream = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
    const data = await upstream.json();
    if (!upstream.ok || data.status === 'error' || data.code) {
      return res.status(502).json({ status: 'error', message: data.message || 'Twelve Data upstream error' });
    }

    memoryCache.set(cacheKey, { ts: Date.now(), data });
    res.setHeader('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-TM-Cache', 'fresh');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message || 'Server error' });
  }
}

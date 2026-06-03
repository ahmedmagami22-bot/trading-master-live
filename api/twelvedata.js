const MEMORY_CACHE_MS = Number(process.env.TWELVE_CACHE_MS || 3000); // set 3000 in Vercel, can use 2000-5000
const memoryCache = globalThis.__tmTwelveCache || (globalThis.__tmTwelveCache = new Map());

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://boofaksowdohnzapcwhr.supabase.co';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_JdMEz9pwOafCtTUz6PBS0A_eEAQS5qA';
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Missing Supabase auth token' });
  }

  const authCheck = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`
    }
  });

  if (!authCheck.ok) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired session' });
  }

const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ status: 'error', message: 'Missing TWELVE_DATA_API_KEY on server' });
  }

  const allowedIntervals = new Set(['1min', '5min', '15min', '30min', '1h', '4h', '1day']);
  const symbol = String(req.query.symbol || 'XAU/USD');
  const interval = String(req.query.interval || '15min');
  const outputsize = Math.min(Math.max(parseInt(req.query.outputsize || '160', 10), 40), 500);

  if (symbol !== 'XAU/USD') {
    return res.status(400).json({ status: 'error', message: 'Only XAU/USD is enabled in this POC' });
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

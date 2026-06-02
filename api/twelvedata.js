export default async function handler(req, res) {
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

  try {
    const upstream = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
    const data = await upstream.json();
    if (!upstream.ok || data.status === 'error' || data.code) {
      return res.status(502).json({ status: 'error', message: data.message || 'Twelve Data upstream error' });
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message || 'Server error' });
  }
}

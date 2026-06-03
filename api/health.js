export default async function handler(req, res) {
  const hasKey = Boolean(process.env.TWELVE_DATA_API_KEY);
  const keyLength = process.env.TWELVE_DATA_API_KEY ? process.env.TWELVE_DATA_API_KEY.length : 0;
  return res.status(200).json({
    ok: true,
    has_twelve_key: hasKey,
    key_length: keyLength,
    cache_ms: process.env.TWELVE_CACHE_MS || null,
    note: 'Does not expose secret values.'
  });
}

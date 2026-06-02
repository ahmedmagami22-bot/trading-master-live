export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://boofaksowdohnzapcwhr.supabase.co';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_JdMEz9pwOafCtTUz6PBS0A_eEAQS5qA';
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return res.status(401).json({ ok:false });
  const r = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` }
  });
  return res.status(r.ok ? 200 : 401).json({ ok: r.ok });
}

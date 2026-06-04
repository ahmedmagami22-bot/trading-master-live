export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, message:'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL || 'https://boofaksowdohnzapcwhr.supabase.co';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_JdMEz9pwOafCtTUz6PBS0A_eEAQS5qA';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    return res.status(200).json({ ok:false, mode:'fallback', message:'Missing SUPABASE_SERVICE_ROLE_KEY' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return res.status(401).json({ ok:false, message:'Missing token' });

  const authCheck = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` }
  });
  if (!authCheck.ok) return res.status(401).json({ ok:false, message:'Invalid session' });

  const user = await authCheck.json().catch(()=>({}));
  const email = user.email || null;
  const body = req.body || {};
  const events = Array.isArray(body.events) ? body.events : [];
  const today = new Date().toISOString().slice(0,10);
  const month = today.slice(0,7);

  const safeEvents = events
    .filter(e => e && e.event_key && e.tf && e.event_type && Number.isFinite(Number(e.pips)))
    .map(e => ({
      event_key:String(e.event_key).slice(0,240),
      tf:String(e.tf).slice(0,20),
      signal_key:String(e.signal_key||'').slice(0,240),
      event_type:String(e.event_type).slice(0,20),
      sig:String(e.sig||'').slice(0,10),
      pips:Math.round(Number(e.pips)),
      day:String(e.day||today).slice(0,10),
      month:String(e.month||month).slice(0,7),
      source_email:email
    }));

  if (safeEvents.length) {
    const upsert = await fetch(`${supabaseUrl}/rest/v1/trade_events?on_conflict=event_key`, {
      method:'POST',
      headers:{
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type':'application/json',
        Prefer:'resolution=ignore-duplicates,return=minimal'
      },
      body: JSON.stringify(safeEvents)
    });
    if (!upsert.ok) return res.status(500).json({ ok:false, message:'Save failed', details:await upsert.text() });
  }

  const q = `select=tf,pips,day,month,event_type,signal_key&or=(day.eq.${today},month.eq.${month})`;
  const r = await fetch(`${supabaseUrl}/rest/v1/trade_events?${q}`, {
    headers:{ apikey:serviceKey, Authorization:`Bearer ${serviceKey}` }
  });
  if (!r.ok) return res.status(500).json({ ok:false, message:'Read failed', details:await r.text() });

  const rows = await r.json();
  const byTf = {};
  const totals = { daily:0, monthly:0 };
  const winKeys = new Set();
  const lossKeys = new Set();
  for (const row of rows) {
    const tf = row.tf || 'unknown';
    if (!byTf[tf]) byTf[tf] = { daily:0, monthly:0 };
    const p = Number(row.pips || 0);
    if (row.day === today) { byTf[tf].daily += p; totals.daily += p; }
    if (row.month === month) { byTf[tf].monthly += p; totals.monthly += p; }
    if (row.event_type === 'WIN_TRADE') winKeys.add(row.signal_key || `${tf}:win`);
    if (row.event_type === 'LOSS_TRADE') lossKeys.add(row.signal_key || `${tf}:loss`);
  }
  const wins = winKeys.size;
  const losses = [...lossKeys].filter(k => !winKeys.has(k)).length;
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  return res.status(200).json({ ok:true, mode:'central', saved:safeEvents.length, today, month, byTf, totals, stats:{wins, losses, winRate} });
}

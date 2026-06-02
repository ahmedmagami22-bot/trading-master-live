export default async function handler(req, res) {
  return res.status(410).json({ ok:false, message:'Supabase Auth is used on the client login page.' });
}

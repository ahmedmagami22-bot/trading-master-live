export default async function handler(req, res) {
  const token = process.env.DASHBOARD_AUTH_TOKEN;
  const cookie = req.headers.cookie || '';
  if (token && cookie.includes(`tm_auth=${token}`)) {
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ ok: false });
}

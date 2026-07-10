export default function handler(req, res) {
  const client_id = process.env.OAUTH_CLIENT_ID;
  if (!client_id) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end("Erro: OAUTH_CLIENT_ID não está configurado na Vercel.");
    return;
  }

  // Captura a origem original a partir do cabeçalho Referer de onde o login foi iniciado
  const referer = req.headers.referer;
  let origin = '';
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      origin = refererUrl.origin;
    } catch (e) {
      // Ignora erro de parsing
    }
  }

  // Se não foi possível detectar via referer, usa o próprio host como fallback
  if (!origin) {
    const host = req.headers.host || '';
    origin = host ? `https://${host.replace(/^www\./, '')}` : '';
  }

  // Passa a origem original no parâmetro 'state' para que o callback possa redirecionar de volta se houver mismatch de CORS
  const state = encodeURIComponent(origin);

  res.statusCode = 302;
  res.setHeader('Location', `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user&state=${state}`);
  res.end();
}

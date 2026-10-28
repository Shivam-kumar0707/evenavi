/**
 * GET /api/health
 * Simple health check for serverless function readiness.
 */
export default function handler(req, res) {
  res.status(200).json({ ok: true, service: 'evenavi-ai-proxy', timestamp: new Date().toISOString() });
}

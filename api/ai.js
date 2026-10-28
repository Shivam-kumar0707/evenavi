/**
 * POST /api/ai
 * Serverless proxy endpoint for Groq AI completions.
 * Strictly enforces task allowlist, Zod schemas, size limits, and 1-attempt repair on output mismatch.
 */

import { checkRateLimit } from './_lib/rateLimit.js';
import { ALLOWED_TASKS, TaskInputSchemas, TaskOutputSchemas } from './_lib/schemas.js';
import { SHARED_SYSTEM_PROMPT, TASK_CONFIG, buildTaskPrompt } from './_lib/prompts.js';
import { callGroq } from './_lib/groq.js';

export default async function handler(req, res) {
  // Security headers & CORS
  const origin = req.headers.origin;
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  if (allowedOrigin && origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED', message: 'Only POST supported' });
  }

  // 1. IP Rate Limiting
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const rateLimit = checkRateLimit(clientIp);
  if (rateLimit.limited) {
    res.setHeader('Retry-After', Math.ceil(rateLimit.resetMs / 1000).toString());
    return res.status(429).json({
      ok: false,
      code: 'RATE_LIMITED',
      message: `Rate limit exceeded. Try again in ${Math.ceil(rateLimit.resetMs / 1000)} seconds.`,
    });
  }

  const { task, input } = req.body || {};

  // 2. Allowlist task check
  if (!task || !ALLOWED_TASKS.includes(task)) {
    return res.status(400).json({
      ok: false,
      code: 'BAD_REQUEST',
      message: `Invalid or disallowed task: ${task}`,
    });
  }

  // 3. Input Validation via Zod
  const inputSchema = TaskInputSchemas[task];
  if (!inputSchema) {
    return res.status(400).json({ ok: false, code: 'BAD_REQUEST', message: `No schema defined for task ${task}` });
  }

  const inputValidation = inputSchema.safeParse(input);
  if (!inputValidation.success) {
    return res.status(400).json({
      ok: false,
      code: 'BAD_REQUEST',
      message: 'Input validation failed',
      errors: inputValidation.error.format(),
    });
  }

  // 4. Build Prompts Server-Side
  let userPrompt;
  try {
    userPrompt = buildTaskPrompt(task, inputValidation.data);
  } catch (err) {
    return res.status(400).json({ ok: false, code: 'BAD_REQUEST', message: err.message });
  }

  const config = TASK_CONFIG[task] || { temperature: 0.2, maxTokens: 1000 };
  const primaryModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const fallbackModel = process.env.GROQ_MODEL_FALLBACK || 'llama-3.1-8b-instant';

  // 5. Call Groq with Fallback Model on failure
  let groqResult;
  try {
    groqResult = await callGroq({
      systemPrompt: SHARED_SYSTEM_PROMPT,
      userPrompt,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      model: primaryModel,
    });
  } catch (primaryErr) {
    if (primaryErr.status === 429) {
      return res.status(429).json({ ok: false, code: 'RATE_LIMITED', message: 'Upstream rate limit reached.' });
    }
    // Attempt with fallback model
    try {
      groqResult = await callGroq({
        systemPrompt: SHARED_SYSTEM_PROMPT,
        userPrompt,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        model: fallbackModel,
      });
    } catch (fallbackErr) {
      if (fallbackErr.code === 'TIMEOUT') {
        return res.status(504).json({ ok: false, code: 'TIMEOUT', message: 'AI request timed out after 20 seconds.' });
      }
      return res.status(502).json({
        ok: false,
        code: 'UPSTREAM_ERROR',
        message: fallbackErr.message || 'Groq upstream service unavailable.',
      });
    }
  }

  // 6. Validate Output Schema with 1-Attempt Repair
  const outputSchema = TaskOutputSchemas[task];
  if (!outputSchema) {
    return res.status(200).json({
      ok: true,
      task,
      data: groqResult.data,
      meta: { model: groqResult.model, latencyMs: groqResult.latencyMs },
    });
  }

  let outputValidation = outputSchema.safeParse(groqResult.data);

  if (!outputValidation.success) {
    // Repair attempt: call once more asking to fix schema errors
    const repairPrompt = `The previous JSON response did not match the expected schema.
Validation errors:
${JSON.stringify(outputValidation.error.format())}

Original request:
${userPrompt}

Please fix the errors and return ONLY the corrected valid JSON matching the exact required shape.`;

    try {
      const repairResult = await callGroq({
        systemPrompt: SHARED_SYSTEM_PROMPT,
        userPrompt: repairPrompt,
        temperature: 0.1,
        maxTokens: config.maxTokens,
        model: fallbackModel,
      });

      outputValidation = outputSchema.safeParse(repairResult.data);
      if (outputValidation.success) {
        return res.status(200).json({
          ok: true,
          task,
          data: outputValidation.data,
          meta: { model: repairResult.model, latencyMs: groqResult.latencyMs + repairResult.latencyMs, repaired: true },
        });
      }
    } catch {
      // repair failed, fall through to error
    }

    return res.status(502).json({
      ok: false,
      code: 'INVALID_AI_OUTPUT',
      message: 'Model output failed schema validation after repair attempt.',
    });
  }

  return res.status(200).json({
    ok: true,
    task,
    data: outputValidation.data,
    meta: { model: groqResult.model, latencyMs: groqResult.latencyMs },
  });
}

/**
 * groq.js
 * Groq OpenAI-compatible Chat Completions client.
 * Calls https://api.groq.com/openai/v1/chat/completions with JSON mode and timeout.
 */

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Call Groq API with JSON mode
 * @param {object} params
 * @param {string} params.systemPrompt
 * @param {string} params.userPrompt
 * @param {number} params.temperature
 * @param {number} params.maxTokens
 * @param {string} [params.model]
 * @returns {Promise<{ data: object, model: string, latencyMs: number }>}
 */
export async function callGroq({
  systemPrompt,
  userPrompt,
  temperature = 0.2,
  maxTokens = 1000,
  model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY_MISSING');
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      const err = new Error('RATE_LIMITED');
      err.status = 429;
      err.retryAfter = response.headers.get('retry-after') || '2';
      throw err;
    }

    if (!response.ok) {
      const errText = await response.text();
      const err = new Error(`UPSTREAM_ERROR: ${response.status} - ${errText}`);
      err.status = response.status;
      throw err;
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('EMPTY_AI_RESPONSE');
    }

    const parsedData = JSON.parse(content);
    const latencyMs = Date.now() - startTime;

    return {
      data: parsedData,
      model: json.model || model,
      latencyMs,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      const err = new Error('TIMEOUT');
      err.code = 'TIMEOUT';
      throw err;
    }
    throw error;
  }
}

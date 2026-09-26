import 'server-only';

import OpenAI from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
import { z } from 'zod';

export const LLM_MODEL = 'deepseek-flash';

// Handles missing api key
let client: OpenAI | null = null;

const getClient = () => {
  if (!client) {
    client = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey: process.env.DEEPSEEK_API_KEY });
  }
  return client;
};

const MAX_ATTEMPTS = 2;

// DeepSeek's API only guarantees valid JSON syntax (response_format:
// json_object), not that it matches our schema unlike Gemini's
// responseSchema, which constrains the model to the exact shape at
// generation time. So this validates with zod and retries once
// It feeds the validation error back into the prompt before giving up
export const generateStructured = async <Schema extends z.ZodType>(prompt: string, schema: Schema): Promise<z.infer<Schema>> => {
  const jsonSchema = JSON.stringify(z.toJSONSchema(schema));
  let lastError = '';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const retryNote =
      attempt > 1
        ? `\n\nYour previous response did not match the required schema (${lastError}). Return only valid JSON matching the schema, no other text.`
        : '';

    const params: ChatCompletionCreateParamsNonStreaming & {
      // DeepSeek-specific extensions - not part of the OpenAI SDK's typed parans
      thinking?: { type: 'enabled' | 'disabled' };
    } = {
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: `Respond with only valid JSON matching this schema, no other text:\n${jsonSchema}` },
        { role: 'user', content: prompt + retryNote },
      ],
      response_format: { type: 'json_object' },
      thinking: { type: 'enabled' },
      reasoning_effort: 'high',
    };

    const completion = await getClient().chat.completions.create(params);
    const text = completion.choices[0]?.message?.content;

    if (!text) {
      lastError = 'empty response';
      continue;
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      lastError = 'response was not valid JSON';
      continue;
    }

    const parsed = schema.safeParse(json);
    if (parsed.success) return parsed.data;

    lastError = parsed.error.message;
  }

  throw new Error(`DeepSeek response did not match the expected schema after ${MAX_ATTEMPTS} attempts: ${lastError}`);
};

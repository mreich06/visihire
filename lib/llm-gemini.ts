import 'server-only';

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

export const GEMINI_MODEL = 'gemini-3.6-flash';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Gemini LLM response
export const generateStructured = async <Schema extends z.ZodType>(prompt: string, schema: Schema): Promise<z.infer<Schema>> => {
  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: z.toJSONSchema(schema),
    },
  });

  const text = response.text;
  if (!text) throw new Error('Gemini returned an empty response.');

  const parsed = schema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new Error(`Gemini response did not match the expected schema: ${parsed.error.message}`);
  }

  return parsed.data;
};

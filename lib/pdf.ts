import 'server-only';

import { extractText, getDocumentProxy } from 'unpdf';

export const extractPdfText = async (buffer: Uint8Array): Promise<string> => {
  const pdf = await getDocumentProxy(buffer);
  const { text } = await extractText(pdf, { mergePages: true });
  return text.trim();
};

import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(
  buffer: Buffer
): Promise<{ text: string; numpages: number }> {
  try {
    const data = await pdfParse(buffer);

    return {
      text: data.text ?? '',
      numpages: data.numpages ?? 0,
    };
  } catch (error) {
    console.error('❌ PDF parsing failed:', error);
    throw new Error('PDF parsing error');
  }
}


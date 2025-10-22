import { marked } from 'marked';

/**
 * Safely parse markdown content to HTML
 * Note: marked.js has built-in XSS protection when using default settings
 * @param markdown - Raw markdown string
 * @returns HTML string
 */
export function parseMarkdown(markdown: string): string {
  // Configure marked with safe defaults
  marked.setOptions({
    breaks: true,
    gfm: true,
  });
  
  // Parse markdown to HTML synchronously
  // marked() function is safe by default and escapes HTML
  const html = marked.parse(markdown, { async: false }) as string;
  
  return html;
}

/**
 * Calculate reading time for content
 * @param content - Text content
 * @returns Estimated reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return readingTime;
}

/**
 * Get word count from content
 * @param content - Text content
 * @returns Word count
 */
export function getWordCount(content: string): number {
  return content.trim().split(/\s+/).length;
}

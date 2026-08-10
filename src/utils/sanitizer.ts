export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  let cleaned = input.trim();
  
  // Strip potential prompt injection attempts or system override tokens
  cleaned = cleaned.replace(/<\|im_start\|>|<\|im_end\|>/gi, '');
  
  // Trim excessive whitespace
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');
  
  return cleaned;
}

export function validateMessageContent(content: string): { isValid: boolean; error?: string } {
  const sanitized = sanitizeInput(content);
  if (!sanitized) {
    return { isValid: false, error: 'Message cannot be empty.' };
  }
  if (sanitized.length > 32000) {
    return { isValid: false, error: 'Message exceeds maximum length of 32,000 characters.' };
  }
  return { isValid: true };
}

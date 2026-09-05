
import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  html: string;
  className?: string;
}

export function SafeHtml({ html, className = '' }: SafeHtmlProps) {
  if (!html) return null;

  // Add target="_blank" to all links
  DOMPurify.addHook('afterSanitizeAttributes', function (node) {
    if ('target' in node) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'a', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'title', 'class', 'style'],
  });

  // Check if it's actually plain text (no HTML tags detected)
  const isPlainText = !/<\/?[a-z][\s\S]*>/i.test(html);
  
  if (isPlainText) {
    return <p className={`whitespace-pre-line ${className}`}>{html}</p>;
  }

  return (
    <div 
      className={`prose prose-sm max-w-none text-slate-600 ${className}`} 
      dangerouslySetInnerHTML={{ __html: sanitized }} 
    />
  );
}

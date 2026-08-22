import { ExternalLink } from 'lucide-react';

interface TwitterButtonProps {
  url: string;
}

export default function TwitterButton({ url }: TwitterButtonProps) {
  // Safe extraction and validation
  let safeUrl = '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      if (parsed.hostname.includes('twitter.com') || parsed.hostname.includes('x.com')) {
        safeUrl = parsed.href;
      }
    }
  } catch (e) {
    return null;
  }

  if (!safeUrl) return null;

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/10 hover:bg-slate-900/20 text-slate-900 dark:text-slate-300 dark:bg-slate-700/50 dark:hover:bg-slate-700/70 font-semibold rounded-lg transition-colors border border-slate-900/20 dark:border-slate-600"
    >
      <span>Visit Twitter / X Profile</span>
      <ExternalLink className="w-4 h-4 ml-1" />
    </a>
  );
}

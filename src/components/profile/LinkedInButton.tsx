import { ExternalLink } from 'lucide-react';

interface LinkedInButtonProps {
  url: string;
}

export default function LinkedInButton({ url }: LinkedInButtonProps) {
  // Safe extraction and validation
  let safeUrl = '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      if (parsed.hostname.includes('linkedin.com')) {
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
      className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 text-[#0077b5] dark:text-blue-400 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 font-semibold rounded-lg transition-colors border border-[#0077b5]/20"
    >
      <span>Visit LinkedIn Profile</span>
      <ExternalLink className="w-4 h-4 ml-1" />
    </a>
  );
}

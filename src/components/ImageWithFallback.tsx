import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackClassName?: string;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc, 
  fallbackClassName = '',
  ...props 
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    if (fallbackSrc) {
      return <img src={fallbackSrc} alt={alt || 'Fallback'} className={className} {...props} />;
    }
    return (
      <div className={`flex items-center justify-center bg-slate-100 ${className} ${fallbackClassName}`} aria-label={alt || 'No image'}>
        <ImageIcon className="w-8 h-8 text-slate-300" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ''}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}

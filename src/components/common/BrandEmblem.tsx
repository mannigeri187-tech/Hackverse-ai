import React from 'react'

interface BrandEmblemProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showWordmark?: boolean
  className?: string
}

export default function BrandEmblem({ size = 'md', showWordmark = true, className = '' }: BrandEmblemProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Bespoke Abstract Prism Emblem SVG */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 blur-lg opacity-40 group-hover:opacity-85 transition-opacity duration-300" />
        
        {/* Vector SVG Crystalline Faceted Prism */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
        >
          <defs>
            <linearGradient id="prism-facet-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" /> {/* Electric Cyan */}
              <stop offset="100%" stopColor="#3B82F6" /> {/* Sapphire Blue */}
            </linearGradient>
            <linearGradient id="prism-facet-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" /> {/* Vivid Indigo */}
              <stop offset="100%" stopColor="#A855F7" /> {/* Hyper Purple */}
            </linearGradient>
            <linearGradient id="prism-facet-3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EC4899" /> {/* Neon Pink */}
              <stop offset="100%" stopColor="#F59E0B" /> {/* Amber Gold */}
            </linearGradient>
            <radialGradient id="core-light" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="70%" stopColor="#6366F1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Facet Top North-West */}
          <path
            d="M 50,8 L 88,30 L 50,50 L 12,30 Z"
            fill="url(#prism-facet-1)"
            opacity="0.95"
          />

          {/* Facet Bottom South-West */}
          <path
            d="M 12,30 L 50,50 L 50,92 L 12,70 Z"
            fill="url(#prism-facet-2)"
            opacity="0.90"
          />

          {/* Facet Bottom South-East */}
          <path
            d="M 50,50 L 88,30 L 88,70 L 50,92 Z"
            fill="url(#prism-facet-3)"
            opacity="0.85"
          />

          {/* Inner Quantum Core Star */}
          <polygon
            points="50,28 56,44 72,50 56,56 50,72 44,56 28,50 44,44"
            fill="url(#core-light)"
          />

          {/* Central Nexus Point */}
          <circle cx="50" cy="50" r="3" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Bespoke Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`${textSizes[size]} font-black tracking-wider uppercase bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-800 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent`}>
              HACK<span className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 bg-clip-text text-transparent">VERSE</span>
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-black tracking-widest text-white uppercase bg-gradient-to-r from-cyan-500 via-indigo-600 to-pink-500 rounded-md shadow-sm border border-white/20">
              AI
            </span>
          </div>
          <span className="text-[9px] font-bold tracking-[0.25em] text-gray-400 dark:text-gray-500 uppercase mt-0.5">
            ECOSYSTEM OS
          </span>
        </div>
      )}
    </div>
  )
}

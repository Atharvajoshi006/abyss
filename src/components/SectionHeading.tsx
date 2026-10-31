import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  italicWord?: string;
  description: string;
  align?: 'left' | 'center';
  theme?: 'light' | 'navy' | 'forest';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  italicWord,
  description,
  align = 'center',
  theme = 'light',
  className = '',
}) => {
  const isDark = theme === 'navy' || theme === 'forest';

  const eyebrowStyles = {
    light: 'bg-stone-200/60 text-stone-700 border-stone-300/80',
    navy: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
    forest: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50',
  }[theme];

  const titleStyles = isDark ? 'text-white' : 'text-[#121316]';
  const descStyles = isDark ? 'text-stone-300/80' : 'text-[#5a5f6e]';

  return (
    <div
      className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : 'text-left'} ${className}`}
    >
      {eyebrow && (
        <div className="inline-flex items-center gap-2 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold border ${eyebrowStyles}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                theme === 'navy'
                  ? 'bg-blue-400 animate-ping'
                  : theme === 'forest'
                  ? 'bg-emerald-400'
                  : 'bg-stone-900'
              }`}
            />
            {eyebrow}
          </span>
        </div>
      )}

      <h2
        className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.12] ${titleStyles}`}
      >
        {title}{' '}
        {italicWord && (
          <span className="font-serif italic font-normal text-stone-500 underline decoration-stone-300/60 decoration-wavy underline-offset-8">
            {italicWord}
          </span>
        )}
      </h2>

      <p className={`mt-4 text-base sm:text-lg leading-relaxed font-normal ${descStyles}`}>
        {description}
      </p>
    </div>
  );
};

import React from 'react';

// Silver/Steel Paperclip SVG with realistic gradient and shadow
export const PaperClip: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative inline-block pointer-events-none select-none ${className}`}>
    <svg width="34" height="68" viewBox="0 0 34 68" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
      <path
        d="M17 12V52C17 58.6274 22.3726 64 29 64C31.5 64 33 62 33 59V17C33 8.16344 25.8366 1 17 1C8.16344 1 1 8.16344 1 17V54C1 60.5 5.5 66 12 66"
        stroke="#94a3b8"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M17 12V52C17 58.6274 22.3726 64 29 64C31.5 64 33 62 33 59V17C33 8.16344 25.8366 1 17 1C8.16344 1 1 8.16344 1 17V54"
        stroke="#cbd5e1"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

// Pastel Yellow Sticky Note with subtle tape & rotation
export const StickyNote: React.FC<{
  title?: string;
  text: string;
  author?: string;
  className?: string;
  rotation?: string;
  tapeColor?: string;
}> = ({
  title,
  text,
  author,
  className = '',
  rotation = 'rotate-[-3deg]',
  tapeColor = 'bg-amber-200/80',
}) => (
  <div
    className={`relative bg-[#fef08a] text-[#713f12] p-4 rounded-sm shadow-md font-sans text-xs max-w-[190px] border border-amber-300/60 select-none ${rotation} ${className}`}
  >
    {/* Translucent tape at top */}
    <div
      className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-4 ${tapeColor} rounded-xs backdrop-blur-xs opacity-75 shadow-xs`}
    />
    {title && <div className="font-bold tracking-tight mb-1 text-[11px] uppercase opacity-80">{title}</div>}
    <p className="font-medium leading-relaxed italic text-[12px]">{text}</p>
    {author && <div className="mt-2 text-[10px] font-semibold text-amber-800/70 text-right">— {author}</div>}
  </div>
);

// Rubber Stamp badge
export const RubberStamp: React.FC<{
  text: string;
  variant?: 'blue' | 'red' | 'green' | 'amber';
  rotation?: string;
  className?: string;
}> = ({ text, variant = 'blue', rotation = 'rotate-[6deg]', className = '' }) => {
  const styles = {
    blue: 'border-blue-600/70 text-blue-700 bg-blue-50/40',
    red: 'border-rose-600/70 text-rose-700 bg-rose-50/40',
    green: 'border-emerald-600/70 text-emerald-700 bg-emerald-50/40',
    amber: 'border-amber-600/70 text-amber-700 bg-amber-50/40',
  }[variant];

  return (
    <div
      className={`inline-flex items-center justify-center px-3 py-1 rounded-sm border-2 border-dashed font-mono text-[10px] uppercase font-bold tracking-widest select-none ${styles} ${rotation} ${className}`}
    >
      {text}
    </div>
  );
};

// Tactile 3D Currency Token / Coin
export const CurrencyToken: React.FC<{
  symbol: string;
  code: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ symbol, code, color = '#10b981', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
  }[size];

  return (
    <div
      className={`relative rounded-full flex flex-col items-center justify-center font-bold text-white shadow-lg border-2 border-white/60 transition-transform hover:scale-110 select-none ${sizeClasses} ${className}`}
      style={{
        background: `radial-gradient(circle at 30% 30%, ${color}, #090a0f)`,
        boxShadow: `0 10px 20px -5px ${color}40, inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.5)`,
      }}
    >
      <span className="leading-none drop-shadow-sm">{symbol}</span>
      <span className="text-[8px] font-mono tracking-tighter opacity-80 uppercase">{code}</span>
    </div>
  );
};

// Miniature Paper Receipt with tear edge
export const PaperReceipt: React.FC<{
  title: string;
  amount: string;
  currency: string;
  status: string;
  id: string;
  className?: string;
  rotation?: string;
}> = ({ title, amount, currency, status, id, className = '', rotation = 'rotate-[-2deg]' }) => (
  <div
    className={`bg-white border border-stone-200/90 text-stone-900 rounded-t-md p-3.5 paper-shadow font-mono text-xs w-[175px] select-none ${rotation} ${className}`}
  >
    <div className="flex items-center justify-between pb-2 border-b border-dashed border-stone-300">
      <span className="text-[10px] font-bold text-stone-500 uppercase">{id}</span>
      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
    </div>
    <div className="py-2">
      <div className="text-[10px] text-stone-400 uppercase tracking-wider">{title}</div>
      <div className="text-base font-bold text-stone-900 mt-0.5">
        {amount} <span className="text-[10px] font-normal text-stone-500">{currency}</span>
      </div>
      <div className="mt-1 text-[9px] text-emerald-600 font-semibold bg-emerald-50 inline-block px-1.5 py-0.5 rounded">
        {status}
      </div>
    </div>
    <div className="pt-2 border-t border-dashed border-stone-200 flex justify-between items-center text-[9px] text-stone-400">
      <span>IndexedDB</span>
      <div className="flex gap-0.5 h-3 items-end">
        <span className="w-0.5 h-full bg-stone-700"></span>
        <span className="w-1 h-full bg-stone-700"></span>
        <span className="w-0.5 h-full bg-stone-400"></span>
        <span className="w-1.5 h-full bg-stone-700"></span>
        <span className="w-0.5 h-full bg-stone-700"></span>
      </div>
    </div>
    {/* Jagged bottom edge */}
    <div className="absolute -bottom-1.5 left-0 right-0 h-2 flex justify-between overflow-hidden">
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className="w-4 h-4 bg-white rotate-45 transform origin-top -translate-y-2 border-r border-b border-stone-200/90"
        />
      ))}
    </div>
  </div>
);

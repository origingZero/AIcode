import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

const defaults: P = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function GlobeIcon(p: P) {
  return (<svg {...defaults} width={14} height={14} {...p}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>);
}

export function RefreshIcon(p: P) {
  return (<svg {...defaults} {...p}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>);
}

export function ArrowDownIcon(p: P) {
  return (<svg {...defaults} {...p}><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>);
}

export function HeartIcon(p: P) {
  return (<svg {...defaults} {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>);
}

export function HeartFilledIcon(p: P) {
  return (<svg {...defaults} fill="currentColor" stroke="none" {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>);
}

export function ExternalLinkIcon(p: P) {
  return (<svg {...defaults} width={14} height={14} {...p}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>);
}

export function ClockIcon(p: P) {
  return (<svg {...defaults} width={12} height={12} strokeWidth={2} {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
}

export function ImageIcon(p: P) {
  return (<svg {...defaults} width={12} height={12} strokeWidth={2} {...p}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>);
}

export function SpinnerIcon(p: P) {
  return (<svg {...defaults} {...p} style={{ animation: 'spin 1s linear infinite', ...(p.style || {}) }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>);
}

export function CheckCircleIcon(p: P) {
  return (<svg {...defaults} width={16} height={16} {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>);
}

export function LanguageIcon(p: P) {
  return (<svg {...defaults} width={16} height={16} strokeWidth={2} {...p}><path d="M5 8l6 6" /><path d="M4 14l1-1" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="M22 22l-5-10-5 10" /><path d="M14 18h6" /></svg>);
}

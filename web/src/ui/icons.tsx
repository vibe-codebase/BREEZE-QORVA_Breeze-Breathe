/** Soft line icons for Breathe, plus the mark: two overlapping circles, a breath in and a breath out. */
const P: Record<string, string> = {
  orb: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  wave: 'M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0M3 17c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0M3 7c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0',
  note: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 5v16M8 7h7',
  right: 'M9 5l7 7-7 7',
  gear: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  back: 'M15 5l-7 7 7 7', plus: 'M12 5v14M5 12h14', minus: 'M5 12h14', close: 'M6 6l12 12M18 6 6 18', check: 'M5 12.5l4.5 4.5L19 7',
  play: 'M7 4.5v15l12-7.5z', pause: 'M8 5v14M16 5v14', stop: 'M6 6h12v12H6z', info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5h.01',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3', rain: 'M7 15a4 4 0 0 1-.6-8 5.5 5.5 0 0 1 10.6 1.5A3.5 3.5 0 0 1 17 15zM8 18l-1 2.5M12 18l-1 2.5M16 18l-1 2.5',
  noise: 'M3 12h2l1.5-5 2 10 2-12 2 14 2-10 2 6 1.5-3H21', ocean: 'M2 16c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 20c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M7 11c0-4 3-6 7-6-2 1.5-2 4 0 5',
  flame: 'M12 21c-4 0-7-2.8-7-6.6 0-3.2 2.2-5 3.6-7 .4 1.8 1.4 3 2.6 3.4C11 7.6 12.4 4.8 15 3c-.3 3.2 4 5.6 4 11 0 4-3 7-7 7z', clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
};
export function Icon({ name, size = 22, className, strokeWidth = 1.7 }: { name: string; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[name] ?? P.info} />
    </svg>
  );
}
export function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs><linearGradient id="mk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--teal)" /><stop offset="1" stopColor="var(--lilac)" /></linearGradient></defs>
      <circle cx="12.5" cy="16" r="9" fill="url(#mk)" opacity=".9" />
      <circle cx="19.5" cy="16" r="9" fill="none" stroke="url(#mk)" strokeWidth="2.2" />
    </svg>
  );
}

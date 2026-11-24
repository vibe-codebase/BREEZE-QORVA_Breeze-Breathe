/** Shared state for Breathe (the running session lives in App so it keeps going across tabs) and the small controls. */
import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import type { Timing } from '../lib/breath';
import type { Save, Settings } from '../lib/store';
import { Icon } from './icons';

export type Page = 'breathe' | 'patterns' | 'sounds' | 'journal' | 'settings' | 'about';
export type Run = { name: string; pattern: string; t: Timing; total: number; base: number; since: number | null };
export type Done = { sec: number; name: string };
export type AppApi = {
  save: Save;
  settings: Settings;
  set: (fn: (s: Save) => Save) => void;
  tap: (k?: 'light' | 'medium' | 'success') => void;
  go: (p: Page) => void;
  pushBack: (fn: () => void) => () => void;
  toast: (m: string) => void;
  confirm: (o: { title: string; body: string; action: string; danger?: boolean; onYes: () => void }) => void;
  /** Shows the welcome tour again. */
  tour: () => void;
  /** A short success animation with one line. */
  celebrate: (line: string) => void;
  run: Run | null;
  done: Done | null;
  begin: () => void;
  pause: () => void;
  resume: () => void;
  finish: () => void;
  closeDone: () => void;
  preview: boolean;
  setPreview: (on: boolean) => void;
};
export const AppCtx = createContext<AppApi>(null as never);
export const useApp = () => useContext(AppCtx);
export const elapsed = (r: Run, now = performance.now()) => r.base + (r.since === null ? 0 : (now - r.since) / 1000);
export function useBack(active: boolean, close: () => void) {
  const { pushBack } = useApp();
  const ref = useRef(close);
  ref.current = close;
  useEffect(() => (active ? pushBack(() => ref.current()) : undefined), [active, pushBack]);
}
export function Stepper({ label, value, min, max, step = 1, onChange, unit }: { label: ReactNode; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; unit?: string }) {
  const { tap } = useApp();
  const go = (d: number) => { const n = +Math.min(max, Math.max(min, value + d * step)).toFixed(2); if (n !== value) { tap(); onChange(n); } };
  return (
    <div className="stepper">
      <span className="st-l">{label}</span>
      <div className="st-c">
        <button onClick={() => go(-1)} disabled={value <= min} aria-label="Less"><Icon name="minus" size={18} /></button>
        <b>{value}{unit && <small>{unit}</small>}</b>
        <button onClick={() => go(1)} disabled={value >= max} aria-label="More"><Icon name="plus" size={18} /></button>
      </div>
    </div>
  );
}
export function Segmented<T extends string | number>({ value, options, onChange }: { value: T; options: { v: T; label: ReactNode }[]; onChange: (v: T) => void }) {
  const i = Math.max(0, options.findIndex((o) => o.v === value));
  return (
    <div className="seg" style={{ ['--n' as string]: options.length, ['--i' as string]: i }}>
      <span className="seg-mark" />
      {options.map((o) => <button key={String(o.v)} className={o.v === value ? 'on' : ''} onClick={() => onChange(o.v)}>{o.label}</button>)}
    </div>
  );
}
export function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button className="row" role="switch" aria-checked={on} onClick={() => onChange(!on)}>
      <span className="row-text"><b>{label}</b>{hint && <small>{hint}</small>}</span>
      <span className={`switch ${on ? 'on' : ''}`}><i /></span>
    </button>
  );
}
export function Label({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return <div className="label"><span>{children}</span>{right}</div>;
}
/** The four phases of a pattern drawn as a bar, each part as wide as its seconds. */
export function TimingBar({ t }: { t: Timing }) {
  return <div className="tbar">{t.map((s, i) => (s > 0 ? <i key={i} className={`k${i}`} style={{ flex: s }}><span>{s}</span></i> : null))}</div>;
}

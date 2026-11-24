import { useRef, useState, type PointerEvent as RPE, type ReactNode } from 'react';
import { Lottie } from '../lottie/Lottie';
import type { Anim } from '../lottie/build';
import { rubber, springEasing } from '../lib/motion';
import { useBack } from './kit';

export type Slide = { kicker: string; title: string; body: string; label: string; art: Anim };
const SETTLE = springEasing(190, 24);
/** First-launch tour: three swipeable cards, each with its own looping Lottie scene. The rail follows the finger 1:1. */
export function Tour({ name, mark, slides, cta, onDone, onTap, variant }: { name: string; mark: ReactNode; slides: Slide[]; cta: string; onDone: () => void; onTap: () => void; variant: string }) {
  useBack(true, onDone);
  const [i, setI] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; dx: number; t: number; v: number; on: boolean } | null>(null);
  const last = slides.length - 1;
  const place = (n: number, dx = 0, animate = true) => {
    const el = rail.current;
    if (!el) return;
    el.style.transition = animate ? `transform ${SETTLE.ms}ms ${SETTLE.easing}` : 'none';
    el.style.transform = `translateX(calc(${-n * 100}% + ${dx}px))`;
  };
  const to = (n: number) => { const k = Math.max(0, Math.min(last, n)); setI(k); place(k); };
  const next = () => { onTap(); if (i === last) onDone(); else to(i + 1); };
  const down = (e: RPE) => { drag.current = { x: e.clientX, y: e.clientY, dx: 0, t: e.timeStamp, v: 0, on: false }; };
  const move = (e: RPE) => {
    const d = drag.current;
    if (!d) return;
    const x = e.clientX - d.x;
    if (!d.on) { if (Math.abs(x) < 6) return; if (Math.abs(e.clientY - d.y) > Math.abs(x)) { drag.current = null; return; } d.on = true; }
    const edge = (i === 0 && x > 0) || (i === last && x < 0);
    const dx = edge ? Math.sign(x) * -rubber(-Math.abs(x)) : x;
    d.v = (dx - d.dx) / Math.max(1, e.timeStamp - d.t); d.dx = dx; d.t = e.timeStamp;
    place(i, dx, false);
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.on) return;
    const w = rail.current?.offsetWidth ?? 360;
    if ((d.dx < -w * 0.22 || d.v < -0.45) && i < last) { onTap(); to(i + 1); }
    else if ((d.dx > w * 0.22 || d.v > 0.45) && i > 0) { onTap(); to(i - 1); }
    else place(i);
  };
  return (
    <div className={`tour tour-${variant}`} role="dialog" aria-label={`Welcome to ${name}`} style={{ ['--ti' as string]: i, ['--tn' as string]: slides.length }}>
      <div className="tour-top"><span className="tour-brand">{mark}<b>{name}</b></span><button className="tour-skip" onClick={() => { onTap(); onDone(); }}>Skip</button></div>
      <div className="tour-track" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <div className="tour-rail" ref={rail}>
          {slides.map((s, k) => (
            <section key={k} className={`tour-card ${k === i ? 'on' : ''}`} aria-hidden={k !== i}>
              <div className="tour-frame"><Lottie data={s.art} className="tour-art" label={s.label} still={0.5} /></div>
              <div className="tour-words">
                <span className="tour-kicker">{s.kicker}</span>
                <h2>{s.title}</h2>
                <p>{s.body}</p>
              </div>
            </section>
          ))}
        </div>
      </div>
      <div className="tour-foot">
        <div className="tour-dots" role="tablist" aria-label="Tour cards">
          {slides.map((s, k) => <button key={k} role="tab" aria-selected={k === i} aria-label={s.title} className={k === i ? 'on' : ''} onClick={() => { onTap(); to(k); }}><i /></button>)}
          <span className="tour-count" aria-hidden="true">{String(i + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
        </div>
        <button className="tour-next" onClick={next}><span>{i === last ? cta : 'Next'}</span></button>
      </div>
    </div>
  );
}

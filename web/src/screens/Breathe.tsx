import { useEffect, useRef, useState } from 'react';
import { clock, fullness, perMinute, phaseAt, sessionSeconds, streak, WORDS, type Kind } from '../lib/breath';
import { MINUTES, timingOf } from '../lib/store';
import { Icon } from '../ui/icons';
import { elapsed, TimingBar, useApp } from '../ui/kit';

type View = { kind: Kind; left: number; remain: number; cycle: number; pct: number };

/** The orb: it fills as you breathe in, waits while you hold, and empties as you breathe out. */
export default function Breathe() {
  const { save, set, settings, tap, go, run, done, begin, pause, resume, finish, closeDone } = useApp();
  const orb = useRef<HTMLDivElement>(null);
  const [v, setV] = useState<View | null>(null);
  const pat = timingOf(save);
  useEffect(() => {
    const el = orb.current;
    if (!run) { setV(null); if (el) el.style.removeProperty('--f'); return; }
    let raf = 0;
    const frame = () => {
      const sec = Math.min(run.total, elapsed(run));
      const ph = phaseAt(run.t, sec);
      orb.current?.style.setProperty('--f', fullness(ph, run.t).toFixed(4));
      const next: View = { kind: ph.kind, left: Math.ceil(ph.left - 1e-6), remain: Math.ceil(run.total - sec), cycle: ph.cycle + 1, pct: sec / run.total };
      setV((o) => (o && o.kind === next.kind && o.left === next.left && o.remain === next.remain && Math.abs(o.pct - next.pct) < 0.002 ? o : next));
      if (run.since !== null) raf = requestAnimationFrame(frame);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [run]);
  const paused = !!run && run.since === null;
  const cycles = run ? Math.round(run.total / run.t.reduce((a, b) => a + b, 0)) : 0;
  const R = 47, C = 2 * Math.PI * R;
  return (
    <div className="page breathe">
      <button className="pat-chip" onClick={() => { tap(); go('patterns'); }} disabled={!!run}>
        <span><b>{pat.name}</b><small>{+perMinute(pat.t).toFixed(1)} breaths a minute</small></span>
        <TimingBar t={pat.t} />
      </button>
      <div className={`orb-zone ${run ? (paused ? 'paused' : 'running') : 'idle'} ${v?.kind ?? ''}`} onClick={() => { if (!run && !done) begin(); }}>
        <svg className="ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={R} className="ring-bg" />
          {run && <circle cx="50" cy="50" r={R} className="ring-fg" strokeDasharray={C} strokeDashoffset={C * (1 - (v?.pct ?? 0))} />}
        </svg>
        <div className="orb" ref={orb}><i className="halo h1" /><i className="halo h2" /><i className="core" /></div>
        <div className="orb-text" aria-live="polite">
          {run && v ? <><b>{paused ? 'Paused' : WORDS[v.kind]}</b><span>{paused ? 'Tap resume when ready' : v.left}</span></>
            : done ? <><b>Well breathed</b><span className="small">{Math.max(1, Math.round(done.sec / 60))} min</span></>
            : <><b>Tap to begin</b><span className="small">{settings.minutes} min · {pat.name}</span></>}
        </div>
      </div>
      {run && v ? (
        <div className="session">
          <div className="sess-facts"><span><small>Left</small><b>{clock(v.remain)}</b></span><span><small>Breath</small><b>{Math.min(v.cycle, cycles)}<em>/{cycles}</em></b></span></div>
          <div className="ctrls">
            <button className="ctl ghost" onClick={() => { tap(); finish(); }} aria-label="Finish session"><Icon name="stop" size={20} /></button>
            {paused ? <button className="ctl main" onClick={() => { tap('medium'); resume(); }}><Icon name="play" size={22} />Resume</button>
              : <button className="ctl main" onClick={() => { tap(); pause(); }}><Icon name="pause" size={22} />Pause</button>}
          </div>
        </div>
      ) : done ? (
        <div className="done-card">
          <p><b>{Math.max(1, Math.round(done.sec / 60))} minute{Math.round(done.sec / 60) > 1 ? 's' : ''}</b> of {done.name.toLowerCase()} breathing, logged in your journal.{streak(save.log, new Date()) > 1 && <> You're on a <b>{streak(save.log, new Date())}-day streak</b>.</>}</p>
          <div className="ctrls"><button className="ctl ghost wide" onClick={() => { tap(); closeDone(); go('journal'); }}>Journal</button><button className="ctl main" onClick={() => { tap(); closeDone(); }}><Icon name="check" size={22} />Done</button></div>
        </div>
      ) : (
        <div className="session">
          <div className="mins" role="radiogroup" aria-label="Session length">
            {MINUTES.map((m) => <button key={m} role="radio" aria-checked={settings.minutes === m} className={settings.minutes === m ? 'on' : ''} onClick={() => { tap(); set((s) => ({ ...s, settings: { ...s.settings, minutes: m } })); }}>{m}<small>min</small></button>)}
          </div>
          <div className="ctrls"><button className="ctl main" onClick={begin}><Icon name="play" size={22} />Begin · {clock(sessionSeconds(pat.t, settings.minutes))}</button></div>
        </div>
      )}
    </div>
  );
}

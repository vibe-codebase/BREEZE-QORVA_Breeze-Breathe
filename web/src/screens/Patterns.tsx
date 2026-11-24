import { cycleLength, PATTERNS, perMinute, type Timing } from '../lib/breath';
import { Icon } from '../ui/icons';
import { Label, Stepper, TimingBar, useApp } from '../ui/kit';

const NAMES = ['Breathe in', 'Hold', 'Breathe out', 'Rest'];

export default function Patterns() {
  const { save, set, tap, go, run, toast } = useApp();
  const choose = (id: string) => {
    if (run) { toast('Finish this session first'); return; }
    tap('medium'); set((s) => ({ ...s, pattern: id })); go('breathe');
  };
  const c = save.custom;
  const setC = (i: number, v: number) => set((s) => { const t = [...s.custom] as Timing; t[i] = v; return { ...s, custom: t }; });
  return (
    <div className="page-scroll patterns">
      {PATTERNS.map((p) => (
        <button key={p.id} className={`pcard ${save.pattern === p.id ? 'on' : ''}`} onClick={() => choose(p.id)}>
          <span className="pc-top"><b>{p.name}</b><em>{p.use}</em></span>
          <p>{p.blurb}</p>
          <TimingBar t={p.t} />
          <span className="pc-foot"><small>{p.t.filter((x) => x > 0).join(' · ')} s</small><small>{+perMinute(p.t).toFixed(1)} / min</small>{save.pattern === p.id && <i><Icon name="check" size={16} strokeWidth={2.4} /></i>}</span>
        </button>
      ))}
      <Label>Make your own</Label>
      <div className={`pcard custom ${save.pattern === 'custom' ? 'on' : ''}`}>
        <TimingBar t={c} />
        <div className="steps">{NAMES.map((n, i) => <Stepper key={n} label={<><i className={`dot k${i}`} />{n}</>} value={c[i]} min={i % 2 === 0 ? 1 : 0} max={12} onChange={(v) => setC(i, v)} unit="s" />)}</div>
        <div className="pc-foot"><small>{cycleLength(c)} s a breath · {+perMinute(c).toFixed(1)} / min</small>
          <button className="use-btn" onClick={() => choose('custom')}>{save.pattern === 'custom' ? 'In use' : 'Use this'}</button></div>
      </div>
    </div>
  );
}

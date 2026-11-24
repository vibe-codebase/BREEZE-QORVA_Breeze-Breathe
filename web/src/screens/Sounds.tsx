import type { Mix } from '../lib/store';
import { Icon } from '../ui/icons';
import { Label, useApp } from '../ui/kit';

const BEDS: { id: keyof Mix; name: string; hint: string; icon: string }[] = [
  { id: 'ocean', name: 'Ocean', hint: 'Slow waves on a beach', icon: 'ocean' },
  { id: 'rain', name: 'Rain', hint: 'Soft rain on a window', icon: 'rain' },
  { id: 'brown', name: 'Brown noise', hint: 'A deep, steady hush', icon: 'noise' },
];

/** A three-bed mixer, all made live by Web Audio. It plays during sessions, or now while previewing. */
export default function Sounds() {
  const { save, set, tap, preview, setPreview, run } = useApp();
  const live = preview || (!!run && run.since !== null);
  const silent = BEDS.every((b) => save.mix[b.id] === 0);
  return (
    <div className="page-scroll sounds">
      <div className={`listen ${live ? 'on' : ''}`}>
        <div className="eq" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <i key={i} style={{ animationDelay: `${i * -0.23}s` }} />)}</div>
        <span><b>{live ? 'Playing' : 'Quiet'}</b><small>{run ? 'Your mix plays while you breathe' : 'Sounds play during each session'}</small></span>
        {!run && <button className="ctl main small" onClick={() => { tap(); setPreview(!preview); }} disabled={silent && !preview}><Icon name={preview ? 'pause' : 'play'} size={18} />{preview ? 'Stop' : 'Preview'}</button>}
      </div>
      {BEDS.map((b) => {
        const v = save.mix[b.id];
        return (
          <div key={b.id} className={`bed ${v > 0 ? 'on' : ''}`} style={{ ['--v' as string]: v }}>
            <span className="bed-ic"><Icon name={b.icon} size={24} /></span>
            <div className="bed-main">
              <div className="bed-top"><b>{b.name}</b><small>{v ? `${Math.round(v * 100)}%` : 'Off'}</small></div>
              <input type="range" min={0} max={100} step={5} value={Math.round(v * 100)} aria-label={`${b.name} volume`}
                onChange={(e) => set((s) => ({ ...s, mix: { ...s.mix, [b.id]: +e.target.value / 100 } }))} onPointerUp={() => tap()} />
              <small className="bed-hint">{b.hint}</small>
            </div>
          </div>
        );
      })}
      <Label>Presets</Label>
      <div className="presets">
        {([['Seaside', { ocean: 0.7, rain: 0, brown: 0.15 }], ['Rainy night', { ocean: 0, rain: 0.6, brown: 0.35 }], ['Deep focus', { ocean: 0, rain: 0, brown: 0.65 }], ['Silence', { ocean: 0, rain: 0, brown: 0 }]] as [string, Mix][]).map(([n, m]) => (
          <button key={n} onClick={() => { tap(); set((s) => ({ ...s, mix: m })); if (n === 'Silence') setPreview(false); }}>{n}</button>
        ))}
      </div>
      <p className="note-plain">Every sound is generated on your phone; nothing is downloaded. Headphones make the rain sound best.</p>
    </div>
  );
}

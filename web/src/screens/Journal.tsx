import { useMemo } from 'react';
import { Lottie } from '../lottie/Lottie';
import { PALETTES, emptyRest } from '../lottie/scenes';
import { PATTERNS, streak, total, week } from '../lib/breath';
import { Icon } from '../ui/icons';
import { Label, useApp } from '../ui/kit';

const nameOf = (id: string) => (id === 'custom' ? 'Your pattern' : PATTERNS.find((p) => p.id === id)?.name ?? 'Breathing');
const mins = (sec: number) => (sec < 60 ? `${Math.round(sec)} s` : `${Math.round(sec / 60)} min`);

export default function Journal() {
  const { save, settings, tap, go } = useApp();
  const restArt = useMemo(() => emptyRest(PALETTES[settings.theme]), [settings.theme]);
  const now = new Date();
  const days = week(save.log, now);
  const weekSec = days.reduce((a, d) => a + d.sec, 0);
  const top = Math.max(300, ...days.map((d) => d.sec));
  const st = streak(save.log, now);
  const recent = [...save.log].reverse().slice(0, 30);
  return (
    <div className="page-scroll journal">
      <div className="stats">
        <span className="stat lead"><Icon name="flame" size={20} /><b>{st}</b><small>day streak</small></span>
        <span className="stat"><b>{Math.round(weekSec / 60)}</b><small>min this week</small></span>
        <span className="stat"><b>{save.log.length}</b><small>sessions</small></span>
      </div>
      <div className="week">
        {days.map((d, i) => (
          <div key={d.key} className={`wd ${i === 6 ? 'today' : ''} ${d.sec ? 'hit' : ''}`}>
            <span><i style={{ height: `${Math.max(d.sec ? 8 : 0, (d.sec / top) * 100)}%` }} /></span>
            <small>{d.day.toLocaleDateString('en-GB', { weekday: 'narrow' })}</small>
          </div>
        ))}
      </div>
      <Label right={<small className="lbl-r">{mins(total(save.log))} in all</small>}>Sessions</Label>
      {recent.length ? (
        <div className="list">
          {recent.map((e) => (
            <div key={e.at} className="entry">
              <i className="e-dot" />
              <span><b>{nameOf(e.pattern)}</b><small>{new Date(e.at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · {new Date(e.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</small></span>
              <em>{mins(e.sec)}</em>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty"><Lottie data={restArt} className="empty-art" label="A softly glowing orb rising and falling" still={0.4} /><p>Your sessions will gather here. Even one minute a day adds up.</p><button className="ctl main small" onClick={() => { tap(); go('breathe'); }}><Icon name="play" size={18} />First session</button></div>
      )}
    </div>
  );
}

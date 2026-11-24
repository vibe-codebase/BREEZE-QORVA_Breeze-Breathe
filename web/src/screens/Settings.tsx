import { defaults, MINUTES } from '../lib/store';
import { Icon, Mark } from '../ui/icons';
import { APP } from '../app-info';
import { Label, Segmented, Toggle, useApp } from '../ui/kit';

export const THEMES = [{ id: 'dusk', bg: '#0f1a24', dark: true }, { id: 'dawn', bg: '#f4eff6', dark: false }] as const;

export default function Settings() {
  const { save, settings, set, tap, confirm, toast, run, finish, go, tour } = useApp();
  const sset = (q: Partial<typeof settings>) => { tap(); set((s) => ({ ...s, settings: { ...s.settings, ...q } })); };
  return (
    <div className="page-scroll settings">
      <Label>Session</Label>
      <div className="card">
        <div className="row col"><span className="row-text"><b>Length</b><small>Rounded to whole breaths</small></span>
          <Segmented value={settings.minutes} onChange={(minutes) => sset({ minutes })} options={MINUTES.map((m) => ({ v: m, label: `${m}` }))} />
        </div>
        <Toggle on={settings.chime} onChange={(v) => sset({ chime: v })} label="Bell between phases" hint="Higher as you breathe in, lower as you breathe out" />
        <Toggle on={settings.haptics} onChange={(v) => sset({ haptics: v })} label="Vibration" hint="A tap at each phase, so you can close your eyes" />
        <Toggle on={settings.reduceMotion} onChange={(v) => sset({ reduceMotion: v })} label="Reduce motion" hint="Animations hold still and screens change without moving" />
        <Toggle on={settings.awake} onChange={(v) => sset({ awake: v })} label="Keep screen on" hint="Only while a session is running" />
      </div>
      <Label>Help and info</Label>
      <div className="card">
        <button className="row" onClick={() => { tap(); tour(); }}><span className="row-text"><b>Show the welcome tour</b><small>Three quick cards about what {APP.name} does</small></span><Icon name="right" /></button>
        <button className="row" onClick={() => { tap(); go('about'); }}><span className="row-text"><b>About and privacy</b><small>Version, maker and the privacy policy</small></span><Icon name="right" /></button>
      </div>
      <Label>App</Label>
      <div className="card">
        <div className="row col"><span className="row-text"><b>Look</b></span>
          <Segmented value={settings.theme} onChange={(theme) => sset({ theme })} options={[{ v: 'dusk', label: 'Dusk (dark)' }, { v: 'dawn', label: 'Dawn (light)' }]} />
        </div>
        <button className="row danger" disabled={!save.log.length} onClick={() => confirm({ title: 'Clear the journal?', body: `All ${save.log.length} sessions and your streak will be removed.`, action: 'Clear', onYes: () => { set((s) => ({ ...s, log: [] })); toast('Journal cleared'); } })}>
          <span className="row-text"><b>Clear journal</b><small>{save.log.length} sessions</small></span><Icon name="trash" />
        </button>
        <button className="row danger" onClick={() => confirm({ title: `Reset ${APP.name}?`, body: 'Settings, your pattern, sound mix and journal all go back to the start.', action: 'Reset', onYes: () => { if (run) finish(); set(() => { const d = defaults(); return { ...d, settings: { ...d.settings, toured: true } }; }); toast('Everything reset'); } })}>
          <span className="row-text"><b>Reset everything</b><small>Settings, patterns, sounds and journal</small></span><Icon name="trash" />
        </button>
      </div>
      <div className="about"><Mark size={46} /><b>{APP.name} {APP.version}</b>
        {APP.company && <small className="maker">{APP.company}</small>}<p>Paced breathing with a calm orb, gentle bells and sounds made on your phone. Not a medical treatment; stop if you feel light-headed. Everything stays on this phone.</p></div>
    </div>
  );
}

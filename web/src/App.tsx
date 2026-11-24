import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { haptic, onNative, toNative } from './bridge';
import { phaseAt, sessionSeconds } from './lib/breath';
import { chime, resume as audioResume, setMix, suspend } from './lib/sound';
import { load, persist, timingOf, type Save } from './lib/store';
import { Icon, Mark } from './ui/icons';
import { AppCtx, elapsed, useApp, useBack, type AppApi, type Done, type Page, type Run } from './ui/kit';
import Breathe from './screens/Breathe';
import Patterns from './screens/Patterns';
import Sounds from './screens/Sounds';
import Journal from './screens/Journal';
import Settings, { THEMES } from './screens/Settings';
import About from './screens/About';
import Welcome from './screens/Welcome';
import { APP } from './app-info';
import { Burst } from './ui/Burst';
import { PALETTES, success } from './lottie/scenes';

const TABS: { id: Page; label: string; icon: string }[] = [
  { id: 'breathe', label: 'Breathe', icon: 'orb' }, { id: 'patterns', label: 'Patterns', icon: 'wave' },
  { id: 'sounds', label: 'Sounds', icon: 'note' }, { id: 'journal', label: 'Journal', icon: 'book' },
];
const TITLES: Record<Page, string> = { breathe: APP.name, patterns: 'Patterns', sounds: 'Sounds', journal: 'Journal', settings: 'Settings', about: 'About' };
type Confirm = { title: string; body: string; action: string; danger?: boolean; onYes: () => void };
/** Sessions shorter than this aren't worth a journal line. */
const MIN_LOG = 20;

export default function App() {
  const [save, setSave] = useState<Save>(load);
  const [page, setPage] = useState<Page>('breathe');
  const [tab, setTab] = useState<Page>('breathe');
  const [ask, setAsk] = useState<Confirm | null>(null);
  const [touring, setTouring] = useState(() => !save.settings.toured);
  const [party, setParty] = useState<{ line: string; n: number } | null>(null);
  const [toastMsg, setToast] = useState<{ text: string; n: number } | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const [preview, setPreview] = useState(false);
  const backs = useRef<(() => void)[]>([]);
  const ref = useRef(save); ref.current = save;
  const runRef = useRef(run); runRef.current = run;
  const settings = save.settings;
  useEffect(() => { const t = setTimeout(() => persist(save), 250); return () => clearTimeout(t); }, [save]);
  useEffect(() => {
    const t = THEMES.find((x) => x.id === settings.theme) ?? THEMES[0];
    document.documentElement.dataset.theme = t.id;
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', t.bg);
    toNative({ type: 'chrome', bg: t.bg, dark: t.dark });
  }, [settings.theme]);
  const tap = useCallback((k: 'light' | 'medium' | 'success' = 'light') => haptic(k, ref.current.settings.haptics), []);
  const toast = useCallback((text: string) => setToast((t) => ({ text, n: (t?.n ?? 0) + 1 })), []);
  useEffect(() => { document.documentElement.dataset.motion = settings.reduceMotion ? 'reduce' : 'full'; }, [settings.reduceMotion]);
  useEffect(() => { if (!party) return; const t = setTimeout(() => setParty(null), 1750); return () => clearTimeout(t); }, [party]);
  useEffect(() => { if (!toastMsg) return; const t = setTimeout(() => setToast(null), 1900); return () => clearTimeout(t); }, [toastMsg]);
  const pushBack = useCallback((fn: () => void) => { backs.current.push(fn); return () => { backs.current = backs.current.filter((f) => f !== fn); }; }, []);
  const go = useCallback((p: Page) => { setPage(p); if (p !== 'settings' && p !== 'about') setTab(p); }, []);

  // ---------- the session ----------
  const playing = !!run && run.since !== null;
  const end = useCallback((r: Run, sec: number) => {
    setRun(null);
    if (sec >= MIN_LOG) {
      setSave((s) => ({ ...s, log: [...s.log, { at: Date.now(), sec: Math.round(sec), pattern: r.pattern }].slice(-500) }));
      setDone({ sec, name: r.name });
      haptic('success', ref.current.settings.haptics);
      setParty((p) => ({ line: 'Logged in your journal', n: (p?.n ?? 0) + 1 }));
    } else toast('Too short to log');
  }, [toast]);
  const begin = useCallback(() => {
    const { name, t } = timingOf(ref.current);
    setDone(null);
    setRun({ name, t, pattern: ref.current.pattern, total: sessionSeconds(t, ref.current.settings.minutes), base: 0, since: performance.now() });
    haptic('medium', ref.current.settings.haptics);
    if (ref.current.settings.chime) chime('in');
  }, []);
  const pause = useCallback(() => setRun((r) => (r && r.since !== null ? { ...r, base: elapsed(r), since: null } : r)), []);
  const resume = useCallback(() => { audioResume(); setRun((r) => (r && r.since === null ? { ...r, since: performance.now() } : r)); }, []);
  const finish = useCallback(() => { const r = runRef.current; if (r) end(r, Math.min(r.total, elapsed(r))); }, [end]);
  // phase cues and the end of the session, checked ten times a second
  const lastStep = useRef(0);
  useEffect(() => {
    if (!run || run.since === null) return;
    lastStep.current = phaseAt(run.t, elapsed(run)).step;
    const id = setInterval(() => {
      const r = runRef.current; if (!r || r.since === null) return;
      const el = elapsed(r);
      if (el >= r.total) { end(r, r.total); return; }
      const ph = phaseAt(r.t, el);
      if (ph.step !== lastStep.current) {
        lastStep.current = ph.step;
        const s = ref.current.settings;
        if (s.chime) chime(ph.kind);
        haptic(ph.kind === 'in' ? 'medium' : 'light', s.haptics);
      }
    }, 100);
    return () => clearInterval(id);
  }, [run, end]);
  useEffect(() => { setMix(save.mix, playing || preview); }, [save.mix, playing, preview]);
  useEffect(() => { toNative({ type: 'keepAwake', on: playing && settings.awake }); }, [playing, settings.awake]);

  const pageRef = useRef(page); pageRef.current = page;
  const tabRef = useRef(tab); tabRef.current = tab;
  useEffect(() => onNative((e) => {
    if (e.type === 'native.lifecycle') { window.dispatchEvent(new Event(e.state === 'background' ? 'app:pause' : 'app:resume'));
      if (e.state === 'background') { persist(ref.current); pause(); setPreview(false); suspend(); } else audioResume();
      return;
    }
    const top = backs.current[backs.current.length - 1];
    if (top) { top(); return; }
    if (runRef.current?.since != null) { pause(); return; }
    if (pageRef.current === 'about') setPage('settings');
    else if (pageRef.current === 'settings') setPage(tabRef.current);
    else if (pageRef.current !== 'breathe') { setPage('breathe'); setTab('breathe'); }
    else setAsk({ title: `Leave ${APP.name}?`, body: 'Your journal and settings stay on this phone.', action: 'Leave', danger: false, onYes: () => toNative({ type: 'exit' }) });
  }), [pause]);
  useEffect(() => {
    const h = () => { if (document.hidden) { pause(); setPreview(false); } };
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, [pause]);

  const api: AppApi = useMemo(() => ({
    save, settings, tap, go, pushBack, toast, set: (fn) => setSave((s) => fn(s)), confirm: (o) => { tap(); setAsk(o); },
    tour: () => setTouring(true),
    celebrate: (line) => { haptic('success', ref.current.settings.haptics); setParty((p) => ({ line, n: (p?.n ?? 0) + 1 })); },
    run, done, begin, pause, resume, finish, closeDone: () => setDone(null), preview, setPreview,
  }), [save, settings, tap, go, pushBack, toast, run, done, begin, pause, resume, finish, preview]);
  const sub = page === 'settings' || page === 'about';
  const art = useMemo(() => success(PALETTES[settings.theme]), [settings.theme]);
  const endTour = () => { setTouring(false); setSave((s) => (s.settings.toured ? s : { ...s, settings: { ...s.settings, toured: true } })); };
  const Screen = { breathe: Breathe, patterns: Patterns, sounds: Sounds, journal: Journal, settings: Settings, about: About }[page];
  const focus = playing && page === 'breathe';
  return (
    <AppCtx.Provider value={api}>
      <div className={`app ${focus ? 'focus' : ''}`}>
        <div className="sky" aria-hidden="true"><i /><i /><i /></div>
        <header className="top">
          {sub ? <button className="icon-btn" onClick={() => go(page === 'about' ? 'settings' : tab)} aria-label="Back"><Icon name="back" /></button> : <span className="mark"><Mark /></span>}
          <h1>{TITLES[page]}</h1>
          {!sub && <button className="icon-btn" onClick={() => { tap(); go('settings'); }} aria-label="Settings"><Icon name="gear" /></button>}
        </header>
        <main className="stage" key={page}><Screen /></main>
        {!sub && (
          <nav className="tabs" style={{ ['--i' as string]: TABS.findIndex((t) => t.id === tab) }}>
            <span className="tab-pill" />
            {TABS.map((t) => <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => { if (tab !== t.id) tap(); go(t.id); }}>
              <Icon name={t.icon} size={22} /><span>{t.label}</span>{t.id === 'breathe' && run && tab !== 'breathe' && <em className="live" />}
            </button>)}
          </nav>
        )}
        {toastMsg && <div className="toast" key={toastMsg.n}>{toastMsg.text}</div>}
        {party && <Burst key={party.n} art={art} line={party.line} />}
        {ask && <ConfirmCard c={ask} onClose={() => setAsk(null)} />}
        {touring && <Welcome onDone={endTour} />}
      </div>
    </AppCtx.Provider>
  );
}
function ConfirmCard({ c, onClose }: { c: Confirm; onClose: () => void }) {
  const { tap } = useApp();
  useBack(true, onClose);
  return (
    <div className="confirm-wrap"><div className="scrim" onClick={onClose} />
      <div className="confirm" role="alertdialog" aria-label={c.title}><h3>{c.title}</h3><p>{c.body}</p>
        <div className="confirm-actions"><button className="btn" onClick={() => { tap(); onClose(); }}>Cancel</button><button className={`btn ${c.danger === false ? 'go' : 'danger'}`} onClick={() => { tap('medium'); c.onYes(); onClose(); }}>{c.action}</button></div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';
import type { Anim } from './build';

/** Is motion allowed? Off when the system asks for less motion or the app's Reduce motion setting is on (html[data-motion=reduce]). */
export function motionOn(): boolean {
  try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false; } catch { /* old WebView */ }
  return document.documentElement.dataset.motion !== 'reduce';
}
/** Plays one of the app's generated animations with the light SVG player, only while it is on screen and the app is in front.
 *  With reduced motion it shows a still frame (`still` is where in the animation, 0..1). */
export function Lottie({ data, loop = true, className, label, still = 0.5, motion }: { data: Anim; loop?: boolean; className?: string; label?: string; still?: number; motion?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const moving = motion ?? motionOn();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const a = lottie.loadAnimation({ container: el, renderer: 'svg', loop, autoplay: false, animationData: structuredClone(data), rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } });
    let onScreen = true, away = false;
    const sync = () => {
      if (!moving) { a.goToAndStop(Math.floor((data.op - 1) * still), true); return; }
      if (onScreen && !away && !document.hidden) a.play(); else a.pause();
    };
    const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }) : null;
    io?.observe(el);
    const pause = () => { away = true; sync(); };
    const resume = () => { away = false; sync(); };
    window.addEventListener('app:pause', pause);
    window.addEventListener('app:resume', resume);
    document.addEventListener('visibilitychange', sync);
    a.addEventListener('DOMLoaded', sync);
    sync();
    return () => {
      io?.disconnect();
      window.removeEventListener('app:pause', pause);
      window.removeEventListener('app:resume', resume);
      document.removeEventListener('visibilitychange', sync);
      a.destroy();
    };
  }, [data, loop, moving, still]);
  return <div ref={ref} className={`lottie ${className ?? ''}`} role="img" aria-label={label} />;
}

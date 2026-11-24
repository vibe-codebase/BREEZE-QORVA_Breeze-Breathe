type ToNative =
  | { type: 'haptic'; style: 'light' | 'medium' | 'success' | 'warning' }
  | { type: 'exit' }
  | { type: 'chrome'; bg: string; dark: boolean }
  | { type: 'keepAwake'; on: boolean };
declare global { interface Window { ReactNativeWebView?: { postMessage(m: string): void } } }

export function toNative(m: ToNative) {
  try { window.ReactNativeWebView?.postMessage(JSON.stringify(m)); } catch { /* not inside the Android shell */ }
}
export function haptic(style: 'light' | 'medium' | 'success' | 'warning', enabled: boolean) {
  if (!enabled) return;
  if (window.ReactNativeWebView) toNative({ type: 'haptic', style });
  else navigator.vibrate?.(style === 'light' ? 6 : style === 'medium' ? 16 : 28);
}
export type NativeEvent = { type: 'native.back' } | { type: 'native.lifecycle'; state: 'active' | 'background' };
export function onNative(fn: (e: NativeEvent) => void) {
  const h = (ev: MessageEvent) => {
    try { const d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data; if (d && typeof d.type === 'string' && d.type.startsWith('native.')) fn(d); } catch { /* ignore */ }
  };
  window.addEventListener('message', h);
  document.addEventListener('message' as never, h as never);
  return () => { window.removeEventListener('message', h); document.removeEventListener('message' as never, h as never); };
}

/** Repeating buzz while a timer rings: the shell has no pattern API, so pulse it from here. */
export function buzz(enabled: boolean) { haptic('warning', enabled); }

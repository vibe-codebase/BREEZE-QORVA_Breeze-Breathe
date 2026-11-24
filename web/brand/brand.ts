// Store art for Breathe: a glowing teal-to-lilac orb inside soft breath rings, on a night sky.
const APP = (window as unknown as { APP?: { name: string; company: string } }).APP ?? { name: 'Breathe', company: '' };
const BG1 = '#18293a', BG2 = '#0b131c', TEAL = '#5fd4c4', LILAC = '#b9a3f0', INK = '#eaf2f5';
function canvas(w: number, h: number) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')!] as const; }
function sky(g: CanvasRenderingContext2D, w: number, h: number) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, BG1); gr.addColorStop(1, BG2); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (const [x, y, r, c] of [[0.15, 0.1, 0.7, 'rgba(95,212,196,.16)'], [0.95, 0.55, 0.8, 'rgba(185,163,240,.18)']] as const) {
    const s = Math.max(w, h), gl = g.createRadialGradient(w * x, h * y, 0, w * x, h * y, s * r); gl.addColorStop(0, c); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
  }
}
function orb(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, rings = true) {
  if (rings) {
    g.save(); g.lineWidth = r * 0.025;
    [1.55, 1.3].forEach((k, i) => { g.strokeStyle = i ? 'rgba(185,163,240,.38)' : 'rgba(234,242,245,.16)'; g.beginPath(); g.arc(cx, cy, r * k, 0, Math.PI * 2); g.stroke(); });
    g.strokeStyle = TEAL; g.lineCap = 'round'; g.lineWidth = r * 0.045; g.beginPath(); g.arc(cx, cy, r * 1.55, -Math.PI / 2, -Math.PI / 2 + Math.PI * 0.7); g.stroke();
    g.restore();
  }
  const halo = g.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.45); halo.addColorStop(0, 'rgba(95,212,196,.45)'); halo.addColorStop(1, 'rgba(95,212,196,0)');
  g.fillStyle = halo; g.beginPath(); g.arc(cx, cy, r * 1.45, 0, Math.PI * 2); g.fill();
  const body = g.createRadialGradient(cx - r * 0.3, cy - r * 0.4, r * 0.05, cx, cy, r);
  body.addColorStop(0, '#d8fbf5'); body.addColorStop(0.38, TEAL); body.addColorStop(1, LILAC);
  g.fillStyle = body; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  const rim = g.createRadialGradient(cx, cy + r * 0.3, r * 0.4, cx, cy + r * 0.2, r * 1.05); rim.addColorStop(0, 'rgba(185,163,240,0)'); rim.addColorStop(1, 'rgba(140,110,220,.55)');
  g.fillStyle = rim; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
}
async function icon() { const [c, g] = canvas(1024, 1024); sky(g, 1024, 1024); orb(g, 512, 512, 215); return c; }
async function adaptive() { const [c, g] = canvas(1024, 1024); orb(g, 512, 512, 170); return c; }
async function adaptiveBg() { const [c, g] = canvas(1024, 1024); sky(g, 1024, 1024); return c; }
async function splash() {
  const W = 1242, H = 2688; const [c, g] = canvas(W, H); sky(g, W, H);
  orb(g, W / 2, H * 0.4, 230);
  g.textAlign = 'center'; g.fillStyle = INK; g.font = '400 190px "Instrument Serif"'; g.fillText(APP.name, W / 2, H * 0.4 + 560);
  g.fillStyle = 'rgba(234,242,245,.7)'; g.font = '600 44px Onest'; g.fillText('In · Hold · Out', W / 2, H * 0.4 + 640);
  return c;
}

/** Draws the app name, shrinking the font until it fits maxW (long company + tool names). */
function fitName(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number) {
  const base = g.font; let px = Number(/(\d+)px/.exec(base)?.[1] ?? 80);
  while (g.measureText(text).width > maxW && px > 28) { px -= 2; g.font = base.replace(/\d+px/, `${px}px`); }
  g.fillText(text, x, y);
}

async function feature() {
  const W = 1024, H = 500; const [c, g] = canvas(W, H); sky(g, W, H);
  orb(g, 770, 250, 120);
  g.textAlign = 'left'; g.fillStyle = INK; g.font = '400 130px "Instrument Serif"'; fitName(g, APP.name, 56, 220, 560);
  const rule = g.createLinearGradient(60, 0, 140, 0); rule.addColorStop(0, TEAL); rule.addColorStop(1, LILAC); g.fillStyle = rule; g.fillRect(60, 250, 80, 6);
  g.fillStyle = INK; g.font = '600 30px Onest'; g.fillText('Slow down in a minute.', 56, 315);
  g.fillStyle = 'rgba(234,242,245,.7)'; g.font = '600 20px Onest'; g.fillText('Box · 4-7-8 · Coherent · Sounds · Journal', 56, 355);
  return c;
}
(window as unknown as { brand: object }).brand = { icon, adaptive, adaptiveBg, splash, feature };

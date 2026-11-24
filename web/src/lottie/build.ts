/** Tiny typed builders for Lottie (bodymovin v5) JSON: shape layers, groups, keyframes. Everything the app animates is generated here. */

export type Num = number | number[];
export type Ease = { o: [number, number]; i: [number, number] };
export type Key = { t: number; v: Num; e?: Ease; hold?: boolean };
type Prop = { a: 0; k: Num } | { a: 1; k: object[] };
type Obj = Record<string, unknown>;

export const EASE = {
  out: { o: [0.16, 1], i: [0.3, 1] } as Ease,
  inOut: { o: [0.65, 0], i: [0.35, 1] } as Ease,
  in: { o: [0.55, 0], i: [1, 1] } as Ease,
  lin: { o: [0, 0], i: [1, 1] } as Ease,
  back: { o: [0.34, 1.56], i: [0.64, 1] } as Ease,
};

const arr = (v: Num) => (Array.isArray(v) ? v : [v]);
/** A static value or a keyframed track. Keys must be in time order. */
export function prop(v: Num | Key[]): Prop {
  if (!Array.isArray(v) || typeof v[0] === 'number') return { a: 0, k: v as Num };
  const keys = v as Key[];
  return {
    a: 1,
    k: keys.map((k, i) => {
      const last = i === keys.length - 1;
      const e = k.e ?? EASE.inOut;
      const kf: Obj = { t: k.t, s: arr(k.v) };
      if (k.hold) kf.h = 1;
      else if (!last) { kf.o = { x: [e.o[0]], y: [e.o[1]] }; kf.i = { x: [e.i[0]], y: [e.i[1]] }; }
      return kf;
    }),
  };
}
/** Hex colour to Lottie's 0..1 RGBA. */
export function rgb(hex: string): number[] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1].map((x) => Math.round(x * 1000) / 1000);
}

export type Tr = { p?: Num | Key[]; a?: Num | Key[]; s?: Num | Key[]; r?: Num | Key[]; o?: Num | Key[] };
export function tr(t: Tr = {}): Obj {
  return { ty: 'tr', p: prop(t.p ?? [0, 0]), a: prop(t.a ?? [0, 0]), s: prop(t.s ?? [100, 100]), r: prop(t.r ?? 0), o: prop(t.o ?? 100), sk: prop(0), sa: prop(0), nm: 'Transform' };
}
export const rect = (x: number, y: number, w: number, h: number, r = 0): Obj => ({ ty: 'rc', d: 1, p: prop([x, y]), s: prop([w, h]), r: prop(r), nm: 'Rect' });
export const ellipse = (x: number, y: number, w: number, h = w): Obj => ({ ty: 'el', d: 1, p: prop([x, y]), s: prop([w, h]), nm: 'Ellipse' });
/** A path through the points; straight segments unless in/out tangents (relative to each vertex) are given.
 *  Every array is fresh: the player rewrites tangents in place, so shared arrays would bend the lines. */
export function path(pts: number[][], closed = false, tin?: number[][], tout?: number[][]): Obj {
  const fresh = (t: number[][] | undefined) => pts.map((_, i) => [...(t?.[i] ?? [0, 0])]);
  return { ty: 'sh', ks: { a: 0, k: { i: fresh(tin), o: fresh(tout), v: pts.map((p) => [...p]), c: closed } }, nm: 'Path' };
}
export const fill = (hex: string, o: Num | Key[] = 100): Obj => ({ ty: 'fl', c: prop(rgb(hex)), o: prop(o), r: 1, nm: 'Fill' });
export const stroke = (hex: string, w: number, o: Num | Key[] = 100): Obj => ({ ty: 'st', c: prop(rgb(hex)), o: prop(o), w: prop(w), lc: 2, lj: 2, ml: 4, nm: 'Stroke' });
export const trim = (e: Num | Key[], s: Num | Key[] = 0): Obj => ({ ty: 'tm', s: prop(s), e: prop(e), o: prop(0), m: 1, nm: 'Trim' });
export const group = (nm: string, items: Obj[], t: Tr = {}): Obj => ({ ty: 'gr', nm, it: [...items, tr(t)] });

export type Layer = { nm: string; shapes: Obj[]; t?: Tr; ip?: number; op?: number };
export type Anim = { v: string; fr: number; ip: number; op: number; w: number; h: number; nm: string; ddd: 0; assets: []; layers: Obj[] };
/** Assemble an animation. Layers are listed top first, like After Effects. */
export function anim(nm: string, w: number, h: number, op: number, layers: Layer[]): Anim {
  return {
    v: '5.9.0', fr: 60, ip: 0, op, w, h, nm, ddd: 0, assets: [],
    layers: layers.map((l, i) => ({
      ddd: 0, ind: i + 1, ty: 4, nm: l.nm, sr: 1, ao: 0, bm: 0, st: 0, ip: l.ip ?? 0, op: l.op ?? op,
      ks: { o: prop(l.t?.o ?? 100), r: prop(l.t?.r ?? 0), p: prop(l.t?.p ?? [0, 0, 0]), a: prop(l.t?.a ?? [0, 0, 0]), s: prop(l.t?.s ?? [100, 100, 100]) },
      shapes: l.shapes,
    })),
  };
}

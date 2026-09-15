/** Pure mathematics. No DOM, no sampling-based truth claims. */
export const TAU = 2 * Math.PI;
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const radius = (x, y) => Math.hypot(x, y);

/** F(0,0)=0 is an extension, not its limit. Avoids x^4 underflow. */
export function limitFunction(x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return NaN;
  if (x === 0 && y === 0) return 0;
  const a = x * x;
  const scale = Math.max(Math.abs(a), Math.abs(y));
  if (scale === 0 || !Number.isFinite(scale)) return NaN;
  const u = a / scale;
  const v = y / scale;
  return (u * v) / (u * u + v * v);
}

/** Parametrizations, not equal-arclength paths. t is signed and nonzero in UI. */
export function pathPoint(kind, k, t) {
  if (kind === 'vertical') return { x: 0, y: t };
  if (kind === 'parabola') return { x: t, y: k * t * t };
  return { x: t, y: k * t };
}
export function pathValue(kind, k, t) {
  if (t === 0) return 0; // value at origin only; never used as a path limit
  if (kind === 'vertical' || k === 0) return 0;
  if (kind === 'parabola') return k / (1 + k * k);
  // Equivalent to k*t/(t*t+k*k); stable throughout the supported parameter range.
  const s = Math.max(Math.abs(k), Math.abs(t));
  return ((k / s) * (t / s)) / ((k / s) ** 2 + (t / s) ** 2);
}
export const pathLimit = (kind, k) => kind === 'parabola' ? k / (1 + k * k) : 0;
export const smoothFunction = (x, y) => x * x + y * y;
/** G is continuous at the origin; both partials there are zero. */
export function counterFunction(x, y) {
  const r = radius(x, y);
  return r === 0 ? 0 : (x / r) * y;
}
export function directionPoint(rho, degrees) {
  const theta = degrees * Math.PI / 180;
  return { x: rho * Math.cos(theta), y: rho * Math.sin(theta) };
}
export function remainder(model, rho, degrees) {
  if (rho < 0 || !Number.isFinite(rho)) return NaN;
  if (model === 'smooth') return rho * rho;
  const theta = degrees * Math.PI / 180;
  return rho * Math.abs(Math.cos(theta) * Math.sin(theta));
}
/** Defined only at nonzero displacement. Candidate derivative L=0 for both. */
export function normalizedError(model, rho, degrees) {
  if (!(rho > 0)) return NaN;
  if (model === 'smooth') return rho;
  const theta = degrees * Math.PI / 180;
  return Math.abs(Math.cos(theta) * Math.sin(theta));
}
/** Analytic supremum over the circle, NOT estimated from plotted angles. */
export function worstError(model, rho) {
  if (!(rho > 0)) return NaN;
  return model === 'smooth' ? rho : 0.5;
}
export function samplePath(kind, k, { count = 161, bound = 1 } = {}) {
  return Array.from({ length: count }, (_, i) => {
    const t = bound * (2 * i / (count - 1) - 1);
    return { t, ...pathPoint(kind, k, t), value: pathValue(kind, k, t) };
  });
}
export const format = (value, digits = 4) => {
  if (!Number.isFinite(value)) return '未定义';
  if (Math.abs(value) < 1e-14) return '0';
  if (Math.abs(value) < 0.001) { const [a, b] = value.toExponential(2).split('e'); const superscripts = {'-':'⁻','+':'','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'}; return `${Number(a)} × 10${[...b].map(c => superscripts[c]).join('')}`; }
  return Number(value.toFixed(digits)).toString();
};
export function limitRows(state, n = 101) {
  return Array.from({ length: n }, (_, i) => {
    const q = 4 * i / (n - 1);
    const t = state.sign * 10 ** -q;
    const p = pathPoint(state.path, state.k, t);
    return { q, t, ...p, radius: radius(p.x, p.y), value: pathValue(state.path, state.k, t) };
  });
}
export function diffRows(state, n = 101) {
  return Array.from({ length: n }, (_, i) => {
    const q = 4 * i / (n - 1), rho = 10 ** -q;
    return { q, rho, smoothRaw: remainder('smooth', rho, state.angle), counterRaw: remainder('counter', rho, state.angle), smoothRatio: normalizedError('smooth', rho, state.angle), counterRatio: normalizedError('counter', rho, state.angle), smoothWorst: worstError('smooth', rho), counterWorst: worstError('counter', rho) };
  });
}

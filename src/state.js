import { seriesDefaults, parseSeriesState, serializeSeriesState } from './series-state.js';
import { taylorDefaults, parseTaylorState, serializeTaylorState } from './taylor-state.js';
import { completenessDefaults, parseCompletenessState, serializeCompletenessState } from './completeness-state.js';
import { parseRelationsState, serializeRelationsState } from './relations-state.js';
import { fieldDefaults, parseFieldState, serializeFieldState } from './field-state.js';
import { clamp } from './math.js';
export function defaults(lab = 'limits') {
  if(lab === 'series') return seriesDefaults();
  if(lab === 'taylor') return taylorDefaults();
  if(lab === 'completeness') return completenessDefaults();
  if(lab === 'fields') return fieldDefaults();
  return { lab, tab: 'explore', path: 'line', k: 1, q: 0.65, sign: 1, zoom: false, view: lab === 'limits' ? 'plane' : 'surface', model: 'counter', angle: 45, metric: 'ratio', pins: [] };
}
const pick = (value, options, fallback) => options.includes(value) ? value : fallback;
const num = (value, fallback, min, max) => value === null || value.trim() === '' || !Number.isFinite(Number(value)) ? fallback : clamp(Number(value), min, max);
export function parseState(hash) {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  if(p.get('lab') === 'series') return parseSeriesState(p);
  if(p.get('lab') === 'taylor') return parseTaylorState(p);
  if(p.get('lab') === 'completeness') return parseCompletenessState(p);
  if(p.get('lab') === 'fields') return parseFieldState(p);
  if(p.get('lab') === 'differentiability' && p.get('mode') === 'relations') return parseRelationsState(p);
  const s = defaults(pick(p.get('lab'), ['limits', 'differentiability'], 'limits'));
  s.tab = pick(p.get('tab'), ['explore', 'proof', 'quiz'], s.tab);
  s.path = pick(p.get('path'), ['line', 'parabola', 'vertical'], s.path);
  s.k = num(p.get('k'), s.k, -3, 3);
  s.q = num(p.get('q'), s.q, 0, 4);
  s.sign = p.get('sign') === '-1' ? -1 : 1;
  s.zoom = p.get('zoom') === '1';
  s.view = pick(p.get('view'), ['plane', 'surface', 'polar'], s.view);
  if (s.lab === 'limits' && s.view === 'polar') s.view = 'plane';
  if (s.lab === 'differentiability' && s.view === 'plane') s.view = 'surface';
  s.model = pick(p.get('model'), ['smooth', 'counter'], s.model);
  s.angle = num(p.get('angle'), s.angle, 0, 360);
  s.metric = pick(p.get('metric'), ['raw', 'ratio'], s.metric);
  const pins = p.get('pins');
  if (pins) {
    s.pins = pins.split(';').slice(0, 4).map(item => {
      const [path, k] = item.split(':');
      return { path: pick(path, ['line', 'parabola', 'vertical'], 'line'), k: num(k ?? null, 1, -3, 3) };
    });
  }
  return s;
}
export function serializeState(s) {
  if(s.lab === 'series') return serializeSeriesState(s);
  if(s.lab === 'taylor') return serializeTaylorState(s);
  if(s.lab === 'completeness') return serializeCompletenessState(s);
  if(s.lab === 'fields') return serializeFieldState(s);
  if(s.mode === 'relations') return serializeRelationsState(s);
  const p = new URLSearchParams({ lab: s.lab, tab: s.tab, q: s.q.toFixed(3), view: s.view });
  if (s.lab === 'limits') {
    p.set('path', s.path); p.set('k', String(s.k)); p.set('sign', String(s.sign));
    if (s.zoom) p.set('zoom', '1');
    if (s.pins.length) p.set('pins', s.pins.map(p => `${p.path}:${p.k}`).join(';'));
  } else {
    p.set('model', s.model); p.set('angle', String(s.angle)); p.set('metric', s.metric);
    if (s.zoom) p.set('zoom', '1');
  }
  return '#' + p.toString();
}

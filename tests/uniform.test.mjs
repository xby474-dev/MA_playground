import test from 'node:test';
import assert from 'node:assert/strict';
import { uniformPage } from '../src/uniform-content.js';
import { uniformDefaults, parseUniformState, serializeUniformState, applyUniformScenario, ufRoutes } from '../src/uniform-state.js';
import { ufFamilies, ufDomain, ufPartial, ufLimit, ufError, ufNorm, ufTruth, ufCertificate, ufIntegral, ufDerivativeBound, ufCSV } from '../src/uniform-math.js';
import { ufGraphSVG, ufMainSVG, ufErrorSVG, ufHistorySVG, ufDerivativeSVG, ufBudgetSVG, ufMiniSVG } from '../src/uniform-plots.js';

const state = (overrides = {}) => ({ ...uniformDefaults(), ...overrides });

test('Uniform state has safe defaults and a stable hash round trip', () => {
  const original = state({ screen: 'workshop', family: 'power', domain: 'restricted', r: .73, N: 37, eps: .08, x: .41, track: 'follow', view: 'majorant', node: 'uniform', edge: 'pointwise-not-uniform', step: 2, layer: 'questions', zoom: true });
  const parsed = parseUniformState(new URLSearchParams(serializeUniformState(original).slice(1)));
  assert.deepEqual(parsed, original);
  assert.equal(parseUniformState(new URLSearchParams('screen=bad&N=9999&r=-1')).N, 512);
  assert.equal(parseUniformState(new URLSearchParams('screen=bad&N=9999&r=-1')).r, .2);
});

test('Power functions separate pointwise convergence from uniform convergence by the domain', () => {
  const closed = state({ family: 'power', domain: 'closed', N: 20 });
  const restricted = state({ family: 'power', domain: 'restricted', r: .8, N: 20 });
  const open = state({ family: 'power', domain: 'open', N: 20 });
  assert.equal(ufTruth(closed).pointwise, true);
  assert.equal(ufTruth(closed).uniform, false);
  assert.equal(ufNorm(closed).value, 1);
  assert.equal(ufTruth(restricted).uniform, true);
  assert.ok(ufNorm(restricted).value < 1);
  assert.equal(ufTruth(open).uniform, false);
  assert.equal(ufPartial(closed, 20, 1), 1);
  assert.equal(ufError(closed, 20, 1), 0);
  assert.ok(ufError(closed, 20, .99) > .8);
});

test('A uniform certificate exists only when the analytic truth permits one', () => {
  const good = state({ family: 'power', domain: 'restricted', r: .8, eps: .1 });
  const bad = state({ family: 'power', domain: 'closed', eps: .1 });
  const wave = state({ family: 'wave', eps: .1 });
  assert.ok(ufCertificate(good).N >= 1);
  assert.equal(ufCertificate(bad).N, null);
  assert.ok(ufCertificate(wave).N >= 1);
});

test('Non-convergent and counterexample families keep their analytic distinctions', () => {
  const spike = state({ family: 'spike', N: 16 });
  const drift = state({ family: 'drift', N: 16 });
  const geometric = state({ family: 'geometric', domain: 'open', N: 12 });
  assert.equal(ufNorm(spike).value, 32);
  assert.equal(ufIntegral(spike).partial, 1);
  assert.equal(ufTruth(drift).pointwise, false);
  assert.equal(ufNorm(geometric).value, Infinity);
  assert.match(ufDerivativeBound(state({ family: 'wave' })).formula, /1/);
});

test('Scenario buttons change only documented experiment parameters', () => {
  const s = state({ screen: 'map', zoom: true });
  assert.equal(applyUniformScenario(s, 'powerCompact'), true);
  assert.equal(s.family, 'power');
  assert.equal(s.domain, 'restricted');
  assert.equal(s.r, .8);
  assert.equal(s.zoom, false);
  assert.equal(applyUniformScenario(s, 'not-a-scenario'), false);
  assert.equal(ufRoutes.length, 16);
});

test('Every uniform screen includes the same expanded guide contract', () => {
  for (const screen of ['map', 'workshop', 'proof', 'challenge']) {
    const html = uniformPage({ ...uniformDefaults(), screen });
    assert.match(html, /class="page-guide"/);
    assert.match(html, /本页要回答的问题/);
    assert.match(html, /怎么开始/);
    assert.match(html, /重点观察/);
    assert.match(html, /本页结论/);
    assert.match(html, /常见误区/);
    assert.match(html, /UNIFORM-GUIDE\.md|UNIFORM-MATHEMATICS\.md/);
    assert.match(html, new RegExp(`page-guide-uniform-${screen}`));
  }
});

test('Uniform plots render SVG without non-finite geometry', () => {
  for (const s of [
    state(), state({ family: 'geometric', domain: 'restricted', r: .8 }),
    state({ family: 'alternating', view: 'majorant' }), state({ family: 'spike', view: 'integral' }),
    state({ family: 'wave', view: 'derivative' }), state({ family: 'drift', view: 'derivative' }),
  ]) {
    const html = [ufGraphSVG(s), ufMainSVG(s), ufErrorSVG(s), ufHistorySVG(s), ufDerivativeSVG(s), ufBudgetSVG(s), ufMiniSVG(s)].join('');
    assert.ok(html.includes('<svg'));
    assert.equal(html.includes('NaN'), false);
    assert.equal(html.includes('undefined'), false);
  }
});

test('CSV keeps finite samples separate from analytic conclusions', () => {
  const csv = ufCSV(state({ family: 'power', domain: 'closed', N: 12 }));
  assert.match(csv, /finite plot samples are not proofs/);
  assert.match(csv, /analytic expression evaluated with floating point/);
  assert.match(csv, /x,S_N,S,abs_error,derivative_N,derivative_limit/);
  assert.match(csv, /undefined/);
});

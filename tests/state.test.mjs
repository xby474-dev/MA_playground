import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults,parseState,serializeState } from '../src/state.js';

test('Defaults are complete and lab-appropriate',()=>{
  assert.equal(defaults().view,'plane');assert.equal(defaults('differentiability').view,'surface');assert.deepEqual(parseState(''),defaults());
});
test('Limits share URL restores all meaningful experiment inputs',()=>{
  const s={...defaults(),path:'parabola',k:-2,q:3.75,sign:-1,zoom:true,view:'surface',pins:[{path:'line',k:.1},{path:'vertical',k:0}]};
  assert.deepEqual(parseState(serializeState(s)),s);
});
test('Differentiability share URL restores angle, metric, function and zoom',()=>{
  const s={...defaults('differentiability'),model:'smooth',angle:137,metric:'raw',q:2.3,zoom:true,view:'polar',tab:'proof'};
  assert.deepEqual(parseState(serializeState(s)),s);
});
test('Untrusted URL values are clamped or rejected',()=>{
  const s=parseState('#lab=<script>&k=Infinity&q=-20&angle=999&model=garbage&path=javascript:alert(1)&view=bad&tab=bad');
  assert.equal(s.lab,'limits');assert.equal(s.path,'line');assert.equal(s.k,1);assert.equal(s.q,0);assert.equal(s.angle,360);assert.equal(s.tab,'explore');
});
test('NaN, empty fields and excessive pin arrays do not crash rendering',()=>{
  const s=parseState('#k=&q=NaN&pins=bad:NaN;line:999;vertical:0;line:;parabola:1');
  assert.equal(s.k,1);assert.equal(s.q,.65);assert.equal(s.pins.length,4);assert.equal(s.pins[1].k,3);
});
test('Incompatible views fall back to a meaningful visualization',()=>{
  assert.equal(parseState('#lab=limits&view=polar').view,'plane');
  assert.equal(parseState('#lab=differentiability&view=plane').view,'surface');
});
test('State contains data only; no quiz answers or private information in links',()=>{
  const url=serializeState(defaults());assert.ok(!url.includes('answer'));assert.ok(!url.includes('token'));
});

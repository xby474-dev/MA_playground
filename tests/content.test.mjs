import test from 'node:test';
import assert from 'node:assert/strict';
import { proof,quizzes,formulas } from '../src/content.js';
import { planeSVG,convergenceSVG,polarSVG,surfaceSection } from '../src/plots.js';
import { defaults } from '../src/state.js';

test('Proof includes vertical path, origin extension and quantifier caveat',()=>{
  const html=proof(defaults());for(const text of ['竖直线','F(0, 0) = 0','所有点','ε₀','二元极限不存在'])assert.ok(html.includes(text));
});
test('Differentiability proof distinguishes candidate from genuine tangent plane',()=>{
  const html=proof(defaults('differentiability'));for(const text of ['候选','双侧','线性映射','最坏','在原点连续','不可微'])assert.ok(html.includes(text));
});
test('Each quiz has exactly one valid answer and a substantive explanation',()=>{
  for(const qs of Object.values(quizzes)){assert.equal(qs.length,3);for(const q of qs){assert.ok(Number.isInteger(q.correct));assert.ok(q.correct>=0&&q.correct<q.options.length);assert.ok(q.reason.length>20);}}
});
test('SVG coordinate output is finite at slider extremes',()=>{
  for(const q of [0,4])for(const k of [-3,0,3])for(const path of ['line','parabola','vertical']){
    const s={...defaults(),q,k,path,zoom:true};
    for(const html of [planeSVG(s),convergenceSVG(s)]){assert.ok(!html.includes('NaN'));assert.ok(!html.includes('Infinity'));assert.ok(html.includes('aria-label='));}
  }
});
test('Polar view distinguishes input radius from displayed error magnitude',()=>{
  const html=polarSVG({...defaults('differentiability'),q:4});assert.ok(html.includes('而非输入位移'));assert.ok(!html.includes('NaN'));
});
test('MathML fractions are structured and no placeholder remains',()=>{
  for(const html of Object.values(formulas)){assert.ok(html.startsWith('<math'));assert.ok(html.includes('aria-label'));assert.ok(!html.includes('PLACEHOLDER'));}
});


test('Surface slice leaves a genuine hole at a nonzero parabolic path limit',()=>{
  const s={...defaults(),path:'parabola',k:1};
  const segments=surfaceSection(s,1);
  assert.equal(segments.length,2);
  assert.ok(segments[0].every(p=>p.x<0&&p.z===.5));
  assert.ok(segments[1].every(p=>p.x>0&&p.z===.5));
  for(const segment of surfaceSection({...s,k:-1},1))assert.ok(segment.every(p=>p.z===-.5));
});
test('Continuous surface slices contain the actual origin, including the degenerate parabola',()=>{
  for(const s of [{...defaults(),path:'parabola',k:0},defaults('differentiability')]){
    const segments=surfaceSection(s,1);
    assert.equal(segments.length,1);
    assert.ok(segments[0].some(p=>p.x===0&&p.y===0&&p.z===0));
  }
});

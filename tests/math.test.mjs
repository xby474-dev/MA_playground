import test from 'node:test';
import assert from 'node:assert/strict';
import { limitFunction, pathPoint, pathValue, pathLimit, smoothFunction, counterFunction, directionPoint, remainder, normalizedError, worstError, limitRows, diffRows, samplePath, format } from '../src/math.js';
const close=(actual,expected,tol=1e-11)=>assert.ok(Math.abs(actual-expected)<=tol,`${actual} != ${expected}`);

test('Origin extensions are values, not limits',()=>{
  assert.equal(limitFunction(0,0),0);assert.equal(counterFunction(0,0),0);assert.equal(smoothFunction(0,0),0);
  assert.equal(pathLimit('parabola',1),.5);assert.equal(pathValue('parabola',1,0),0);
});
for(const path of ['line','parabola','vertical']) {
  test(`${path}: parametrization and analytic value agree with direct evaluation`,()=>{
    for(const k of [-3,-2,-1,-.1,0,.1,1,2,3])for(const t of [-1,-.1,-1e-4,1e-4,.1,1]){
      const {x,y}=pathPoint(path,k,t);close(pathValue(path,k,t),limitFunction(x,y));
    }
  });
}
test('Every fixed nonzero finite slope gives limit zero; axes handled separately',()=>{
  for(const k of [-3,-.1,.1,1,3])for(const sign of [-1,1]){
    const t=sign*1e-9;assert.ok(Math.abs(pathValue('line',k,t))<2e-8);assert.equal(pathLimit('line',k),0);
  }
  assert.equal(pathValue('line',0,.5),0);assert.equal(pathValue('vertical',3,-.5),0);
});
test('Parabolas give c/(1+c²), with both signs of t and negative c',()=>{
  for(const c of [-3,-2,-1,0,1,2,3])for(const t of [-1e-4,-.3,.2,1e-4])close(pathValue('parabola',c,t),c/(1+c*c));
  close(pathLimit('parabola',-2),-.4);
});
test('k=0 is a degenerate parabola, not a counterexample',()=>{
  assert.equal(pathLimit('parabola',0),0);assert.equal(pathValue('parabola',0,1e-4),0);
});
test('Global F bound and even/odd symmetries',()=>{
  for(let i=-35;i<=35;i++)for(let j=-35;j<=35;j++){
    const x=i/13,y=j/19,value=limitFunction(x,y);assert.ok(Math.abs(value)<=.5+1e-14);
    close(limitFunction(-x,y),value);close(limitFunction(x,-y),-value);
  }
});
test('Stable evaluation does not lose the narrowing parabola ridge',()=>{
  for(const t of [1e-4,1e-8,1e-40,1e-80])close(limitFunction(t,t*t),.5);
});
test('Explicit epsilon-delta witnesses falsify limit zero at every tested delta',()=>{
  for(const delta of [1,1e-2,1e-4,1e-7]){
    const t=Math.min(1,delta/Math.SQRT2)/2;
    assert.ok(Math.hypot(t,t*t)<delta);assert.ok(limitFunction(t,t*t)>.25);
  }
});
test('Smooth model has a uniform second-order remainder',()=>{
  for(const rho of [1,.1,.001,1e-4])for(let angle=0;angle<=360;angle+=5){
    const {x,y}=directionPoint(rho,angle);close(smoothFunction(x,y),rho*rho);
    close(remainder('smooth',rho,angle),rho*rho);close(normalizedError('smooth',rho,angle),rho);
  }
});
test('Counterexample is continuous: |g| <= rho/2',()=>{
  for(const rho of [1,.1,.001,1e-4])for(let angle=0;angle<=360;angle+=3){
    const {x,y}=directionPoint(rho,angle);assert.ok(Math.abs(counterFunction(x,y))<=rho/2+1e-14);
    close(remainder('counter',rho,angle),Math.abs(counterFunction(x,y)));
  }
});
test('Both partial derivatives are zero (difference quotient sequences)',()=>{
  for(const t of [-1e-8,-1e-6,1e-6,1e-8]){
    assert.equal(counterFunction(t,0)/t,0);assert.equal(counterFunction(0,t)/t,0);
    close(smoothFunction(t,0)/t,t);close(smoothFunction(0,t)/t,t);
  }
});
test('Counterexample diagonal normalized error is exactly 1/2, independent of scale',()=>{
  for(const rho of [1,.5,.01,1e-4])for(const theta of [45,135,225,315])close(normalizedError('counter',rho,theta),.5);
});
test('Counterexample axes have zero normalized error within floating tolerance',()=>{
  for(const theta of [0,90,180,270,360])close(normalizedError('counter',.1,theta),0);
});
test('Analytic suprema bound all sampled directions and are attained',()=>{
  for(const model of ['smooth','counter'])for(const rho of [1,.01,1e-4]){
    const bound=worstError(model,rho);
    for(let a=0;a<=360;a++)assert.ok(normalizedError(model,rho,a)<=bound+1e-14);
    close(normalizedError(model,rho,45),bound);
  }
});
test('Raw error vs normalized error has expected scaling',()=>{
  close(remainder('counter',.01,45)/remainder('counter',.1,45),.1);
  close(normalizedError('counter',.01,45)/normalizedError('counter',.1,45),1);
  close(remainder('smooth',.01,45)/remainder('smooth',.1,45),.01);
});
test('The ratio at zero displacement is undefined, not silently zero',()=>{
  assert.ok(Number.isNaN(normalizedError('smooth',0,45)));assert.ok(Number.isNaN(worstError('counter',0)));
});
test('Radial one-sided behavior must not be mislabeled a two-sided directional derivative',()=>{
  const p=directionPoint(.001,45),n=directionPoint(-.001,45);
  close(counterFunction(p.x,p.y)/.001,.5);close(counterFunction(n.x,n.y)/-.001,-.5);
});
test('CSV sampling excludes origin and carries Euclidean radius explicitly',()=>{
  const rows=limitRows({path:'parabola',k:1,sign:-1});assert.equal(rows.length,101);
  for(const r of rows){assert.ok(r.t<0);close(r.radius,Math.hypot(r.x,r.y));close(r.value,.5);}
  const diff=diffRows({angle:45});assert.equal(diff.length,101);
  for(const r of diff){assert.ok(r.rho>0);close(r.counterRatio,.5);close(r.smoothRatio,r.rho);}
});
test('Sample paths are finite and symmetric in parameter',()=>{
  const samples=samplePath('parabola',1);assert.equal(samples.length,161);assert.equal(samples[80].t,0);assert.equal(samples[80].value,0);
});
test('Formatting reports undefined and uses proper scientific exponents',()=>{
  assert.equal(format(NaN),'未定义');assert.equal(format(0),'0');assert.equal(format(.5),'0.5');assert.equal(format(.0001),'1 × 10⁻⁴');
});

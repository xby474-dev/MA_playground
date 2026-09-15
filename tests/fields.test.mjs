import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fieldDefaults } from '../src/field-state.js';
import { defaults, parseState, serializeState } from '../src/state.js';
import { fieldAt, potential, curlAt, divergenceAt, surfacePoint, surfaceNormal, surfaceDerivatives, circulationEdge, planarFluxEdge, faceFlux, rectangleEdges, gridCells, contributions, cancellationLedger, selectedPair, domainLocal, domainBoundary, domainBoundaryParts, labCSV, cellData } from '../src/field-math.js';
import { fieldScene, holeSVG } from '../src/field-plots.js';
import { fieldHeader, fieldExplore, fieldProof, fieldQuiz, theoremEquation, fieldQuizzes, stageInfo } from '../src/field-content.js';
const close=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
const S=(patch={})=>({...fieldDefaults(),...patch});
const modes=['green','flux','gauss','stokes'];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
// Independent Gauss-Legendre integration used as an implementation check only.
const nodes=[-Math.sqrt(3/5),0,Math.sqrt(3/5)],weights=[5/9,8/9,5/9];
function quadrature(fn,lo=0,hi=1){return nodes.reduce((v,t,i)=>v+weights[i]*fn((hi+lo)/2+(hi-lo)*t/2),0)*(hi-lo)/2;}

test('New lab is registered without changing legacy defaults or deep links',()=>{
  assert.equal(defaults().lab,'limits');assert.equal(defaults('differentiability').lab,'differentiability');assert.deepEqual(defaults('fields'),fieldDefaults());
  for(const stage of [...modes,'unify'])for(const tab of ['explore','proof','quiz']){
    const s=S({stage,tab,orientation:-1,n:6,cell:18,slice:2,h:1.45,a:-1.3,b:1.8,c:.2,L:2.4,cancel:.34,viewAngle:115,hole:true});
    assert.deepEqual(parseState(serializeState(s)),s);
  }
});
test('Field URL parameters are whitelisted, bounded and finite, including NaN and Infinity',()=>{
  const s=parseState('#lab=fields&stage=<img>&tab=evil&n=100&cell=99999&slice=-9&a=NaN&b=Infinity&h=-2&L=0&cancel=9&orientation=x');
  assert.equal(s.stage,'green');assert.equal(s.tab,'explore');assert.equal(s.n,6);assert.equal(s.cell,35);assert.equal(s.slice,0);assert.equal(s.h,0);assert.equal(s.L,1);assert.equal(s.cancel,1);
  assert.equal(s.a,.6);assert.equal(s.b,1);assert.equal(s.orientation,1);
  assert.ok(!serializeState(s).includes('img'));
});
test('The polynomial curl and divergence agree with independent finite differences',()=>{
  const s=S({a:-.8,b:1.7,c:.9}),p=[.83,.61,1.2],eps=1e-5;
  const partial=k=>{const lo=[...p],hi=[...p];lo[k]-=eps;hi[k]+=eps;return fieldAt(hi,s).map((x,i)=>(x-fieldAt(lo,s)[i])/(2*eps));};
  const [dx,dy,dz]=[0,1,2].map(partial),curl=[dy[2]-dz[1],dz[0]-dx[2],dx[1]-dy[0]];
  curl.forEach((x,i)=>close(x,curlAt(p,s)[i],1e-8));close(dx[0]+dy[1]+dz[2],divergenceAt(p,s),1e-8);close(dx[0]+dy[1],divergenceAt(p,s,2),1e-8);
});
test('Polynomial potential has the expected gradient and no circulation contribution',()=>{
  const s=S({b:0}),p=[.8,.4,1.3],eps=1e-5;
  for(let k=0;k<3;k++){const q=[...p],r=[...p];q[k]+=eps;r[k]-=eps;close((potential(q,s)-potential(r,s))/(2*eps),fieldAt(p,s)[k],1e-8);}
  for(const mode of ['green','stokes'])close(domainBoundary({...s,h:1.9},mode),0);
});
test('Four full-domain integrals match independent closed-form reference values',()=>{
  for(const a of [-2,0,.6,2])for(const b of [-2,0,1.7])for(const c of [0,.5,1])for(const L of [1,2,3])for(const orientation of [-1,1]){
    const s=S({a,b,c,L,orientation});
    const expected={green:orientation*b*(L*L+c*L**3/2),stokes:orientation*b*(L*L+c*L**3/2),flux:orientation*a*(2*L*L+c*L**3),gauss:orientation*a*(3*L**3+c*L**4)};
    for(const mode of modes){close(domainLocal(s,mode),expected[mode]);close(domainBoundary(s,mode),expected[mode]);}
  }
});
test('Each cell independently satisfies its local integral identity at negative and positive parameters',()=>{
  for(const stage of modes)for(const n of [2,3,6])for(const orientation of [-1,1]) {
    const s=S({stage,n,a:-1.1,b:.7,c:.8,L:2.3,h:1.7,orientation});
    for(const cell of gridCells(s))close(cell.local,cell.sides.reduce((v,x)=>v+x,0));
  }
});
test('Every edge integral matches independent quadrature of F along the actual curve',()=>{
  const s=S({a:-.7,b:1.3,c:.9,L:2.7,h:1.8});
  for(const curved of [false,true])for(const e of rectangleEdges([.2,1.3,.4,2.2],s,curved)) {
    const [a,b]=e.uv,du=b[0]-a[0],dv=b[1]-a[1];
    const observed=quadrature(t=>{
      const u=a[0]+du*t,v=a[1]+dv*t,p=curved?surfacePoint(u,v,s):[u,v,0];
      const {zu,zv}=surfaceDerivatives(u,v,s),tangent=[du,dv,curved?zu*du+zv*dv:0];
      return dot(fieldAt(p,s),tangent);
    });
    close(circulationEdge(e.p,e.q,s),observed);
    close(circulationEdge(e.q,e.p,s),-observed);
  }
});
test('Planar edge flux is P dy minus Q dx, not circulation or absolute flux',()=>{
  const s=S({a:-.4,b:1.8});
  for(const e of rectangleEdges([.1,1.6,.3,1.8],s)) {
    const d=e.q.map((x,i)=>x-e.p[i]);
    const val=quadrature(t=>{const v=fieldAt(e.p.map((x,i)=>x+t*d[i]),s);return v[0]*d[1]-v[1]*d[0];});
    close(planarFluxEdge(e.p,e.q,s),val);close(planarFluxEdge(e.q,e.p,s),-val);
  }
});
test('Six face fluxes agree with independent two-dimensional quadrature',()=>{
  const s=S({a:.9,b:-1.4,c:.9}),box=[.1,1.7,.3,1.4,.2,1.8];
  for(let axis=0;axis<3;axis++)for(const side of [-1,1]) {
    const others=[0,1,2].filter(i=>i!==axis);
    const val=quadrature(u=>quadrature(v=>{const p=[0,0,0];p[axis]=box[2*axis+(side>0?1:0)];p[others[0]]=u;p[others[1]]=v;return side*fieldAt(p,s)[axis];},box[2*others[1]],box[2*others[1]+1]),box[2*others[0]],box[2*others[0]+1]);
    close(faceFlux(box,axis,side,s),val);
  }
});
test('Adjacent contributions have equal geometry, opposite orientations and independently cancelling values',()=>{
  for(const stage of modes)for(const n of [2,4,6])for(const orientation of [-1,1]){
    const s=S({stage,n,orientation,a:-.9,b:1.1}),ledger=cancellationLedger(s);
    for(const pair of ledger.pairs){assert.equal(pair.length,2);assert.equal(pair[0].key,pair[1].key);assert.notEqual(pair[0].cell,pair[1].cell);assert.equal(pair[0].direction,-pair[1].direction);close(pair[0].value+pair[1].value,0);}
    close(ledger.interior,0);close(ledger.local,domainLocal(s));close(ledger.boundary,domainBoundary(s));close(ledger.all,ledger.local);
  }
});
test('Topology counts distinguish shared edges from shared faces',()=>{
  for(const n of [2,3,6])for(const stage of modes){
    const s=S({n,stage}),l=cancellationLedger(s),is3=stage==='gauss';
    assert.equal(l.cellCount,n**(is3?3:2));assert.equal(l.pairs.length,is3?3*n*n*(n-1):2*n*(n-1));assert.equal(l.outer.length,is3?6*n*n:4*n);
    assert.equal(contributions(s).length,l.pairs.length*2+l.outer.length);
  }
});
test('Mesh refinement and chosen cell do not affect full-domain integrals',()=>{
  for(const stage of modes){const s=S({stage});for(const n of [2,3,4,5,6]){close(cancellationLedger({...s,n,cell:0}).local,domainLocal(s));close(cancellationLedger({...s,n,cell:n*n-1}).boundary,domainBoundary(s));}}
});
test('Changing the display phase, transparency or viewing angle never changes a mathematical result',()=>{
  for(const stage of modes){const s=S({stage});for(const phase of [0,1,2,3])for(const cancel of [0,.4,1]){const x={...s,phase,cancel,viewAngle:180,arrows:false};assert.equal(domainLocal(x),domainLocal(s));assert.equal(domainBoundary(x),domainBoundary(s));}}
});
test('Flipping orientation flips all oriented integrals but not the field or its curl/divergence',()=>{
  for(const stage of modes){const s=S({stage}),r={...s,orientation:-1};assert.deepEqual(fieldAt([1,2,3],s),fieldAt([1,2,3],r));assert.deepEqual(curlAt([1,2,3],s),curlAt([1,2,3],r));assert.equal(divergenceAt([1,2,3],s),divergenceAt([1,2,3],r));close(domainLocal(r),-domainLocal(s));close(domainBoundary(r),-domainBoundary(s));}
});
test('Pure rotation has nonzero circulation but zero net outward flux',()=>{
  const s=S({a:0,b:1,c:0,L:2});close(domainBoundary(s,'green'),4);close(domainBoundary(s,'gauss'),0);close(domainBoundary(s,'flux'),0);
});
test('Pure gradient expansion has nonzero flux but zero circulation',()=>{
  const s=S({a:1,b:0,c:0,L:2});close(domainBoundary(s,'green'),0);close(domainBoundary(s,'stokes'),0);close(domainBoundary(s,'flux'),8);close(domainBoundary(s,'gauss'),24);
});
test('Zero field, source and sink values remain finite and signed (not absolute-valued)',()=>{
  for(const stage of modes){close(domainBoundary(S({a:0,b:0,stage})),0);const s=S({a:-1,b:-1,stage});assert.ok(domainLocal(s)<0);assert.ok(domainBoundary(s)<0);}
});
test('Same boundary under surface deformation: all four edges remain at z=0',()=>{
  for(const L of [1,2,3])for(const h of [0,.7,2]){
    const s=S({L,h});for(const t of [0,.13,.5,1])for(const [u,v] of [[0,L*t],[L,L*t],[L*t,0],[L*t,L]])close(surfacePoint(u,v,s)[2],0);
    for(const stage of ['green','stokes'])close(domainBoundary(s,stage),domainLocal(s,'green'));
  }
});
test('Parameter surface is regular; Jacobian and unit normal are compatible at every tested point',()=>{
  for(const h of [0,.8,2])for(const u of [0,.3,1,2])for(const v of [0,.7,1,2]){
    const s=S({h}),{zu,zv}=surfaceDerivatives(u,v,s),n=surfaceNormal(u,v,s);cross([1,0,zu],[0,1,zv]).forEach((x,i)=>close(x,n.areaVector[i]));assert.ok(n.jacobian>=1);close(Math.hypot(...n.unit),1);
    close(dot(curlAt([u,v,0],s),n.unit)*n.jacobian,s.b*(1+s.c*u));
  }
});
test('Bending changes the actual-area density but not the pulled-back integral',()=>{
  const flat=S({stage:'stokes',h:0}),curved={...flat,h:1.6};
  const a=cellData(flat),b=cellData(curved);assert.ok(b.jacobian>a.jacobian);assert.ok(Math.abs(b.density)<Math.abs(a.density));close(a.local,b.local);close(a.pullback,b.pullback);
});
test('The local average equals the affine midpoint density only in this authored polynomial family',()=>{
  for(const stage of modes){const d=cellData(S({stage,n:4,cell:5}));close(d.local/d.measure,stage==='stokes'?d.pullback:d.density);}
});
test('CSV exports one auditable row per cell and does not use rendered approximations',()=>{
  for(const stage of modes){const s=S({stage}),csv=labCSV(s),lines=csv.trim().split('\n');assert.ok(lines[0].includes('analytic'));assert.equal(lines.length,s.n**(stage==='gauss'?3:2)+3);for(const row of lines.slice(3)){const [id,i,j,k,local,boundary,difference]=row.split(',').map(Number);assert.ok(Number.isFinite(local));close(local,boundary);close(difference,0);}}
});
test('SVG scene coordinates are finite over all stages, phase and control extremes',()=>{
  for(const stage of [...modes,'unify'])for(const phase of [0,1,2,3])for(const h of [0,2])for(const orientation of [-1,1]){
    const s=S({stage,phase,n:2,cell:0,orientation,h,L:1,viewAngle:180,a:-2,b:-2,c:1});const html=fieldScene(s);
    assert.ok(html.startsWith('<svg'));assert.ok(html.includes('aria-label'));assert.ok(!/NaN|Infinity|undefined/.test(html),`${stage}/${phase}`);
  }
});
test('Shared-boundary inspector follows the selected cell and always selects a real pair',()=>{
  for(const stage of modes){const s=S({stage,n:4,cell:10}),l=cancellationLedger(s);assert.ok(selectedPair(s,l).some(e=>e.cell===s.cell));}
});
test('Proof distinguishes general theorem assumptions, special-case proof and numerical rendering',()=>{
  const html=fieldProof(S({tab:'proof'}));for(const text of ['C¹','C²','闭合','右手','内边界','一维微积分基本定理','Fubini','参数','极限','不能替代','实际面积元','不依赖数值积分'])assert.ok(html.includes(text),text);
  assert.ok(html.includes('n dS=(r'));
});
test('Condition illustration preserves the singularity and the inner boundary',()=>{
  assert.ok(holeSVG(false).includes('条件不满足'));assert.ok(holeSVG(true).includes('内边界：−2π'));
  assert.ok(fieldExplore(S({stage:'unify'})).includes('没有把奇点数值填为 0'));
});
test('All new quizzes have a unique valid key and explanatory feedback',()=>{
  assert.equal(fieldQuizzes.length,8);for(const q of fieldQuizzes){assert.ok(Number.isInteger(q.correct));assert.ok(q.correct>=0&&q.correct<q.options.length);assert.ok(q.reason.length>40);assert.equal(new Set(q.options).size,q.options.length);}
  assert.ok(fieldQuiz(S()).includes('required'));assert.ok(!serializeState(S()).includes('answer'));
});
test('The new experiment has no empty stage and exposes an auditable learning path',()=>{
  for(const stage of [...modes,'unify']){const html=fieldExplore(S({stage}));assert.ok(html.includes('field-journey'));assert.ok(html.includes('field-scene'));assert.ok(!/TODO|PLACEHOLDER|coming soon/.test(html));}
  assert.ok(fieldHeader(S()).includes('role="tablist"'));
});
test('Reversed Gauss/planar flux formula has a minus sign and Stokes retains matched normal',()=>{
  for(const stage of ['gauss','flux','green'])assert.ok(theoremEquation(stage,-1).includes('<mo>−</mo>'));
  assert.ok(theoremEquation('stokes',-1).includes('<mi>n</mi>'));
});
test('Built offline artifact contains the new module graph and local stylesheet',async()=>{
  // Build is run before this test via `npm run verify` or the engineering suite.
  const modules=await readdir(new URL('../src/',import.meta.url));
  const script=await readFile(new URL('../scripts/standalone.mjs',import.meta.url),'utf8');
  for(const file of modules)assert.ok(script.includes(`'${file.replace('.js','')}'`),file);
  assert.ok(script.includes('fields.css'));
});

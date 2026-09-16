import test from 'node:test';
import assert from 'node:assert/strict';
import {properties,models,modelIds,relations,value,partials,direction,linear,residual,sample,uniformBound,relationVerdict,sequencePair,slopeQuotients,relationRows,sliceSegments,planeLabel} from '../src/relations-math.js';
import {relationsDefaults,parseRelationsState,serializeRelationsState} from '../src/relations-state.js';
import {parseState,serializeState} from '../src/state.js';
import {relationGraph,errorSVG,sectionSVG,derivativeSVG} from '../src/relations-plots.js';
import {functionFormula,edgeExplanation,modelProofs,challengeReasons,relationsPage} from '../src/relations-content.js';
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);

test('Catalogue includes four smooth positives, all three requested counterexamples and original bridge',()=>{
 assert.equal(modelIds.filter(id=>models[id].group==='光滑正例').length,4);
 for(const id of ['ratio','absolute','oscillation','cone'])assert.ok(models[id]);
 assert.deepEqual(properties.map(p=>p.id),['P','C','D','S']);
});
test('Authored truth table matches the three requested examples, including neighbourhood conditions',()=>{
 assert.deepEqual(models.ratio.properties,{P:true,C:false,D:false,S:false,neighbor:true,bounded:false});
 assert.deepEqual(models.absolute.properties,{P:false,C:true,D:false,S:false,neighbor:false,bounded:false});
 assert.deepEqual(models.oscillation.properties,{P:true,C:true,D:true,S:false,neighbor:true,bounded:true});
});
test('All four smooth functions have all four properties and valid nonzero derivative where needed',()=>{
 for(const id of ['bowl','saddle','wave','quadratic'])for(const p of properties)assert.equal(models[id].properties[p.id],true);
 near(partials('wave',0,0)[0],1);near(partials('wave',0,0)[1],0);assert.equal(linear('wave',.4,.2),.4);
});
test('Every catalogue model satisfies every true implication, including boundedness only with a neighbourhood',()=>{
 for(const e of relations.filter(e=>e.kind==='theorem'))for(const id of modelIds){assert.notEqual(relationVerdict(e.id,id).role,'counterexample',`${e.id}: ${id}`);}
 assert.equal(relationVerdict('bounded-c','ratio').role,'inapplicable');
 assert.equal(relationVerdict('bounded-c','oscillation').role,'compatible');
 assert.equal(relationVerdict('bounded-c','cone').role,'compatible');assert.equal(models.cone.properties.D,false);
});
test('Each false arrow has an actual antecedent-true consequent-false witness',()=>{
 for(const e of relations.filter(e=>e.kind==='nonimplication')){const v=relationVerdict(e.id,e.example);assert.equal(v.premise,true,e.id);assert.equal(v.conclusion,false,e.id);assert.equal(v.role,'counterexample',e.id);}
});
test('One compatible example never validates an inverse and a false antecedent is not a counterexample',()=>{
 assert.equal(relationVerdict('d-s','bowl').role,'compatible');
 assert.equal(relationVerdict('s-d','oscillation').role,'inapplicable');
 assert.equal(relationVerdict('p-d','absolute').role,'inapplicable');
});
test('Discontinuous ratio: both coordinate quotients zero, diagonal limit 1/2 on both sides',()=>{
 for(const t of [1,.1,1e-4]){for(const v of Object.values(slopeQuotients('ratio',t)))near(v,0);near(value('ratio',t,t),.5);near(value('ratio',-t,-t),.5);near(partials('ratio',0,t)[0],1/t);}
 assert.equal(value('ratio',0,0),0);assert.deepEqual(partials('ratio',0,0),[0,0]);
});
test('Absolute values: two-sided partial quotients disagree; absent derivatives remain null, not zero',()=>{
 for(const t of [1,.001]){assert.deepEqual(slopeQuotients('absolute',t),{xPlus:1,xMinus:-1,yPlus:1,yMinus:-1});}
 assert.deepEqual(partials('absolute',0,0),[null,null]);assert.equal(linear('absolute',.1,.2),null);assert.equal(residual('absolute',.1,.2),null);
 const s=sample('absolute',.2,45);assert.equal(s.ratio,null);assert.equal(s.raw,null);near(s.reference,Math.SQRT2);
});
test('Oscillatory example is defined on the entire x=0 line and both partials exist there',()=>{
 for(const y of [-2,0,.5]){assert.equal(value('oscillation',0,y),0);assert.deepEqual(partials('oscillation',0,y),[0,0]);}
});
test('Exact oscillation witnesses have derivative -1/+1 for every checked n, independently of plot mesh',()=>{
 for(const id of ['oscillation','radial'])for(const n of [1,2,9,120,10000]){const p=sequencePair(id,n);near(p.a.fx,-1,1e-9);near(p.b.fx,1,1e-9);assert.equal(p.a.exact,-1);assert.equal(p.b.exact,1);assert.equal(p.origin,0);assert.ok(p.a.x>p.b.x);}
});
test('Original continuous-but-nondifferentiable model is retained exactly',()=>{
 for(const rho of [1,.3,1e-4]){const v=sample('cone',rho,45);near(v.ratio,.5);near(v.raw,rho/2);near(uniformBound('cone',rho),.5);near(sample('cone',rho,0).ratio,0);}
 assert.deepEqual(models.cone.properties,{P:true,C:true,D:false,S:false,neighbor:true,bounded:true});
});
test('Analytic uniform bounds dominate sampled residuals for every audited function and direction',()=>{
 for(const id of modelIds)for(const rho of [1,.21,.01,1e-4])for(let a=0;a<=360;a+=7){const v=sample(id,rho,a);const e=v.ratio??v.reference;assert.ok(e<=uniformBound(id,rho)*(1+1e-11)+1e-13,`${id} ${rho} ${a} ${e}`);}
});
test('Only exact supremum labels use equality; the wave and oscillatory examples use upper bounds',()=>{
 for(const id of ['wave','oscillation','radial']){assert.equal(models[id].boundKind,'bound');assert.ok(models[id].boundLabel.startsWith('统一上界'));}
 for(const id of ['bowl','saddle','quadratic','ratio','cone','rational'])assert.equal(models[id].boundKind,'exact');
});
test('Stable sine residual does not lose its leading cubic term under near-origin subtraction',()=>{
 const r=residual('wave',1e-7,0);near(r/(-1e-21/6),1,1e-12);
 near(residual('wave',0,.3),0);
});
test('Analytic partials agree with independent centered differences away from singular coordinate sets',()=>{
 const h=1e-6;
 for(const id of modelIds)for(const [x,y] of [[.36,.27],[-.71,.42],[.8,-.66]]){
  const d=partials(id,x,y),dx=(value(id,x+h,y)-value(id,x-h,y))/(2*h),dy=(value(id,x,y+h)-value(id,x,y-h))/(2*h);near(d[0],dx,2e-7);near(d[1],dy,2e-7);
 }
});
test('The nonzero gradient challenge uses L=x, not a generic zero plane',()=>{
 assert.deepEqual(partials('ridge',0,0),[1,0]);near(sample('ridge',.1,45).ratio,1/(2*Math.sqrt(2)));assert.equal(models.ridge.properties.D,false);
 assert.ok(planeLabel('ridge').includes('候选'));assert.ok(planeLabel('wave').includes('切平面'));
 assert.ok(planeLabel('absolute').startsWith('未定义'));
});
test('New transfer examples include both a differentiable rational function and a differentiable non-Cpartial radial function',()=>{
 assert.deepEqual([models.rational.properties.P,models.rational.properties.C,models.rational.properties.D,models.rational.properties.S],[true,true,true,true]);
 assert.deepEqual([models.radial.properties.P,models.radial.properties.C,models.radial.properties.D,models.radial.properties.S],[true,true,true,false]);
});
test('Axis direction is snapped exactly to avoid spurious nonzero coordinates at 90/180/270 degrees',()=>{
 assert.equal(direction(.1,90).x,0);assert.equal(direction(.1,180).y,0);assert.equal(direction(.1,270).x,0);assert.equal(direction(.1,360).y,0);
});
test('Invalid radius and unknown formula requests fail explicitly instead of producing NaN',()=>{
 for(const r of [0,-1,Infinity,NaN])assert.throws(()=>sample('bowl',r,0),RangeError);
 assert.throws(()=>value('bad',1,2),RangeError);assert.throws(()=>partials('bad',1,2),RangeError);
});
test('Discontinuous sections do not join through the origin; smooth and cusp sections contain their real origin',()=>{
 const segments=sliceSegments('ratio',45,1);assert.equal(segments.length,2);assert.ok(segments[0].every(p=>p.t<0));assert.ok(segments[1].every(p=>p.t>0));
 for(const id of ['bowl','absolute','oscillation','cone'])assert.ok(sliceSegments(id,45,1).flat().some(p=>p.t===0&&p.z===0));
});
test('CSV samples distinguish null derivative data and provide upper-bound provenance',()=>{
 const s={...relationsDefaults(),fn:'absolute'},rows=relationRows(s);assert.equal(rows.length,101);assert.ok(rows.every(r=>r.L===null&&r.ratio===null&&r.raw===null));assert.ok(rows.every(r=>Number.isFinite(r.reference)));near(rows.at(-1).rho,1e-4,1e-14);
});
test('Relation state round-trips through the real router without leaking answers',()=>{
 const s={...relationsDefaults(),screen:'case',edge:'d-s',fn:'oscillation',view:'derivative',q:3.475,angle:90,sign:-1,reveal:true,sequence:111};
 assert.deepEqual(parseState(serializeState(s)),s);assert.deepEqual(parseRelationsState(new URLSearchParams(serializeRelationsState(s).slice(1))),s);
 assert.ok(!serializeState(s).includes('answer'));assert.ok(!serializeState(s).includes('reason'));
});
test('Relation deep links whitelist all strings, clamp numbers and cannot inject markup',()=>{
 const s=parseState('#lab=differentiability&mode=relations&fn=%3Cscript%3E&edge=bad&screen=javascript:alert(1)&view=bad&q=Infinity&angle=-20&n=999999&stage=NaN&reveal=evil');
 assert.equal(s.fn,'bowl');assert.equal(s.edge,'s-d');assert.equal(s.screen,'map');assert.equal(s.view,'surface');assert.equal(s.q,.65);assert.equal(s.angle,0);assert.equal(s.sequence,120);assert.equal(s.reveal,false);
});
test('Every diagram arrow is keyboard-addressable and distinguishes proof from counterexample',()=>{
 const html=relationGraph(relationsDefaults());for(const e of relations)assert.ok(html.includes(`data-r-edge="${e.id}"`),e.id);
 assert.ok(html.includes('role="button" tabindex="0"'));assert.ok(html.includes('为什么成立'));assert.ok(html.includes('反例在哪里'));assert.ok(html.includes('邻域内全部偏导存在且有界'));
});
test('Every formula is native MathML and every case has a substantive authored explanation',()=>{
 for(const id of modelIds){const html=functionFormula(id);assert.ok(html.includes('<math'));assert.ok(html.includes('aria-label'));assert.ok(!html.includes('undefined'));assert.ok(modelProofs[id].length>50);}
 for(const r of relations){const c=edgeExplanation(r.id);assert.ok(c.claim.length>15);assert.ok(c.steps.length>=3);assert.ok(c.warning.length>15);}
});
test('Theorem explanations retain the neighbourhood qualifier and a uniform all-directions estimate',()=>{
 const c=JSON.stringify(edgeExplanation('s-d'));assert.ok(c.includes('开矩形'));assert.ok(c.includes('ε/√2'));assert.ok(c.includes('所有方向'));
 const bounded=JSON.stringify(edgeExplanation('bounded-c'));assert.ok(bounded.includes('处处存在'));assert.ok(bounded.includes('Lipschitz'));assert.ok(bounded.includes('不是可微性证明'));
});
test('All plot views remain finite at supported extrema and formula origins',()=>{
 for(const id of modelIds)for(const q of [0,4])for(const angle of [0,45,90,360])for(const metric of ['raw','ratio','value']){
  const s={...relationsDefaults(),fn:id,q,angle,metric};
  for(const h of [errorSVG(s),sectionSVG(s),derivativeSVG(s)]){assert.ok(!h.includes('NaN'),`${id} NaN`);assert.ok(!h.includes('Infinity'),`${id} Infinity`);assert.ok(h.includes('aria-label='));}
 }
});
test('Challenge reasons each have one correct option and do not encode results in pre-submission markup',()=>{
 for(const id of ['ridge','rational','radial']){const q=challengeReasons(id);assert.equal(q.options.length,3);assert.ok(q.correct>=0&&q.correct<3);const html=relationsPage({...relationsDefaults(),screen:'challenge',stage:4,challenge:id});assert.ok(!html.includes(modelProofs[id]));assert.ok(!html.includes('rel-score'));}
});

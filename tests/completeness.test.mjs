import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { rational, radd, rsub, rmul, rdiv, rcompare, rabs, rnumber, rtext, parseRational, exactBrackets, bracketAt, squareCompare, upperBoundWitness, cauchyCertificate, subsequenceData, implicationPath, domainVerdict, completenessCSV, completenessNodes, completenessEdges, cpTarget } from '../src/completeness-math.js';
import { completenessDefaults, parseCompletenessState, serializeCompletenessState } from '../src/completeness-state.js';
import { parseState, serializeState, defaults } from '../src/state.js';
import { cpDefinitions, cpProofs, cpQuestions, cpEscape, completenessPage } from '../src/completeness-content.js';
import { completenessGraph, completenessPlot, cpBracketSVG } from '../src/completeness-plots.js';
const targets=['two','three','rational'];
const R=rational;
function at(hash){return parseCompletenessState(new URLSearchParams(hash.replace(/^#/,'')));}

test('Exact rationals normalize signs, common factors and zero',()=>{
 assert.deepEqual(R(-12,-18),R(2,3));assert.deepEqual(R(0,7),R(0));assert.equal(rtext(R(7,1)),'7');assert.equal(rtext(R(12,-18)),'-2/3');assert.throws(()=>R(1,0),RangeError);
});
test('Rational parser accepts fractions, signed decimals and negative zero prefixes',()=>{
 for(const [s,p,q] of [[' 7/5 ',7,5],['1.4',7,5],['-0.25',-1,4],['+1.250',5,4],['0',0,1],['99999999/3',33333333,1]])assert.deepEqual(parseRational(s),R(p,q));
});
test('Rational parser rejects markup, infinite values, exponents, enormous input and zero denominators',()=>{
 for(const s of ['1/0','Infinity','NaN','1e9','3/-2','0/0','<img src=x>','1/2/3','1.000000001','999999999','--3','1.',''])assert.equal(parseRational(s),null,s);
});
test('Rational arithmetic and comparison are exact, not approximate',()=>{
 assert.deepEqual(radd(R(1,3),R(1,6)),R(1,2));assert.deepEqual(rsub(R(1),R(2,3)),R(1,3));assert.deepEqual(rmul(R(3,7),R(7,9)),R(1,3));assert.deepEqual(rdiv(R(1,3),R(2,9)),R(3,2));assert.equal(rcompare(R(1,3),R(333,1000)),1);assert.deepEqual(rabs(R(-7,9)),R(7,9));assert.throws(()=>rdiv(R(1),R(0)),RangeError);
});
test('All target constructions start at [1,2], without asking for an irrational root',()=>{
 for(const t of targets){const row=bracketAt(t,0);assert.deepEqual(row.a,R(1));assert.deepEqual(row.b,R(2));assert.equal(row.hit,false);}
});
test('Every dyadic width is exactly 2^-n through 128 steps',()=>{
 for(const t of targets)for(const row of exactBrackets(t,128)){assert.deepEqual(row.width,R(1n,2n**BigInt(row.n)));assert.deepEqual(rsub(row.b,row.a),row.width);}
});
test('Exact squared brackets enclose d for every generated row, including beyond float precision',()=>{
 for(const t of targets)for(const row of exactBrackets(t,128)){assert.ok(squareCompare(row.a,t)<=0);assert.equal(squareCompare(row.b,t),1);}
});
test('The intervals are genuinely nested and nondegenerate',()=>{
 for(const t of targets){const rows=exactBrackets(t,96);for(let i=1;i<rows.length;i++){assert.ok(rcompare(rows[i].a,rows[i-1].a)>=0);assert.ok(rcompare(rows[i].b,rows[i-1].b)<=0);assert.equal(rcompare(rows[i].a,rows[i].b),-1);}}
});
test('Quadratic residual is nonnegative and bounded by four times the exact width',()=>{
 for(const t of targets)for(const row of exactBrackets(t,96)){assert.ok(rcompare(row.residual,R(0))>=0);assert.ok(rcompare(row.residual,rmul(R(4),row.width))<0);}
});
test('Rational endpoint equality is handled explicitly: a_n=3/2 for n>=1, positive width retained',()=>{
 for(const row of exactBrackets('rational',64).slice(1)){assert.deepEqual(row.a,R(3,2));assert.ok(row.hit);assert.deepEqual(row.b,radd(R(3,2),row.width));}
});
test('Nonsquare targets never claim an exact hit in the constructed prefix',()=>{
 for(const t of ['two','three'])assert.ok(exactBrackets(t,160).every(r=>!r.hit));
});
test('Bisection rejects invalid depth rather than hanging or allocating arbitrarily',()=>{
 for(const n of [-1,1.5,Infinity,NaN,513,'3'])assert.throws(()=>exactBrackets('two',n),RangeError);
});
test('Bisection implementation uses BigInt comparisons; no Math.sqrt selects branches',async()=>{
 const source=await readFile(new URL('../src/completeness-math.js',import.meta.url),'utf8');assert.ok(source.includes('mid*mid'));assert.ok(!source.includes('Math.sqrt'));
});
test('Each alleged too-low supremum gets a larger element of the set, exactly',()=>{
 for(const t of targets)for(let p=0;p<=40;p++){const q=R(p,31);if(squareCompare(q,t)>=0)continue;const v=upperBoundWitness(q,t);assert.equal(v.kind,'not-upper');assert.equal(rcompare(v.witness,q),1);assert.equal(squareCompare(v.witness,t),-1);assert.ok(rcompare(v.witness,R(0))>=0);}
});
test('Negative candidates fail because zero itself is in the set',()=>{
 const v=upperBoundWitness(R(-1,7),'two');assert.equal(v.kind,'not-upper');assert.deepEqual(v.witness,R(0));
});
test('Each upper but nonleast candidate gets a strictly smaller true upper bound',()=>{
 for(const t of targets)for(let p=15;p<=60;p++){const q=R(p,10);if(squareCompare(q,t)<=0)continue;const v=upperBoundWitness(q,t);assert.equal(v.kind,'not-least');assert.equal(rcompare(v.witness,q),-1);assert.equal(squareCompare(v.witness,t),1);assert.equal(rcompare(v.witness,R(0)),1);}
});
test('Exact 3/2 candidate is a least upper bound for d=9/4, not rounded equality',()=>{
 assert.equal(upperBoundWitness(R(3,2),'rational').kind,'least-upper');assert.equal(upperBoundWitness(R(141421356,100000000),'two').kind,'not-upper');assert.equal(upperBoundWitness(R(141421357,100000000),'two').kind,'not-least');
});
test('The smaller-upper-bound identity holds as a rational equality',()=>{
 const q=R(10,7),D=R(2),v=upperBoundWitness(q,'two');const lhs=rsub(rmul(v.witness,v.witness),D),gap=rsub(rmul(q,q),D),rhs=rdiv(rmul(gap,gap),rmul(R(4),rmul(q,q)));assert.deepEqual(lhs,rhs);
});
test('Cauchy tail certificate bounds widely separated tail indices for all presets',()=>{
 for(const t of targets)for(const N of [0,3,12,32])for(const offsets of [[0,0],[0,180],[7,120],[99,4]]){const c=cauchyCertificate(t,N,5,...offsets);assert.ok(rcompare(c.delta,c.bound)<=0);assert.equal(c.m,N+offsets[0]);assert.equal(c.n,N+offsets[1]);}
});
test('Strict epsilon guarantee does not silently use <= epsilon',()=>{
 assert.equal(cauchyCertificate('two',5,5).certified,false);assert.equal(cauchyCertificate('two',6,5).certified,true);assert.equal(cauchyCertificate('two',0,0).certified,false);assert.equal(cauchyCertificate('two',1,0).certified,true);
});
test('A non-certified coarse bound is not labelled failure of the Cauchy property',()=>{
 const c=cauchyCertificate('two',0,5,100,180);assert.equal(c.certified,false);assert.equal(rcompare(c.delta,c.epsilon),-1);assert.equal(c.suggestedN,6);
});
test('Far tail differences remain exact when Number values coincide',()=>{
 const c=cauchyCertificate('two',60,5,0,30);assert.equal(rnumber(c.a),rnumber(c.b));assert.equal(rcompare(c.delta,R(0)),1);
});
test('Cauchy parameters reject invalid or excessive indices',()=>{
 assert.throws(()=>cauchyCertificate('two',-1,5),RangeError);assert.throws(()=>cauchyCertificate('two',2,33),RangeError);assert.throws(()=>cauchyCertificate('two',510,5,3,10),RangeError);
});
test('BW selection preserves increasing original indices rather than sorting values',()=>{
 for(const parity of ['even','odd']){const data=subsequenceData('two',32,parity);const selected=data.filter(x=>x.selected);assert.ok(selected.every((d,i)=>d.index===2*i+(parity==='odd'?1:0)));assert.ok(selected.every(d=>rcompare(d.value,R(0))===(parity==='odd'?-1:1)));}
});
test('The alternating sequence stays bounded but has two distinct subsequential targets',()=>{
 for(const t of targets)for(const d of subsequenceData(t,32)){assert.ok(rcompare(rabs(d.value),R(2))<0);assert.ok(rcompare(rabs(d.value),R(1))>=0);}
});
test('The five directed edges form a strongly connected cycle without fake reverse arrows',()=>{
 assert.equal(completenessNodes.length,5);assert.equal(completenessEdges.length,5);
 for(const a of completenessNodes)for(const b of completenessNodes){const p=implicationPath(a.id,b.id);assert.equal(p.length===0,a.id===b.id);assert.ok(p.length<5);let cur=a.id;for(const id of p){const e=completenessEdges.find(e=>e.id===id);assert.equal(e.from,cur);cur=e.to;}assert.equal(cur,b.id);}
});
test('Invalid route endpoints cannot inject identifiers into the graph',()=>{
 assert.deepEqual(implicationPath('<script>','sup'),[]);assert.deepEqual(implicationPath('sup','?'),[]);
});
test('Universal field properties are distinct from the success of one rational-target example',()=>{
 for(const t of targets){assert.equal(domainVerdict('R',t).universal,true);assert.equal(domainVerdict('R',t).exampleHasLimit,true);assert.equal(domainVerdict('Q',t).universal,false);}assert.equal(domainVerdict('Q','two').exampleHasLimit,false);assert.equal(domainVerdict('Q','rational').exampleHasLimit,true);
});
test('All definitions require domain membership and NIP includes length-zero hypothesis',()=>{
 for(const d of Object.values(cpDefinitions))assert.ok(d.claim.includes('K'));assert.ok(cpDefinitions.nested.claim.includes('bₙ−aₙ→0'));assert.ok(cpDefinitions.bw.detail.includes('下标'));assert.ok(cpDefinitions.cauchy.detail.includes('独立'));
});
test('Each implication has a complete four-step proof and an explicit allowed premise',()=>{
 for(const edge of completenessEdges){const p=cpProofs[edge.id];assert.equal(p.steps.length,4);assert.ok(p.given.startsWith('只假设'));assert.ok(p.avoid.length>40);for(const step of p.steps)assert.equal(step.length,3);}
});
test('Proofs explicitly handle infinite occupancy, epsilon/2, and non-upper-bound bisection',()=>{
 assert.ok(cpProofs['nested-bw'].steps.flat().join('').includes('下标'));assert.ok(cpProofs['bw-cauchy'].steps.flat().join('').includes('ε/2'));assert.ok(cpProofs['cauchy-sup'].steps[0][1].includes('x₀−1'));assert.ok(cpProofs['cauchy-sup'].avoid.includes('等号'));
});
test('Authored less-than signs are escaped as text, not parsed as unknown HTML tags',()=>{
 assert.equal(cpEscape('x<d & n<m'),'x&lt;d &amp; n&lt;m');const page=completenessPage({...completenessDefaults(),screen:'explore',node:'sup'});assert.ok(page.includes('s−ε&lt;x'));assert.ok(page.includes('x²&lt;d}。给出'));assert.ok(!page.includes('x²<d}。给出'));assert.ok(!page.includes('s−ε<x'));const p=completenessPage({...completenessDefaults(),screen:'proof',edge:'nested-bw'});assert.ok(p.includes('n₁&lt;n₂'));
});
test('Six assessment questions have validated answers and explanatory feedback',()=>{
 assert.equal(cpQuestions.length,6);assert.equal(new Set(cpQuestions.map(q=>q.id)).size,6);for(const q of cpQuestions){assert.ok(q.correct>=0&&q.correct<q.options.length);assert.ok(q.reason.length>30);}
});
test('State defaults enter the map and are integrated with global routing',()=>{
 assert.deepEqual(defaults('completeness'),completenessDefaults());assert.deepEqual(parseState('#lab=completeness'),completenessDefaults());
});
test('Complete state, including mathematical controls, round-trips exactly',()=>{
 const s={...completenessDefaults(),screen:'proof',domain:'Q',target:'three',node:'bw',edge:'nested-bw',n:32,epsilon:20,m:120,k:180,proofStep:3,zoom:true,reference:false,from:'mono',to:'cauchy',candidate:'1.732'};assert.deepEqual(at(serializeCompletenessState(s)),s);assert.deepEqual(parseState(serializeState(s)),s);
});
test('Untrusted routes are clamped, whitelisted and do not carry arbitrary HTML',()=>{
 const s=at('#lab=completeness&screen=xxx&node=<img>&edge=bad&target=<script>&n=1e30&epsilon=-100&m=Infinity&k=1e8&proofStep=8&candidate=<img>&from=oops');assert.equal(s.screen,'map');assert.equal(s.node,'sup');assert.equal(s.target,'two');assert.equal(s.n,32);assert.equal(s.epsilon,0);assert.equal(s.m,3);assert.equal(s.k,180);assert.equal(s.proofStep,3);assert.equal(s.candidate,'7/5');
});
test('Share links do not include quiz answers or inferred progress',()=>{
 const s={...completenessDefaults(),answers:{domain:1},token:'secret',quizScore:6};const url=serializeCompletenessState(s);assert.ok(!url.includes('secret'));assert.ok(!url.includes('answers'));assert.ok(!url.includes('Score'));
});
test('CSV contains exact fractions, residuals and finite-data qualification',()=>{
 const csv=completenessCSV({...completenessDefaults(),n:32,domain:'Q'});assert.ok(csv.includes('NOT an infinite-process proof'));assert.ok(csv.includes('domain=Q'));assert.ok(csv.includes('1/4294967296'));assert.equal(csv.trim().split('\n').length,36);assert.ok(csv.includes('exact_root_hit'));
});
test('Graphs remain finite at all display extremes and every target/domain/view',()=>{
 for(const target of targets)for(const domain of ['R','Q'])for(const n of [0,1,5,32])for(const node of completenessNodes.map(n=>n.id)){const s={...completenessDefaults(),target,domain,n,node,zoom:true};for(const compact of [false,true]){const plot=completenessPlot(s,compact);assert.ok(plot.includes('<svg'));assert.ok(!/NaN|Infinity/.test(plot),`${target} ${domain} ${n} ${node}`);}}
});
test('Graph exposes independently clickable theorem nodes and implication edges on both layouts',()=>{
 const g=completenessGraph(completenessDefaults());assert.equal((g.match(/data-cp-node=/g)??[]).length,10);assert.equal((g.match(/data-cp-edge=/g)??[]).length,10);assert.ok(g.includes('tabindex="0"'));assert.ok(g.includes('cp-mobile-graph'));
});
test('All map nodes stay false in Q even when the chosen example has a rational endpoint',()=>{
 const g=completenessGraph({...completenessDefaults(),domain:'Q',target:'rational'});assert.equal((g.match(/不普遍成立/g)??[]).length,10);assert.equal((g.match(/cp-graph-node fails/g)??[]).length,5);
});
test('Reference marker is optional and explicitly outside Q for irrational targets',()=>{
 const s={...completenessDefaults(),domain:'Q'};assert.ok(cpBracketSVG(s).includes('∉ ℚ'));assert.ok(!cpBracketSVG({...s,reference:false}).includes('∉ ℚ'));assert.ok(cpBracketSVG({...s,target:'rational'}).includes('∈ ℚ'));
});
test('All four pages and all five lenses render with the shared journey and controls',()=>{
 for(const screen of ['map','explore','proof','challenge'])for(const node of completenessNodes.map(n=>n.id)){const html=completenessPage({...completenessDefaults(),screen,node});assert.ok(html.includes('cp-journey'));assert.ok(html.includes('cp-target'));assert.ok(html.includes('cp-title'));assert.ok(!/undefined|NaN/.test(html));}
});

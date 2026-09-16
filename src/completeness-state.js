import { completenessNodes, completenessEdges, completenessTargets, parseRational } from './completeness-math.js';
const pick=(v,a,f)=>a.includes(v)?v:f;
const integer=(v,f,lo,hi)=>v===null||v.trim()===''||!Number.isFinite(Number(v))?f:Math.min(hi,Math.max(lo,Math.round(Number(v))));
export function completenessDefaults(){return {lab:'completeness',screen:'map',node:'sup',edge:'sup-mono',domain:'R',target:'two',n:5,zoom:false,reference:true,epsilon:5,m:3,k:47,parity:'all',proofStep:0,from:'cauchy',to:'mono',candidate:'7/5'};}
export function parseCompletenessState(p){
 const s=completenessDefaults(),nodes=completenessNodes.map(n=>n.id);
 s.screen=pick(p.get('screen'),['map','explore','proof','challenge'],s.screen);s.node=pick(p.get('node'),nodes,s.node);s.edge=pick(p.get('edge'),completenessEdges.map(e=>e.id),s.edge);
 s.domain=pick(p.get('domain'),['R','Q'],s.domain);s.target=pick(p.get('target'),Object.keys(completenessTargets),s.target);
 for(const [key,max] of [['n',32],['epsilon',20],['m',120],['k',180],['proofStep',3]])s[key]=integer(p.get(key),s[key],0,max);
 s.zoom=p.get('zoom')==='1';s.reference=p.get('reference')!=='0';s.parity=pick(p.get('parity'),['all','even','odd'],s.parity);
 s.from=pick(p.get('from'),nodes,s.from);s.to=pick(p.get('to'),nodes,s.to);
 const candidate=p.get('candidate');if(candidate&&parseRational(candidate))s.candidate=candidate;return s;
}
export function serializeCompletenessState(s){const p=new URLSearchParams({lab:'completeness'});for(const k of ['screen','node','edge','domain','target','n','epsilon','m','k','parity','proofStep','from','to','candidate'])p.set(k,String(s[k]));p.set('zoom',s.zoom?'1':'0');p.set('reference',s.reference?'1':'0');return '#'+p;}

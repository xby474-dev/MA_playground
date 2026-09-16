import { ufFamilies, ufNodes } from './uniform-math.js';
export const ufRoutes=['normal-uniform','normal-absolute','uniform-pointwise','absolute-pointwise','uniform-continuous','uniform-integral','derivative-uniform','derivative-rule','pointwise-not-uniform','pointwise-not-continuous','pointwise-not-integral','uniform-not-derivative','uniform-not-normal','absolute-not-uniform','continuous-not-uniform','missing-anchor'];
export function uniformDefaults(){return {lab:'uniform',screen:'map',family:'power',domain:'closed',r:.8,N:12,eps:.1,x:.6,track:'fixed',view:'quantifiers',node:'uniform',edge:'pointwise-not-uniform',step:0,layer:'theorems',zoom:false};}
const pick=(x,v,f)=>v.includes(x)?x:f;
const num=(x,f,a,b)=>x===null||x.trim()===''||!Number.isFinite(Number(x))?f:Math.max(a,Math.min(b,Number(x)));
export function parseUniformState(p){const s=uniformDefaults();s.screen=pick(p.get('screen'),['map','workshop','proof','challenge'],s.screen);s.family=pick(p.get('family'),Object.keys(ufFamilies),s.family);s.domain=pick(p.get('domain'),['closed','open','restricted'],s.domain);s.r=num(p.get('r'),s.r,.2,.98);s.N=Math.round(num(p.get('N'),s.N,1,512));s.eps=num(p.get('eps'),s.eps,.01,.45);s.x=num(p.get('x'),s.x,0,1);s.track=pick(p.get('track'),['fixed','follow'],s.track);s.view=pick(p.get('view'),['quantifiers','integral','derivative','majorant'],s.view);s.node=pick(p.get('node'),ufNodes,s.node);s.edge=pick(p.get('edge'),ufRoutes,s.edge);s.layer=pick(p.get('layer'),['theorems','questions'],s.layer);s.step=Math.round(num(p.get('step'),0,0,3));s.zoom=p.get('zoom')==='1';return s;}
export function serializeUniformState(s){const p=new URLSearchParams({lab:'uniform'});for(const k of ['screen','family','domain','r','N','eps','x','track','view','node','edge','layer','step'])p.set(k,String(typeof s[k]==='number'?Number(s[k].toFixed(8)):s[k]));p.set('zoom',s.zoom?'1':'0');return '#'+p;}
export const ufScenarios={
 powerClosed:{label:'反例 · 包含端点',family:'power',domain:'closed',view:'quantifiers',track:'follow'},
 powerOpen:{label:'边界 · 去掉端点',family:'power',domain:'open',view:'quantifiers',track:'follow'},
 powerCompact:{label:'正例 · 缩到 [0,r]',family:'power',domain:'restricted',r:.8,view:'quantifiers',track:'follow'},
 geoCompact:{label:'正例 · 统一几何上界',family:'geometric',domain:'restricted',r:.8,view:'quantifiers',track:'follow'},
 geoOpen:{label:'反例 · 接近 1',family:'geometric',domain:'open',view:'quantifiers',track:'follow'},
 geoClosed:{label:'边界 · 端点直接发散',family:'geometric',domain:'closed',view:'quantifiers',track:'follow'},
 alternating:{label:'一致但不正规',family:'alternating',domain:'closed',view:'majorant',track:'follow'},
 spike:{label:'反例 · 面积不消失',family:'spike',domain:'closed',view:'integral',track:'follow'},
 wave:{label:'反例 · 高度不控制斜率',family:'wave',domain:'closed',view:'derivative',track:'fixed',x:.5},
 drift:{label:'边界 · 别忘一点收敛',family:'drift',domain:'closed',view:'derivative',track:'fixed',x:0}
};
export function applyUniformScenario(s,key){const v=ufScenarios[key];if(!v)return false;const {label,...data}=v;Object.assign(s,data,{zoom:false});return true;}


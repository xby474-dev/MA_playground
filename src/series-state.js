import { seriesFamilies, seriesMethods } from './series-math.js';
export const seRoutes=['ratio-root','root-absolute','limit-comparison','comparison-absolute','integral-absolute','leib-convergence','absolute-convergence','convergence-zero','root-not-ratio','absolute-not-root','comparison-not-limit','convergence-not-absolute','root-integral','leib-absolute','convergence-not-leib','zero-not-convergence'];
export function seriesDefaults(){return {lab:'series',screen:'map',family:'power',p:2,q:.5,signed:false,ref:'natural',N:32,probe:12,node:'root',edge:'ratio-root',layer:'theorems',view:'conditions',step:0};}
const pick=(x,list,fallback)=>list.includes(x)?x:fallback;
const num=(x,fallback,lo,hi)=>x===null||x.trim()===''||!Number.isFinite(Number(x))?fallback:Math.min(hi,Math.max(lo,Number(x)));
export function parseSeriesState(params){const s=seriesDefaults();s.screen=pick(params.get('screen'),['map','workshop','proof','challenge'],s.screen);s.family=pick(params.get('family'),Object.keys(seriesFamilies),s.family);s.p=num(params.get('p'),2,.25,3);s.q=num(params.get('q'),.5,.35,1.2);s.signed=params.get('signed')==='1';s.ref=pick(params.get('ref'),['natural','harmonic','square','geometric'],s.ref);s.N=Math.round(num(params.get('N'),32,8,256));s.probe=Math.min(s.N,Math.round(num(params.get('probe'),12,1,256)));s.node=pick(params.get('node'),seriesMethods,s.node);s.edge=pick(params.get('edge'),seRoutes,s.edge);s.layer=pick(params.get('layer'),['theorems','questions'],s.layer);s.view=pick(params.get('view'),['conditions','sums'],s.view);s.step=Math.round(num(params.get('step'),0,0,3));return s;}
export function serializeSeriesState(s){const p=new URLSearchParams({lab:'series'});for(const k of ['screen','family','p','q','ref','N','probe','node','edge','layer','view','step'])p.set(k,String(typeof s[k]==='number'?Number(s[k].toFixed(4)):s[k]));p.set('signed',s.signed?'1':'0');return '#'+p;}
export const seScenarios={
 geometric:{label:'正例 · 几何衰减',family:'geometric',q:.5,p:2,signed:false,ref:'natural'},
 square:{label:'边界 · 1/n² 收敛',family:'power',p:2,signed:false,ref:'natural'},
 harmonic:{label:'边界 · 1/n 发散',family:'power',p:1,signed:false,ref:'natural'},
 paired:{label:'反例 · 齿状但可求和',family:'paired',q:.5,signed:false,ref:'natural'},
 wavy:{label:'反例 · 夹住但商不收敛',family:'wavy',p:2,signed:false,ref:'natural'},
 altHarmonic:{label:'交错调和 · 条件收敛',family:'power',p:1,signed:true,ref:'natural'},
 altGeometric:{label:'交错几何 · 绝对收敛',family:'geometric',q:.5,signed:true,ref:'natural'},
 altPaired:{label:'绝对收敛 · 幅度不单调',family:'paired',q:.5,signed:true,ref:'natural'},
 irregular:{label:'仍收敛 · Leibniz 不适用',family:'cancellation',signed:true,ref:'natural'},
 sparse:{label:'含零项 · 比值未定义',family:'sparse',signed:false,ref:'square'},
 logConverges:{label:'对数正例 · p=2',family:'logarithmic',p:2,signed:false,ref:'harmonic'},
 logDiverges:{label:'更小仍发散 · p=1',family:'logarithmic',p:1,signed:false,ref:'harmonic'},
 smallLimit:{label:'商趋零 · 单向可用',family:'power',p:3,signed:false,ref:'square'},
 wrongDirection:{label:'小于发散参照，不够',family:'power',p:2,signed:false,ref:'harmonic'},
 growing:{label:'通项不趋零',family:'geometric',q:1.1,signed:true,ref:'natural'}
};
export function applySeriesScenario(s,key){const preset=seScenarios[key];if(!preset)return false;const {label,...data}=preset;Object.assign(s,data);return true;}

import { tf, taylorFunctions, TAYLOR_MAX } from './taylor-math.js';
const pick=(x,options,fallback)=>options.includes(x)?x:fallback;
const num=(v,f,lo,hi)=>v===null||v.trim()===''||!Number.isFinite(Number(v))?Math.max(lo,Math.min(hi,f)):Math.max(lo,Math.min(hi,Number(v)));
export function taylorDefaults(){return {lab:'taylor',screen:'grow',fn:'exp',a:0,n:4,p:0,h:.8,span:2,epsilon:3,ghost:true,proof:'coefficients',step:0};}
export function parseTaylorState(params){
 const s=taylorDefaults();s.screen=pick(params.get('screen'),['grow','error','boundary','proof','challenge'],s.screen);s.fn=pick(params.get('fn'),Object.keys(taylorFunctions),s.fn);
 s.a=num(params.get('a'),0,...tf(s.fn).range);s.n=Math.round(num(params.get('n'),4,0,TAYLOR_MAX));s.p=num(params.get('p'),params.has('n')?s.n:0,0,s.n);
 s.span=num(params.get('span'),2,.25,5);s.h=num(params.get('h'),.8,-s.span,s.span);s.epsilon=Math.round(num(params.get('epsilon'),3,1,8));s.ghost=params.get('ghost')!=='0';
 s.proof=pick(params.get('proof'),['coefficients','remainder','convergence','flat'],s.proof);s.step=Math.round(num(params.get('step'),0,0,3));return s;
}
export function serializeTaylorState(s){const p=new URLSearchParams({lab:'taylor'});for(const k of ['screen','fn','a','n','p','h','span','epsilon','proof','step'])p.set(k,String(typeof s[k]==='number'?Number(s[k].toFixed(5)):s[k]));p.set('ghost',s.ghost?'1':'0');return '#'+p;}
export const taylorScenarios = {
 local:{label:'先看：一项一项长出来',fn:'exp',a:0,n:4,h:.8,span:2,screen:'grow'},
 zero:{label:'升阶却没动？',fn:'sin',a:0,n:2,h:1,span:2.5,screen:'grow'},
 nonmonotone:{label:'加一阶，反而更差',fn:'exp',a:0,n:1,h:-2,span:2.5,screen:'boundary'},
 outside:{label:'越过收敛半径',fn:'reciprocal',a:0,n:6,h:1.2,span:2,screen:'boundary'},
 edge:{label:'对数的右端点',fn:'log',a:0,n:6,h:1,span:2,screen:'boundary'},
 flat:{label:'无穷光滑，仍不相等',fn:'flat',a:0,n:8,h:.8,span:1.5,screen:'boundary'}
};
export function applyTaylorScenario(s,key){const preset=taylorScenarios[key];if(!preset)return false;const {label,...params}=preset;Object.assign(s,params,{p:preset.n});return true;}

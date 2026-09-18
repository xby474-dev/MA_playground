import { lmMaps, lmOuters, lmNorm, lmScale, lmUnit } from './linear-math.js';
export const lmSteps=['local','columns','chain','projection'];
export function linearDefaults(){return {lab:'linear',screen:'explore',step:'local',map:'cubic',outer:'bend',px:.6,py:.2,hx:.62,hy:.38,yx:1.25,yy:.65,angle:35,lambda:.5,basis:0,column:0,normalized:true,merged:false,wrong:false,proofStep:0};}
const choice=(v,vs,d)=>vs.includes(v)?v:d;
const number=(p,k,d,lo,hi)=>{const text=p.get(k);return text===null||text.trim()===''||!Number.isFinite(Number(text))?d:Math.min(hi,Math.max(lo,Number(text)));};
export function lmLimitH(h){const r=lmNorm(h);return r>1.2?lmScale(h,1.2/r):h;}
export function parseLinearState(p){const s=linearDefaults();s.screen=choice(p.get('screen'),['explore','proof','challenge'],s.screen);s.step=choice(p.get('step'),lmSteps,s.step);s.map=choice(p.get('map'),Object.keys(lmMaps),s.map);s.outer=choice(p.get('outer'),Object.keys(lmOuters),s.outer);
 for(const k of ['px','py','yx','yy'])s[k]=number(p,k,s[k],-1.5,1.5);
 for(const k of ['hx','hy'])s[k]=number(p,k,s[k],-1.2,1.2);
 [s.hx,s.hy]=lmLimitH([s.hx,s.hy]);s.angle=number(p,'angle',s.angle,0,360);s.lambda=number(p,'lambda',s.lambda,0,1);s.basis=number(p,'basis',0,-90,90);s.column=Math.round(number(p,'column',0,0,2));s.proofStep=Math.floor(number(p,'proofStep',0,0,3));s.normalized=p.get('normalized')!=='0';s.merged=p.get('merged')==='1';s.wrong=p.get('wrong')==='1';return s;}
export function serializeLinearState(s){const p=new URLSearchParams({lab:'linear',screen:s.screen,step:s.step,map:s.map,outer:s.outer});
 for(const k of ['px','py','hx','hy','yx','yy','angle','lambda','basis','column','proofStep'])p.set(k,String(Number(s[k].toFixed(7))));
 if(!s.normalized)p.set('normalized','0');if(s.merged)p.set('merged','1');if(s.wrong)p.set('wrong','1');return '#'+p;}
export function lmSetLength(s,r){const h=[s.hx,s.hy],old=lmNorm(h),dir=old?lmScale(h,1/old):lmUnit(s.basis+(s.column===2?90:0));[s.hx,s.hy]=lmScale(dir,Math.min(1.2,Math.max(0,r)));}
export function lmChooseColumn(s,j){s.column=j;const r=lmNorm([s.hx,s.hy])||.5;[s.hx,s.hy]=lmScale(lmUnit(s.basis+(j===2?90:0)),r);}

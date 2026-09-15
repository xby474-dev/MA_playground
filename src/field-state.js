import { STAGES } from './field-math.js';
export function fieldDefaults() {
  return {lab:'fields',tab:'explore',stage:'green',phase:0,a:.6,b:1,c:.5,L:2,h:1.15,n:3,
    orientation:1,cell:1,slice:0,cancel:0,arrows:true,viewAngle:0,hole:false};
}
const finite=(p,key,def,lo,hi)=>{const raw=p.get(key),v=Number(raw);return raw===null||raw.trim()===''||!Number.isFinite(v)?def:Math.min(hi,Math.max(lo,v));};
export function parseFieldState(p) {
  const s=fieldDefaults();
  for(const [key,allowed] of [['tab',['explore','proof','quiz']],['stage',STAGES]])if(allowed.includes(p.get(key)))s[key]=p.get(key);
  for(const [key,lo,hi] of [['phase',0,3],['a',-2,2],['b',-2,2],['c',0,1],['L',1,3],['h',0,2],['n',2,6],['cell',0,215],['slice',0,5],['cancel',0,1],['viewAngle',-180,180]])s[key]=finite(p,key,s[key],lo,hi);
  for(const key of ['phase','n','cell','slice'])s[key]=Math.round(s[key]);
  s.cell=Math.min(s.n**(s.stage==='gauss'?3:2)-1,s.cell);s.slice=Math.min(s.n-1,s.slice);
  s.orientation=p.get('orientation')==='-1'?-1:1;s.arrows=p.get('arrows')!=='0';s.hole=p.get('hole')==='1';
  return s;
}
export function serializeFieldState(s) {
  const p=new URLSearchParams();
  for(const key of Object.keys(fieldDefaults())) {
    const value=s[key];p.set(key,typeof value==='boolean'?(value?'1':'0'):String(value));
  }
  return '#'+p.toString();
}

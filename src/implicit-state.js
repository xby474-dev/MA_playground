import { ipClamp, ipCurves, ipSurfaces, ipNorm, ipScale } from './implicit-math.js';
export const ipSteps=['curve','condition','surface','vector'];
export function implicitDefaults(){return {lab:'implicit',screen:'explore',step:'curve',curve:'circle',dep:'y',theta:55,t:.5,delta:.24,surface:'bowl',sx:.25,sy:.15,hx:.32,hy:.2,vx:.35,vy:.25,vhx:.22,vhy:-.12,coupling:1,progress:0,camera:38,proofStep:0};}
export function ipLimitVector(v,max=.65){const n=ipNorm(v);return n>max?ipScale(v,max/n):v;}
export function ipNormalize(s){if(s.surface==='sphere'){[s.sx,s.sy]=ipLimitVector([s.sx,s.sy],.94);}[s.hx,s.hy]=ipLimitVector([s.hx,s.hy]);[s.vhx,s.vhy]=ipLimitVector([s.vhx,s.vhy]);if(s.coupling===0){s.vx=0;s.vy=0;}return s;}
export function parseImplicitState(p){const s=implicitDefaults(),pick=(k,opts)=>{if(opts.includes(p.get(k)))s[k]=p.get(k);};pick('screen',['explore','proof','challenge']);pick('step',ipSteps);pick('curve',Object.keys(ipCurves));pick('surface',Object.keys(ipSurfaces));pick('dep',['x','y']);
 for(const [k,lo,hi] of [['theta',0,360],['t',-1.1,1.1],['delta',-.65,.65],['sx',-1,1],['sy',-1,1],['hx',-.65,.65],['hy',-.65,.65],['vx',-.7,.7],['vy',-.7,.7],['vhx',-.65,.65],['vhy',-.65,.65],['coupling',0,2],['progress',0,3],['camera',-180,180],['proofStep',0,3]]){const v=p.get(k);if(v!==null&&v.trim()!==''&&Number.isFinite(Number(v)))s[k]=ipClamp(Number(v),lo,hi);}
 s.proofStep=Math.floor(s.proofStep);if(s.coupling>0)s.coupling=Math.max(.02,s.coupling);return ipNormalize(s);}
export function serializeImplicitState(s){const p=new URLSearchParams();for(const [k,v] of Object.entries(s))p.set(k,typeof v==='number'?String(Number(v.toFixed(8))):v);return '#'+p;}

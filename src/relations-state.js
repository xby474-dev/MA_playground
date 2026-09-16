import { modelIds, relations } from './relations-math.js';
const pick=(v,arr,f)=>arr.includes(v)?v:f;
const number=(v,f,lo,hi)=>v===null||v.trim()===''||!Number.isFinite(Number(v))?f:Math.min(hi,Math.max(lo,Number(v)));
export function relationsDefaults(){return {lab:'differentiability',mode:'relations',screen:'map',edge:'s-d',fn:'bowl',stage:0,angle:45,q:.65,sign:1,zoom:true,plane:true,view:'surface',metric:'ratio',reveal:false,sequence:8,challenge:'ridge'};}
export function parseRelationsState(p){
  const s=relationsDefaults();
  s.screen=pick(p.get('screen'),['map','case','challenge'],s.screen);
  s.edge=pick(p.get('edge'),relations.map(r=>r.id),s.edge);
  s.fn=pick(p.get('fn'),modelIds,s.fn);
  s.stage=Math.round(number(p.get('stage'),s.stage,0,4));
  s.angle=number(p.get('angle'),s.angle,0,360);s.q=number(p.get('q'),s.q,0,4);
  s.sign=p.get('sign')==='-1'?-1:1;s.zoom=p.get('zoom')!=='0';s.plane=p.get('plane')!=='0';
  s.view=pick(p.get('view'),['surface','section','derivative'],s.view);s.metric=pick(p.get('metric'),['ratio','raw','value'],s.metric);
  s.reveal=p.get('reveal')==='1';s.sequence=Math.round(number(p.get('n'),s.sequence,1,120));
  s.challenge=pick(p.get('challenge'),['ridge','rational','radial'],s.challenge);return s;
}
export function serializeRelationsState(s){const p=new URLSearchParams({lab:s.lab,mode:'relations',screen:s.screen,edge:s.edge,fn:s.fn,stage:String(s.stage),angle:String(s.angle),q:s.q.toFixed(3),sign:String(s.sign),zoom:s.zoom?'1':'0',plane:s.plane?'1':'0',view:s.view,metric:s.metric,reveal:s.reveal?'1':'0',n:String(s.sequence),challenge:s.challenge});return '#'+p.toString();}

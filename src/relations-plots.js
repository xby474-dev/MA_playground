import { properties, getModel, value, sample, partials, direction, uniformBound, sliceSegments, sequencePair } from './relations-math.js';
import { format } from './math.js';
const GREEN='#246853',ORANGE='#b76542',BLUE='#59788e';
const line=(x1,y1,x2,y2,attrs='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${attrs}/>`;
const text=(x,y,body,attrs='')=>`<text x="${x}" y="${y}" ${attrs}>${body}</text>`;
const path=(pts,attrs='')=>`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" ${attrs}/>`;
const svg=(w,h,label,body)=>`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
export function relationGraph(s,suffix='main'){
 const p=getModel(s.fn).properties;
 const node=(id,x,y)=>{const def=properties.find(p=>p.id===id),cls=s.reveal?(p[id]?'yes':'no'):'unknown';return `<g class="rel-node ${cls}" role="button" tabindex="0" data-r-property="${id}" aria-label="${def.name}：${s.reveal?(p[id]?'本例成立':'本例不成立'):'待判断'}；点击查看定义"><rect x="${x-94}" y="${y-36}" width="188" height="72" rx="12"/>${text(x-72,y-9,def.symbol,'class="rel-node-code"')}${text(x-28,y-9,def.name,'class="rel-node-name"')}${text(x,y+16,s.reveal?(p[id]?'✓ 本例成立':'× 本例不成立'):'? 先判断当前函数','text-anchor="middle" class="rel-node-status"')}</g>`;};
 const edge=(id,d,x,y,truth)=>`<g class="rel-edge ${truth?'theorem':'inverse'} ${s.edge===id?'selected':''}" role="button" tabindex="0" data-r-edge="${id}" aria-label="${({ 's-d':'偏导连续推出可微，为什么成立','d-p':'可微推出偏导存在，为什么成立','d-c':'可微推出连续，为什么成立','d-s':'可微不能推出偏导连续，反例在哪里','p-d':'偏导存在不能推出可微，反例在哪里','c-d':'连续不能推出可微，反例在哪里','p-c':'偏导存在不能推出连续，反例在哪里','c-p':'连续不能推出偏导存在，反例在哪里'})[id]}"><path d="${d}" class="rel-hit"/><path d="${d}" class="rel-arrow" marker-end="url(#rel-${truth?'solid':'dashed'}-${suffix})"/><g transform="translate(${x},${y})"><rect x="-59" y="-16" width="118" height="32" rx="16"/>${text(0,4,truth?'→ 为什么成立':'⇏ 反例在哪里','text-anchor="middle"')}</g></g>`;
 let b=`<defs><marker id="rel-solid-${suffix}" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9Z" fill="${GREEN}"/></marker><marker id="rel-dashed-${suffix}" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M1 1 L8 5 L1 9" fill="none" stroke="#a07860" stroke-width="1.4"/></marker></defs>`;
 b+=edge('s-d','M426 105 L426 208',355,158,true);
 b+=edge('d-s','M474 208 C622 180 622 135 474 105',575,155,false);
 b+=edge('d-p','M380 271 L214 376',321,329,true);
 b+=edge('d-c','M520 271 L686 376',579,329,true);
 b+=edge('p-d','M147 376 C96 294 162 228 352 243',181,268,false);
 b+=edge('c-d','M753 376 C804 294 738 228 548 243',719,268,false);
 b+=edge('p-c','M267 404 L630 404',450,382,false);
 b+=edge('c-p','M633 443 C543 491 357 491 267 443',450,483,false);
 b+=node('S',450,69)+node('D',450,245)+node('P',170,413)+node('C',730,413);
 const mobileNode=id=>{const d=properties.find(x=>x.id===id);return `<button class="rel-mobile-node ${s.reveal?(p[id]?'yes':'no'):'unknown'}" data-r-property="${id}"><b>${d.symbol}</b> ${d.name}<small>${s.reveal?(p[id]?'✓ 本例成立':'× 本例不成立'):'? 待判断'}</small></button>`;};
 const mobileEdge=(id,label,solid)=>`<button class="rel-mobile-edge ${solid?'theorem':'inverse'}" data-r-edge="${id}">${label} <small>${solid?'为什么成立':'反例在哪里'}</small></button>`;
 return `<div class="rel-desktop-graph"><svg viewBox="0 0 900 525" role="group" aria-label="偏导、连续、可微、偏导连续的有向关系图；实线为定理，虚线为不成立的逆推" xmlns="http://www.w3.org/2000/svg">${b}</svg></div><div class="rel-mobile-graph" aria-label="小屏幕关系树">${mobileNode('S')}${mobileEdge('s-d','↓',true)}${mobileNode('D')}<div class="rel-mobile-fork">${mobileEdge('d-p','↙ 可微 → 偏导',true)}${mobileEdge('d-c','↘ 可微 → 连续',true)}</div><div class="rel-mobile-fork">${mobileNode('P')}${mobileNode('C')}</div><p class="rel-muted">反过来走？下面五条都不能推出。</p><div class="rel-mobile-inverses">${[['d-s','D ⇏ C∂'],['p-d','P ⇏ D'],['c-d','C ⇏ D'],['p-c','P ⇏ C'],['c-p','C ⇏ P']].map(([id,label])=>mobileEdge(id,label,false)).join('')}</div></div><button class="rel-bounded-edge" data-r-edge="bounded-c"><span>+ 教材中的附加条件</span><strong>邻域内全部偏导存在且有界 <b>→</b> 连续</strong><small>为什么成立 ↗</small></button>`;
}
export function errorSVG(s){
 const w=700,h=240,l=54,r=670,t=22,b=178,log=s.fn==='ratio'&&s.metric==='ratio';
 const get=(q,a)=>{const v=sample(s.fn,10**-q,a,s.sign);return s.metric==='value'?v.f:s.metric==='raw'?(v.raw??Math.abs(v.f)):(v.ratio??v.reference);};
 const data=Array.from({length:181},(_,i)=>{const q=4*i/180;return {q,v:get(q,s.angle),diagonal:get(q,45),bound:s.metric==='ratio'?uniformBound(s.fn,10**-q):uniformBound(s.fn,10**-q)*10**-q};});
 const values=data.flatMap(d=>s.metric==='value'?[d.v,d.diagonal]:[d.v,d.diagonal,d.bound]);
 const vmax=log?10000:Math.max(.6,...values)*1.08, vmin=log?.0001:(s.metric==='value'?Math.min(-.12,...values)*1.1:0);
 const X=q=>l+q/4*(r-l),Y=v=>log?b-(Math.log10(Math.max(v,.0001))+4)/8*(b-t):b-(v-vmin)/(vmax-vmin)*(b-t);
 let body='<defs><clipPath id="rel-error-clip"><rect x="54" y="20" width="616" height="161"/></clipPath></defs>';
 for(let i=0;i<=4;i++){const v=log?10**(-4+2*i):vmin+(vmax-vmin)*i/4;body+=line(l,Y(v),r,Y(v),'stroke="#e6ece2"')+text(l-9,Y(v)+4,format(v,2),'text-anchor="end" fill="#697a6a" font-size="10"');body+=text(X(i),b+21,['1','10⁻¹','10⁻²','10⁻³','10⁻⁴'][i],'text-anchor="middle" font-size="11" fill="#697a6a"');}
 const label=s.metric==='value'?'f(x,y)':getModel(s.fn).gradient?(s.metric==='raw'?'|R|':'|R| / ρ'):(s.metric==='raw'?'|f|（非微分误差）':'|f| / ρ（相对高度）');
 body+=text(l,t-7,label,'font-size="11" fill="#496953"');
 body+='<g clip-path="url(#rel-error-clip)">';
 if(s.metric!=='value')body+=path(data.map(d=>[X(d.q),Y(d.bound)]),'stroke="#8e9d8e" stroke-width="1.4" stroke-dasharray="2 4"');
 body+=path(data.map(d=>[X(d.q),Y(d.diagonal)]),`stroke="${ORANGE}" stroke-width="1.8" stroke-dasharray="6 5"`);
 body+=path(data.map(d=>[X(d.q),Y(d.v)]),`stroke="${GREEN}" stroke-width="2.8"`);
 body+=line(X(s.q),t,X(s.q),b,'stroke="#839c85" stroke-dasharray="3 4"');
 body+=`<circle cx="${X(s.q)}" cy="${Y(get(s.q,s.angle))}" r="4.5" fill="${GREEN}" stroke="white" stroke-width="2"/></g>`;
 body+=text(l,h-15,`绿色：当前方向 · 橙色虚线：45°${s.metric==='value'?'':' · 灰色点线：解析上界'}`,'font-size="10" fill="#647566"');
 body+=text(r,b+43,`ρ → 0 · 横轴对数刻度${log?'；纵轴对数刻度，0 在底部截断':''} · 不包含原点`,'text-anchor="end" font-size="10" fill="#6b7b69"');
 return svg(w,h,'函数值或误差随位移缩小的有限采样曲线；解析结论在相邻文字与证明中',body);
}
export function sectionSVG(s){
 const e=s.zoom?1.7*10**-s.q:1.1,w=700,h=350,l=60,r=664,t=35,b=292;
 const segs=sliceSegments(s.fn,s.angle,e),all=segs.flat();
 const max=Math.max(.02,...all.flatMap(p=>[Math.abs(p.z),s.plane?Math.abs(p.L??0):0]))*1.18;
 const X=v=>l+(v/e+1)/2*(r-l),Y=v=>(t+b)/2-v/max*(b-t)/2;
 let body='';
 for(const u of [-1,-.5,0,.5,1]){body+=line(X(u*e),t,X(u*e),b,'stroke="#e2e9df"')+line(l,Y(u*max),r,Y(u*max),'stroke="#e2e9df"');body+=text(X(u*e),b+19,format(u*e,2),'text-anchor="middle" font-size="10" fill="#647665"');}
 body+=line(l,Y(0),r,Y(0),'stroke="#91a18f"')+line(X(0),t,X(0),b,'stroke="#91a18f"');
 if(s.plane&&getModel(s.fn).gradient){const a=direction(e,s.angle,-1),z=getModel(s.fn).gradient[0]*a.x+getModel(s.fn).gradient[1]*a.y;body+=line(X(-e),Y(z),X(e),Y(-z),`stroke="${BLUE}" stroke-width="1.8" stroke-dasharray="7 5"`);}
 for(const pts of segs)body+=path(pts.map(p=>[X(p.t),Y(p.z)]),`stroke="${GREEN}" stroke-width="2.5"`);
 if(s.fn==='ratio'){const pp=sample(s.fn,1,s.angle);if(Math.abs(pp.f)>1e-12)body+=`<circle cx="${X(0)}" cy="${Y(pp.f)}" r="5" fill="white" stroke="${GREEN}" stroke-width="2"/>`;}
 body+=`<circle cx="${X(0)}" cy="${Y(0)}" r="4" fill="#243b2e"/>`;
 const v=sample(s.fn,10**-s.q,s.angle,s.sign);
 body+=`<circle cx="${X(s.sign*v.rho)}" cy="${Y(v.f)}" r="5" fill="${ORANGE}" stroke="white" stroke-width="2"/>`;
 body+=text(l,20,`截面： (x, y) = t (cos ${s.angle}°, sin ${s.angle}°)`,'font-size="12" fill="#3e6652"');
 body+=text(r,h-13,'横轴 t 可正可负 · 实点为 f(0,0) · 空心点表示路径缺口','text-anchor="end" font-size="11" fill="#66766a"');
 body+=text(l+6,Y(max*.9),`高度刻度 ±${format(max,2)}`,'font-size="10" fill="#697a6a"');
 return svg(w,h,'双侧截面，区分原点函数值和路径极限；虚线为候选线性映射（若存在）',body);
}
export function derivativeSVG(s){
 const w=700,h=350,l=63,r=660,t=47,b=284;
 const seq=['oscillation','radial','ratio'].includes(s.fn);
 let body='';
 if(seq){
   const bound=s.fn==='ratio'?Math.max(8,s.sequence)*1.12:1.35;
   const X=n=>l+(n-1)/119*(r-l),Y=v=>(t+b)/2-v/bound*(b-t)/2;
   for(const v of [-bound,0,bound])body+=line(l,Y(v),r,Y(v),'stroke="#dce5d8"')+text(l-10,Y(v)+4,format(v,2),'text-anchor="end" font-size="10" fill="#657568"');
   // Authored analytic sequences. We display exact identities, not an estimated limit.
   for(let n=1;n<=s.sequence;n++){
     const p=sequencePair(s.fn,n);for(const [a,c] of [[p.a,GREEN],[p.b,ORANGE]])body+=`<circle cx="${X(n)}" cy="${Y(a.exact)}" r="${n===s.sequence?5:2.1}" fill="${c}" opacity="${n===s.sequence?1:.66}"/>`;
   }
   for(const n of [1,30,60,90,120])body+=text(X(n),b+23,String(n),'text-anchor="middle" font-size="10" fill="#657568"');
   body+=text(l,23,s.fn==='ratio'?'偏导沿 (0, ±1/n)：分别为 ±n，无界':'两列趋于原点的点：fₓ 分别恒为 −1 和 +1','font-size="12" fill="#38644e"');
   body+=text(r,h-20,'横轴 n 增加 ⇒ 点趋近原点 · 恒等式覆盖所有正整数 n','text-anchor="end" font-size="11" fill="#637565"');
 }else{
   const extent=s.zoom?1.7*10**-s.q:1,arr=[];
   for(let i=0;i<=180;i++){const tt=extent*(2*i/180-1),p=direction(Math.abs(tt),s.angle,tt<0?-1:1);arr.push({t:tt,d:partials(s.fn,p.x,p.y),i});}
   const max=Math.max(.6,...arr.flatMap(a=>a.d.map(v=>Math.abs(v??0))))*1.2;
   const X=v=>l+(v/extent+1)/2*(r-l),Y=v=>(t+b)/2-v/max*(b-t)/2;
   for(const u of [-1,-.5,0,.5,1]){body+=line(l,Y(u*max),r,Y(u*max),'stroke="#e2e8de"')+text(l-10,Y(u*max)+4,format(u*max,2),'text-anchor="end" font-size="10" fill="#637567"');body+=text(X(u*extent),b+22,format(u*extent,2),'text-anchor="middle" font-size="10" fill="#637567"');}
   for(let j=0;j<2;j++){
     let seg=[];const flush=()=>{if(seg.length>1)body+=path(seg,`stroke="${j?ORANGE:GREEN}" stroke-width="2.4" ${j?'stroke-dasharray="6 4"':''}`);seg=[];};
     for(const a of arr){if(a.d[j]===null||(!getModel(s.fn).properties.S&&a.i===90)){flush();continue;}seg.push([X(a.t),Y(a.d[j])]);}flush();
     const d=partials(s.fn,0,0)[j];if(d!==null)body+=`<circle cx="${X(0)}" cy="${Y(d)}" r="4.3" fill="${j?ORANGE:GREEN}" stroke="white" stroke-width="1.5"/>`;
   }
   body+=text(l,23,`沿 θ=${s.angle}° 的截面查看邻近点偏导`,'font-size="12" fill="#3f6552"');
   body+=text(r,h-20,'绿色 fₓ · 橙色虚线 fᵧ · 原点实点仅在偏导存在时显示','text-anchor="end" font-size="11" fill="#687967"');
 }
 return svg(w,h,'偏导函数的解析取值示意；不把有限样本当作偏导连续性证明',body);
}
/** CPU projection, no GPU/CDN. Drawing never feeds the mathematical engine. */
export class RelationSurface {
 constructor(canvas,getState){
  this.canvas=canvas;this.getState=getState;this.ctx=canvas.getContext('2d');this.yaw=-.72;this.pitch=.55;this.abort=new AbortController();const options={signal:this.abort.signal};let drag=null;
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);},options);
  canvas.addEventListener('pointermove',e=>{if(!drag)return;this.yaw+=(e.clientX-drag.x)*.009;this.pitch=Math.max(.12,Math.min(1.2,this.pitch+(e.clientY-drag.y)*.007));drag={x:e.clientX,y:e.clientY};this.draw();},options);
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,()=>drag=null,options);
  canvas.addEventListener('keydown',e=>{const changes={ArrowLeft:[-.12,0],ArrowRight:[.12,0],ArrowUp:[0,-.08],ArrowDown:[0,.08]};if(e.key==='Home'){e.preventDefault();this.reset();}else if(changes[e.key]){e.preventDefault();this.yaw+=changes[e.key][0];this.pitch=Math.max(.12,Math.min(1.2,this.pitch+changes[e.key][1]));this.draw();}},options);
  this.resize=new ResizeObserver(()=>this.draw());this.resize.observe(canvas);this.draw();
 }
 destroy(){this.abort.abort();this.resize.disconnect();}
 reset(){this.yaw=-.72;this.pitch=.55;this.draw();}
 draw(){
  const c=this.canvas,ctx=this.ctx,s=this.getState();if(!ctx)return;const w=c.clientWidth,h=c.clientHeight;if(!w||!h)return;
  const dpr=Math.min(window.devicePixelRatio||1,2);if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.fillStyle='#f6faf5';ctx.fillRect(0,0,w,h);
  const rho=10**-s.q,domain=s.zoom?1.7*rho:1.05;
  const scales={bowl:2*domain**2,saddle:domain**2,wave:1.4*domain,quadratic:3*domain**2,ratio:.55,absolute:2*domain,oscillation:domain**2,cone:domain,ridge:1.4*domain,rational:.55*domain**2,radial:2*domain**2};
  const zScale=scales[s.fn],unit=Math.min(w/4.4,h/3.6),cx=w*.51,cy=h*.62;
  const project=(x,y,z)=>{const xx=x/domain,yy=y/domain,zz=z/zScale,dx=xx*Math.cos(this.yaw)-yy*Math.sin(this.yaw),depth=xx*Math.sin(this.yaw)+yy*Math.cos(this.yaw);return {x:cx+dx*unit,y:cy+(depth*Math.sin(this.pitch)-zz*Math.cos(this.pitch))*unit,depth:depth*Math.cos(this.pitch)+zz*Math.sin(this.pitch)};};
  const stroke=(ps,color,width=1,dash=[])=>{ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);};
  const area=ps=>{ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();};
  for(let i=-4;i<=4;i++){const u=i/4*domain;stroke([project(-domain,u,0),project(domain,u,0)],'#d6dfd3',.7);stroke([project(u,-domain,0),project(u,domain,0)],'#d6dfd3',.7);}
  const grad=getModel(s.fn).gradient;
  const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>project(x*domain,y*domain,grad?(grad[0]*x+grad[1]*y)*domain:0));
  if(s.plane&&grad){area(corners);ctx.fillStyle='#b4c9d62d';ctx.fill();}
  const faces=[],N=32;
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){
   const x0=domain*(2*i/N-1),y0=domain*(2*j/N-1),step=2*domain/N;
   // Leave the isolated extension out of the mesh. Its actual value is a dot.
   if(s.fn==='ratio'&&Math.abs(x0+step/2)<step*.6&&Math.abs(y0+step/2)<step*.6)continue;
   const raw=[[x0,y0],[x0+step,y0],[x0+step,y0+step],[x0,y0+step]],ps=raw.map(([x,y])=>project(x,y,value(s.fn,x,y)));
   faces.push({ps,depth:ps.reduce((sum,p)=>sum+p.depth,0)/4,z:value(s.fn,x0+step/2,y0+step/2)});
  }
  faces.sort((a,b)=>a.depth-b.depth);
  for(const f of faces){area(f.ps);const shade=Math.max(0,Math.min(1,(f.z/zScale+1)/2));ctx.fillStyle=`hsla(151, 25%, ${82-24*shade}%, .88)`;ctx.fill();ctx.strokeStyle='#41684d39';ctx.lineWidth=.65;ctx.stroke();}
  if(s.plane&&grad)stroke([...corners,corners[0]],BLUE,1.5,[5,5]);
  for(const seg of sliceSegments(s.fn,s.angle,domain*1.03,220))stroke(seg.map(p=>{const d=direction(Math.abs(p.t),s.angle,p.t<0?-1:1);return project(d.x,d.y,p.z);}),GREEN,2.5);
  const v=sample(s.fn,rho,s.angle,s.sign),p=project(v.x,v.y,v.f);
  if(s.plane&&grad){const q=project(v.x,v.y,v.L);stroke([p,q],ORANGE,2,[3,3]);ctx.beginPath();ctx.arc(q.x,q.y,3,0,Math.PI*2);ctx.fillStyle=BLUE;ctx.fill();}
  const origin=project(0,0,0);
  for(const [label,q] of [['x',project(1.24*domain,0,0)],['y',project(0,1.24*domain,0)],['z',project(0,0,1.35*zScale)]]){stroke([origin,q],'#788c7a',1);ctx.font='italic 12px Georgia';ctx.fillStyle='#58715c';ctx.fillText(label,q.x+5,q.y);}
  ctx.beginPath();ctx.arc(origin.x,origin.y,3.5,0,2*Math.PI);ctx.fillStyle='#263e30';ctx.fill();ctx.beginPath();ctx.arc(p.x,p.y,5,0,2*Math.PI);ctx.fillStyle=ORANGE;ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=2;ctx.stroke();
  ctx.font='12px sans-serif';ctx.fillStyle='#385e48';ctx.fillText(`θ = ${s.angle}° · ρ = ${format(rho)}`,20,29);
  ctx.font='10px sans-serif';ctx.fillStyle='#5e7664';ctx.fillText(`水平单位 ${format(domain)} · 高度单位 ${format(zScale)}（独立缩放）`,20,h-19);
  ctx.fillText(s.fn==='ratio'?'网格在原点留孔；实点是补定义值，不连接出虚假的极限。':s.fn==='oscillation'||s.fn==='radial'?'振荡可能被有限网格漏采；请切到“偏导的变化”核对解析序列。':'截面实线：函数 · 蓝色虚线：线性平面（若存在）',20,h-37);
 }
}

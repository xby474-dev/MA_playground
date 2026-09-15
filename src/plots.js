import { pathPoint, pathValue, pathLimit, directionPoint, smoothFunction, counterFunction, limitFunction, normalizedError, remainder, format } from './math.js';

export const palette = ['#277b68', '#d36c43', '#7764b1', '#397da5', '#b68a32'];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const line = (x1,y1,x2,y2,attr='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${attr}/>`;
const text = (x,y,label,attr='') => `<text x="${x}" y="${y}" ${attr}>${esc(label)}</text>`;
const poly = (points,attr='') => `<polyline points="${points.map(p=>p.map(x=>x.toFixed(3)).join(',')).join(' ')}" fill="none" ${attr}/>`;
const svg = (w,h,label,body) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
export const pathName = p => {
  if (p.path === 'vertical') return 'x = 0';
  if (p.k === 0) return 'y = 0';
  const coefficient = p.k === 1 ? '' : p.k === -1 ? '−' : format(p.k, 2);
  return `y = ${coefficient}${p.path === 'line' ? 'x' : 'x²'}`;
};

export function planeSVG(s) {
  const w=640,h=330,cx=320,cy=161;
  const t=s.sign*10**-s.q, point=pathPoint(s.path,s.k,t);
  const domain=s.zoom ? Math.max(Math.abs(point.x),Math.abs(point.y),1e-5)*1.5 : 1.12;
  const unit=132/domain, px=x=>cx+x*unit, py=y=>cy-y*unit;
  let b='<defs><clipPath id="plane-clip"><rect x="24" y="12" width="592" height="298" rx="8"/></clipPath><radialGradient id="plane-glow"><stop stop-color="#dcece0" stop-opacity=".75"/><stop offset="1" stop-color="#f8fbf9" stop-opacity="0"/></radialGradient></defs>';
  b+='<rect x="0" y="0" width="640" height="330" fill="#f8fbf9"/><ellipse cx="320" cy="162" rx="235" ry="150" fill="url(#plane-glow)"/>';
  for(let i=-4;i<=4;i++) {
    const a=i*domain/2;
    if(px(a)>24&&px(a)<616) b+=line(px(a),12,px(a),310,'stroke="#dfe8e2" stroke-width=".8"');
    if(py(a)>12&&py(a)<310) b+=line(24,py(a),616,py(a),'stroke="#dfe8e2" stroke-width=".8"');
  }
  b+=line(24,cy,612,cy,'stroke="#9cafa3"')+line(cx,16,cx,310,'stroke="#9cafa3"');
  b+=text(610,cy-9,'x','fill="#5d756b" font-size="13" font-style="italic"')+text(cx+10,23,'y','fill="#5d756b" font-size="13" font-style="italic"');
  for(const a of [-domain,domain]) b+=text(px(a),cy+18,format(a,3),'text-anchor="middle" fill="#728078" font-size="10"');
  for(const a of [-domain,domain]) b+=text(cx-10,py(a)+4,format(a,3),'text-anchor="end" fill="#728078" font-size="10"');
  b+='<g clip-path="url(#plane-clip)">';
  [...s.pins.map((p,i)=>({...p,color:palette[i+1],dash:`${8-i} ${5+i}`})),{path:s.path,k:s.k,color:palette[0],dash:''}].forEach(p=> {
    const bound=domain*2.4;
    const points=Array.from({length:401},(_,i)=>pathPoint(p.path,p.k,-bound+2*bound*i/400)).map(p=>[px(p.x),py(p.y)]);
    b+=poly(points,`stroke="${p.color}" stroke-width="${p.dash?2:3}" ${p.dash?`stroke-dasharray="${p.dash}"`:''}`);
  });
  b+=line(px(point.x),py(point.y),px(point.x),cy,'stroke="#348874" stroke-dasharray="3 4" stroke-opacity=".5"');
  b+=line(px(point.x),py(point.y),cx,py(point.y),'stroke="#348874" stroke-dasharray="3 4" stroke-opacity=".5"');
  b+=`<circle cx="${px(point.x)}" cy="${py(point.y)}" r="11" fill="#277b68" opacity=".12"/><circle cx="${px(point.x)}" cy="${py(point.y)}" r="5.3" fill="#277b68" stroke="white" stroke-width="2"/>`;
  b+='</g>';
  b+='<circle cx="320" cy="161" r="3.5" fill="#f8fbf9" stroke="#51695d" stroke-width="1.3"/>';
  b+=text(cx-9,cy-9,'O','fill="#62766a" font-size="12"');
  b+=`<rect x="34" y="22" width="${s.zoom?173:152}" height="26" rx="13" fill="white" stroke="#dfe8e2"/>`;
  b+=text(47,39,s.zoom?'局部放大 · x/y 等比例':'输入空间 · x/y 等比例','fill="#566d62" font-size="11"');
  const off=Math.abs(point.x)*unit>294||Math.abs(point.y)*unit>149;
  if(off) b+=text(320,295,'当前点超出视野，请开启「跟随放大」','text-anchor="middle" fill="#925333" font-size="12"');
  else b+=text(Math.min(552,Math.max(48,px(point.x)+15)),Math.max(67,py(point.y)-13),'P(t)','fill="#174d43" font-size="12" font-weight="600"');
  return svg(w,h,`输入平面上的${pathName({path:s.path,k:s.k})}，当前点 (${format(point.x)}, ${format(point.y)})；图示为有限采样`,b);
}

export function convergenceSVG(s) {
  const w=640,h=227,left=52,right=609,top=20,bottom=181;
  const isLimit=s.lab==='limits';
  const lo=isLimit?-.55:0, hi=isLimit?.55:1.06;
  const X=q=>left+q/4*(right-left), Y=v=>bottom-(v-lo)/(hi-lo)*(bottom-top);
  let b='<defs><clipPath id="chart-clip"><rect x="51" y="19" width="559" height="163"/></clipPath></defs>';
  const ticks=isLimit?[-.5,0,.5]:[0,.25,.5,.75,1];
  for(const tick of ticks) b+=line(left,Y(tick),right,Y(tick),`stroke="${tick===0?'#b9c6bd':'#e8ece5'}"`)+text(left-11,Y(tick)+4,String(tick),'text-anchor="end" font-size="10" fill="#748077"');
  for(let i=0;i<=4;i++) b+=line(X(i),top,X(i),bottom,'stroke="#edf0e9"')+text(X(i),bottom+19,['1','10⁻¹','10⁻²','10⁻³','10⁻⁴'][i],'text-anchor="middle" fill="#677a6e" font-size="10"');
  b+=text(12,12,isLimit?'F(x,y)':s.metric==='raw'?'|R|':'|R| / ρ','fill="#607366" font-size="11"');
  b+=text(right,bottom+39,isLimit?'|t| → 0  ·  对数刻度（t 不是距离）':'ρ → 0  ·  对数刻度','text-anchor="end" fill="#667769" font-size="10"');
  const series=isLimit ? [...s.pins.map((p,i)=>({...p,color:palette[i+1],dash:`${8-i} ${5+i}`})),{path:s.path,k:s.k,color:palette[0],dash:''}] : [{model:'smooth',color:palette[0],dash:''},{model:'counter',color:palette[1],dash:'7 5'}];
  b+='<g clip-path="url(#chart-clip)">';
  series.forEach(p=>{
    const value=q=>isLimit?pathValue(p.path,p.k,s.sign*10**-q):(s.metric==='raw'?remainder:normalizedError)(p.model,10**-q,s.angle);
    const points=Array.from({length:201},(_,i)=>[X(i/50),Y(value(i/50))]);
    b+=poly(points,`stroke="${p.color}" stroke-width="2.5" ${p.dash?`stroke-dasharray="${p.dash}"`:''}`);
    b+=`<circle cx="${X(s.q)}" cy="${Y(value(s.q))}" r="4.3" fill="${p.color}" stroke="white" stroke-width="1.8"/>`;
  });
  b+=line(X(s.q),top,X(s.q),bottom,'stroke="#7b9382" stroke-dasharray="3 4" stroke-opacity=".65"');
  b+='</g>';
  return svg(w,h,isLimit?'所选路径上的函数值随参数绝对值缩小的变化；横轴为对数刻度，未包含原点':'两个函数的误差比较；实线为光滑函数，虚线为反例，横轴为位移长度的对数刻度',b);
}

export function polarSVG(s) {
  const w=640,h=330,cx=320,cy=166,unit=128,rho=10**-s.q;
  const scale=1;
  let b='<defs><radialGradient id="polar-bg"><stop stop-color="#e7eee0"/><stop offset="1" stop-color="#f8fbf9"/></radialGradient></defs><rect width="640" height="330" fill="#f8fbf9"/><circle cx="320" cy="166" r="149" fill="url(#polar-bg)"/>';
  [.25,.5,.75,1].forEach(r=>{
    b+=`<circle cx="${cx}" cy="${cy}" r="${r*unit}" fill="none" stroke="#dce4d9"/>`;
    b+=text(cx+5,cy-r*unit+12,String(r),'fill="#6c7c6f" font-size="10"');
  });
  for(let d=0;d<360;d+=45){const a=d*Math.PI/180;b+=line(cx,cy,cx+Math.cos(a)*unit,cy-Math.sin(a)*unit,'stroke="#dce4d9"');b+=text(cx+Math.cos(a)*(unit+22),cy-Math.sin(a)*(unit+22)+4,`${d}°`,'text-anchor="middle" fill="#788375" font-size="10"');}
  ['smooth','counter'].forEach((model,index)=>{
    const ps=Array.from({length:361},(_,d)=>{const val=(s.metric==='raw'?remainder:normalizedError)(model,rho,d),a=d*Math.PI/180;return[cx+val/scale*Math.cos(a)*unit,cy-val/scale*Math.sin(a)*unit];});
    b+=poly(ps,`stroke="${palette[index]}" stroke-width="2.5" ${index?'stroke-dasharray="6 4"':''}`);
  });
  const angle=s.angle*Math.PI/180;
  b+=line(cx,cy,cx+Math.cos(angle)*unit,cy-Math.sin(angle)*unit,'stroke="#3f5747" stroke-width="1.3"');
  ['smooth','counter'].forEach((model,index)=>{
    const v=(s.metric==='raw'?remainder:normalizedError)(model,rho,s.angle);
    b+=`<circle cx="${cx+v*Math.cos(angle)*unit}" cy="${cy-v*Math.sin(angle)*unit}" r="4.5" fill="${palette[index]}" stroke="white" stroke-width="1.5"/>`;
  });
  b+=text(27,29,s.metric==='raw'?'径向长度 = |R(ρ, θ)|':'径向长度 = |R(ρ, θ)| / ρ','fill="#5c7262" font-size="11"');
  b+=text(613,311,`固定 ρ = ${format(rho)} · 遍历方向 θ`,'text-anchor="end" fill="#627369" font-size="10"');
  return svg(w,h,`方向误差极坐标图，半径表示${s.metric==='raw'?'绝对误差':'归一化误差'}而非输入位移；绿色光滑函数、橙色反例`,b);
}

/** Section samples split at a genuine puncture, never joined across it. */
export function surfaceSection(s, domain, count = 150) {
  const isLimit = s.lab === 'limits';
  const punctured = isLimit && s.path === 'parabola' && s.k !== 0;
  const segments = [[]];
  for (let i = 0; i <= count; i++) {
    const t = domain * (2 * i / count - 1);
    if (punctured && i === count / 2) { segments.push([]); continue; }
    const p = isLimit ? pathPoint(s.path, s.k, t) : directionPoint(t, s.angle);
    if (Math.max(Math.abs(p.x), Math.abs(p.y)) > domain * 1.1) continue;
    const z = isLimit ? pathValue(s.path, s.k, t)
      : (s.model === 'smooth' ? smoothFunction : counterFunction)(p.x, p.y);
    segments.at(-1).push({ ...p, z });
  }
  return segments.filter(segment => segment.length > 1);
}

/** Lightweight CPU-projected mesh. State-independent camera; math stays in math.js. */
export class SurfaceView {
  constructor(canvas, getState) {
    this.canvas=canvas; this.getState=getState; this.yaw=-0.72; this.pitch=.54;
    this.ctx=canvas.getContext('2d');
    this.abort=new AbortController();
    const opts={signal:this.abort.signal};
    let drag=null;
    canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);},opts);
    canvas.addEventListener('pointermove',e=>{if(!drag)return;this.yaw+=(e.clientX-drag.x)*.009;this.pitch=Math.min(1.2,Math.max(.15,this.pitch+(e.clientY-drag.y)*.007));drag={x:e.clientX,y:e.clientY};this.draw();},opts);
    for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>drag=null,opts);
    canvas.addEventListener('keydown',e=>{const d={ArrowLeft:[-.12,0],ArrowRight:[.12,0],ArrowUp:[0,-.08],ArrowDown:[0,.08]};if(e.key==='Home'){e.preventDefault();this.reset();}else if(d[e.key]){e.preventDefault();this.yaw+=d[e.key][0];this.pitch=Math.min(1.2,Math.max(.15,this.pitch+d[e.key][1]));this.draw();}},opts);
    this.resize=new ResizeObserver(()=>this.draw());this.resize.observe(canvas);
    this.draw();
  }
  reset(){this.yaw=-.72;this.pitch=.54;this.draw();}
  destroy(){this.abort.abort();this.resize.disconnect();}
  draw(){
    const c=this.canvas,ctx=this.ctx,s=this.getState(); if(!ctx)return;
    const w=c.clientWidth,h=c.clientHeight;if(!w||!h)return;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    ctx.fillStyle='#f8fbf9';ctx.fillRect(0,0,w,h);
    const rho=10**-s.q;
    const isLimit=s.lab==='limits';
    const domain=s.zoom?(isLimit?Math.max(rho,Math.abs(s.k*rho))*1.5:rho*1.5):1.1;
    const zScale=isLimit?.8:domain;
    const unit=Math.min(w/4.8,h/3.5);
    const cy=h*.62,cx=w*.50;
    const project=(x,y,z)=>{
      const xx=x/domain,yy=y/domain,zz=z/zScale;
      const a=xx*Math.cos(this.yaw)-yy*Math.sin(this.yaw),depth=xx*Math.sin(this.yaw)+yy*Math.cos(this.yaw);
      return {x:cx+a*unit,y:cy+(depth*Math.sin(this.pitch)-zz*Math.cos(this.pitch))*unit,depth:depth*Math.cos(this.pitch)+zz*Math.sin(this.pitch)};
    };
    const stroke=(ps,color,width=1,dash=[])=>{ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);};
    const area=ps=>{ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();};
    const corner=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>project(x*domain,y*domain,0));
    area(corner);ctx.fillStyle='#e4e7d970';ctx.fill();stroke([...corner,corner[0]],'#899b7d',1,[4,4]);
    for(let i=-4;i<=4;i++){
      const u=i/4*domain;
      stroke([project(-domain,u,0),project(domain,u,0)],'#d5dfd180',.7);
      stroke([project(u,-domain,0),project(u,domain,0)],'#d5dfd180',.7);
    }
    const f=isLimit?limitFunction:s.model==='smooth'?smoothFunction:counterFunction;
    const faces=[],N=34;
    for(let i=0;i<N;i++)for(let j=0;j<N;j++){
      const x0=domain*(i*2/N-1),y0=domain*(j*2/N-1),x1=x0+2*domain/N,y1=y0+2*domain/N;
      // Do not join through the isolated discontinuity in F's extension.
      if(isLimit&&Math.abs((x0+x1)/2)<domain/N*1.1&&Math.abs((y0+y1)/2)<domain/N*1.1)continue;
      const ps=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(([x,y])=>project(x,y,f(x,y)));
      const z=f((x0+x1)/2,(y0+y1)/2);
      faces.push({ps,depth:ps.reduce((a,p)=>a+p.depth,0)/4,z});
    }
    faces.sort((a,b)=>a.depth-b.depth);
    for(const face of faces){area(face.ps);const shade= Math.max(0,Math.min(1,(face.z/zScale+1)/2));ctx.fillStyle=`hsla(${s.model==='counter'&&!isLimit?28:157}, ${s.model==='counter'&&!isLimit?38:27}%, ${78-23*shade}%, .91)`;ctx.fill();ctx.strokeStyle=s.model==='counter'&&!isLimit?'#996b423f':'#315f523f';ctx.lineWidth=.5;ctx.stroke();}
    // Candidate plane boundary is deliberately separate from the mesh.
    stroke([...corner,corner[0]],'#849371',1,[5,4]);
    const origin=project(0,0,0);
    for(const [label,p,color] of [['x',project(domain*1.28,0,0),'#677869'],['y',project(0,domain*1.28,0),'#677869'],['z',project(0,0,zScale*1.5),'#677869']]){
      stroke([origin,p],color,1);ctx.font='italic 12px Georgia';ctx.fillStyle=color;ctx.fillText(label,p.x+5,p.y);
    }
    for(const segment of surfaceSection(s, domain)) {
      stroke(segment.map(p=>project(p.x,p.y,p.z)), '#173f35', 2.5);
    }
    if(isLimit&&s.path==='parabola'&&s.k!==0) {
      const hole=project(0,0,pathLimit(s.path,s.k));
      ctx.beginPath();ctx.arc(hole.x,hole.y,4,0,Math.PI*2);
      ctx.fillStyle='#f8fbf9';ctx.fill();ctx.strokeStyle='#173f35';ctx.lineWidth=1.8;ctx.stroke();
      ctx.beginPath();ctx.arc(origin.x,origin.y,3.2,0,Math.PI*2);ctx.fillStyle='#173f35';ctx.fill();
      ctx.font='10px system-ui';ctx.fillStyle='#54695c';ctx.fillText('空心点：路径极限，非 F(0,0)',20,43);
    }
    const p=isLimit?pathPoint(s.path,s.k,s.sign*rho):directionPoint(rho,s.angle);
    const actual=project(p.x,p.y,f(p.x,p.y)),base=project(p.x,p.y,0);
    stroke([base,actual],'#d06e40',2,[3,3]);
    for(const [pt,col,r] of [[base,'#899775',3],[actual,'#1d5b49',5]]){ctx.beginPath();ctx.arc(pt.x,pt.y,r,0,Math.PI*2);ctx.fillStyle=col;ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=1.8;ctx.stroke();}
    ctx.font='11px system-ui';ctx.fillStyle='#5e7263';
    ctx.fillText(s.zoom?(isLimit?'局部放大 · 水平缩放，z 轴比例固定':'局部缩放 · 水平/竖直缩放比例保持不变'):'曲面示意 · 各坐标轴显示比例不同',20,25);
    ctx.fillText('原点 O',origin.x-30,origin.y+17);
    ctx.fillStyle='#795c3d';ctx.fillText(isLimit?'细窄脊线可能被网格漏采；以解析式为准':s.model==='smooth'?'已证明的切平面：z = 0':'候选平面：z = 0（并非切平面）',20,h-16);
  }
}

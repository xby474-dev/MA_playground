import { tValue, tBlend, tGrowth, tError, tBound, tNum, tRadius, tConvergence, tOrderRows, tf } from './taylor-math.js';
const C={ink:'#243b33',green:'#25715a',orange:'#c27042',gold:'#a58135',muted:'#84917f',grid:'#edf0e8',pale:'#eef4e9',red:'#a44a3c'};
const E=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const f=x=>Number(x).toFixed(2);
function line(x1,y1,x2,y2,attr=''){return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" ${attr}/>`;}
function text(x,y,t,attr=''){return `<text x="${f(x)}" y="${f(y)}" ${attr}>${E(t)}</text>`;}
/** Clip every sampled LINE SEGMENT; no spurious flat line on a clipping boundary. */
function segment(x1,y1,x2,y2,r){let t0=0,t1=1;const dx=x2-x1,dy=y2-y1;for(const [p,q] of [[-dx,x1-r.l],[dx,r.r-x1],[-dy,y1-r.t],[dy,r.b-y1]]){if(p===0){if(q<0)return '';continue;}const u=q/p;if(p<0)t0=Math.max(t0,u);else t1=Math.min(t1,u);if(t0>t1)return '';}return `M${f(x1+t0*dx)},${f(y1+t0*dy)}L${f(x1+t1*dx)},${f(y1+t1*dy)}`;}
function path(points,r,breakAt=null){let d='';for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];if(!a||!b||!Number.isFinite(a[1])||!Number.isFinite(b[1]))continue;if(breakAt!==null&&a[2]<breakAt&&b[2]>breakAt)continue;d+=segment(a[0],a[1],b[0],b[1],r);}return d;}
function frame(W,H,label,body){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${E(label)}" class="ty-chart"><title>${E(label)}</title>${body}</svg>`;}
export function tGeometry(s,compact=false,locked=null){const W=compact?560:860,H=compact?335:358,r={l:55,r:W-25,t:25,b:H-48},lo=locked?.lo??s.a-s.span,hi=locked?.hi??s.a+s.span;
 const values=Array.from({length:201},(_,i)=>tValue(s.fn,lo+(hi-lo)*i/200)).filter(v=>v!==null&&Number.isFinite(v)&&Math.abs(v)<1e5).sort((a,b)=>a-b);
 let ymin=Math.min(0,values[Math.floor(values.length*.08)]??-1),ymax=Math.max(0,values[Math.floor(values.length*.92)]??1);
 // Derive scale from f, NOT from the growing polynomial. Growth never rescales its own error away.
 const pad=Math.max(.25,(ymax-ymin)*.14);ymin-=pad;ymax+=pad;const X=x=>r.l+(x-lo)/(hi-lo)*(r.r-r.l),Y=y=>r.b-(y-ymin)/(ymax-ymin)*(r.b-r.t);
 return {W,H,r,lo,hi,ymin,ymax,X,Y};}
export function tMainSVG(s,compact=false,locked=null){
 const {W,H,r,lo,hi,ymin,ymax,X,Y}=tGeometry(s,compact,locked),g=tGrowth(s.p),x=s.a+s.h,err=tError(s.fn,s.a,s.p,x),R=tRadius(s.fn,s.a);let body='';
 if(Number.isFinite(R)){const l=Math.max(r.l,X(s.a-R)),rr=Math.min(r.r,X(s.a+R));if(rr>l)body+=`<rect x="${f(l)}" y="${r.t}" width="${f(rr-l)}" height="${r.b-r.t}" fill="${C.pale}" opacity=".65"/>`;}
 for(let i=0;i<=4;i++){let v=ymin+(ymax-ymin)*i/4,yy=Y(v);body+=line(r.l,yy,r.r,yy,`stroke="${C.grid}"`)+text(r.l-9,yy+4,tNum(v,3),'text-anchor="end"');}
 for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4,xx=X(v);body+=line(xx,r.t,xx,r.b,`stroke="${C.grid}"`)+text(xx,r.b+22,tNum(v,3),'text-anchor="middle"');}
 if(Y(0)>=r.t&&Y(0)<=r.b)body+=line(r.l,Y(0),r.r,Y(0),`stroke="#ccd6c6"`);
 const singular=s.fn==='log'?-1:s.fn==='reciprocal'?1:null;
 if(singular!==null&&singular>=lo&&singular<=hi){const xx=X(singular);if(s.fn==='log')body+=`<rect x="${r.l}" y="${r.t}" width="${f(xx-r.l)}" height="${r.b-r.t}" fill="#e9e9e5" opacity=".8"/>`;body+=line(xx,r.t,xx,r.b,`stroke="${C.red}" stroke-dasharray="4 5"`)+text(xx+6,r.t+15,`x=${singular} · 无定义`,`fill="${C.red}"`);}
 const points=fn=>Array.from({length:401},(_,i)=>{const xx=lo+(hi-lo)*i/400,v=fn(xx);return v===null?null:[X(xx),Y(v),xx];});
 if(s.ghost&&g.k>0){body+=`<path d="${path(points(xx=>tBlend(s.fn,s.a,g.k-1,xx)),r)}" fill="none" stroke="${C.orange}" stroke-opacity=".28" stroke-width="2" stroke-dasharray="5 5"/>`;}
 body+=`<path d="${path(points(xx=>tValue(s.fn,xx)),r,singular)}" fill="none" stroke="${C.green}" stroke-width="3"/>`;
 body+=`<path d="${path(points(xx=>tBlend(s.fn,s.a,s.p,xx)),r)}" fill="none" stroke="${C.orange}" stroke-width="2.7"/>`;
 const center=X(s.a),cy=Y(tValue(s.fn,s.a));body+=line(center,r.t,center,r.b,`stroke="${C.green}" opacity=".35" stroke-dasharray="3 5"`);
 body+=`<circle cx="${f(center)}" cy="${f(Math.max(r.t,Math.min(r.b,cy)))}" r="5" fill="${C.green}" stroke="white" stroke-width="2"/>`;
 body+=`<g id="ty-a-handle" role="slider" tabindex="0" aria-label="拖动展开点 a，方向键微调，Home 回到 0" aria-valuemin="${tf(s.fn).range[0]}" aria-valuemax="${tf(s.fn).range[1]}" aria-valuenow="${s.a}" aria-disabled="${s.fn==='flat'}" style="cursor:ew-resize"><rect x="${f(center-30)}" y="${r.b+30}" width="60" height="25" rx="6" fill="${C.green}"/>${text(center,r.b+47,'↔ a','text-anchor="middle" fill="white" font-weight="600"')}</g>`;
 const xx=X(x);if(xx>=r.l&&xx<=r.r){body+=line(xx,r.t,xx,r.b,`stroke="${C.gold}" opacity=".5" stroke-dasharray="4 5"`);if(err.valid){const y1=Y(err.y),y2=Y(err.poly);body+=`<path d="${segment(xx,y1,xx,y2,r)}" stroke="${C.orange}" stroke-width="8" opacity=".27"/>`;for(const [yy,col] of [[y1,C.green],[y2,C.orange]])if(yy>=r.t&&yy<=r.b)body+=`<circle cx="${f(xx)}" cy="${f(yy)}" r="4.5" fill="${col}" stroke="white" stroke-width="1.5"/>`;}
 body+=`<g id="ty-x-handle" role="slider" tabindex="0" aria-label="拖动观察点 x，方向键改变相对位移 h" aria-valuemin="${lo}" aria-valuemax="${hi}" aria-valuenow="${x}" style="cursor:ew-resize"><rect x="${f(Math.max(r.l,Math.min(r.r-60,xx-30)))}" y="${r.t-19}" width="60" height="24" rx="6" fill="#f3e7d7"/>${text(Math.max(r.l+30,Math.min(r.r-30,xx)),r.t-3,'↔ x','text-anchor="middle" fill="#7e522e"')}</g>`;}
 body+=text(r.r,r.b+43,'x','text-anchor="end"');
 return frame(W,H,`原函数与${g.complete?'T_'+g.m:'过渡曲线 Q'}。展开点 ${s.a}，观察点 ${x}。上下裁切仅用于显示。`,body);
}
function logError(v,near=false){return v===null?null:Math.max(-14,Math.log10(Math.max(near?1e-14:v,1e-14)));}
function errorBase(W,H,maxLog){const r={l:56,r:W-24,t:25,b:H-40},top=Math.max(1,Math.ceil(maxLog)),bot=-14,Y=y=>r.b-(y-bot)/(top-bot)*(r.b-r.t);let b='';for(const k of [top,0,-4,-8,-12,-14].filter((v,i,a)=>a.indexOf(v)===i&&v<=top)){b+=line(r.l,Y(k),r.r,Y(k),`stroke="${C.grid}"`)+text(r.l-8,Y(k)+4,`10^${k}`,'text-anchor="end"');}return {r,top,bot,Y,b};}
export function tErrorSVG(s,compact=false){const W=compact?560:720,H=252;const data=Array.from({length:241},(_,i)=>{const h=-s.span+2*s.span*i/240,e=tError(s.fn,s.a,s.p,s.a+h);return {h,e};});const logs=data.map(o=>logError(o.e.absolute,o.e.nearRoundoff)).filter(x=>x!==null);const {r,Y,b}=errorBase(W,H,Math.max(0,...logs)),X=h=>r.l+(h+s.span)/(2*s.span)*(r.r-r.l);let body=b;
 const pts=data.map(({h,e})=>e.valid?[X(h),Y(logError(e.absolute,e.nearRoundoff)),h]:null);body+=`<path d="${path(pts,r,s.fn==='reciprocal'?1-s.a:null)}" fill="none" stroke="${C.orange}" stroke-width="2.5"/>`;
 body+=line(r.l,Y(-s.epsilon),r.r,Y(-s.epsilon),`stroke="${C.green}" stroke-dasharray="5 4"`)+text(r.r-3,Y(-s.epsilon)-7,`ε=10^−${s.epsilon}`,'text-anchor="end"');
 for(let i=0;i<=4;i++){const h=-s.span+i*s.span/2;body+=text(X(h),r.b+22,tNum(h,3),'text-anchor="middle"');}
 body+=line(X(s.h),r.t,X(s.h),r.b,`stroke="${C.gold}" stroke-dasharray="4 4"`);body+=text(r.r,H-3,'h = x − a','text-anchor="end"');
 return frame(W,H,'固定阶数，看离展开点的距离如何影响绝对误差。纵轴为 log10；底部是显示下限，不是误差等于零。',body);}
export function tOrdersSVG(s,compact=false){const W=compact?560:720,H=252,rows=tOrderRows(s),logs=rows.map(r=>logError(r.absolute,r.nearRoundoff)).filter(x=>x!==null),{r,Y,b}=errorBase(W,H,Math.max(0,...logs)),X=n=>r.l+n/12*(r.r-r.l);let body=b;
 const pts=rows.map(o=>o.valid?[X(o.n),Y(logError(o.absolute,o.nearRoundoff)),o.n]:null);body+=`<path d="${path(pts,r)}" fill="none" stroke="${C.orange}" stroke-width="2"/>`;
 body+=line(r.l,Y(-s.epsilon),r.r,Y(-s.epsilon),`stroke="${C.green}" stroke-dasharray="5 4"`);
 for(const row of rows){const xx=X(row.n),yy=row.valid?Y(logError(row.absolute,row.nearRoundoff)):r.b;body+=`<g role="button" tabindex="0" data-ty-order="${row.n}" aria-label="选择 ${row.n} 阶，误差 ${row.valid?tNum(row.absolute):'未定义'}"><circle cx="${f(xx)}" cy="${f(yy)}" r="13" fill="transparent"/><circle cx="${f(xx)}" cy="${f(yy)}" r="${row.n===s.n?5.5:3.2}" fill="${row.n===s.n?C.green:C.orange}"/>${text(xx,r.b+22,row.n,'text-anchor="middle"')}</g>`;}
 return frame(W,H,`固定 x=${tNum(s.a+s.h)}，比较完整 T_0 到 T_12 的误差。连线只连接离散阶数，不代表连续阶数定理。`,body);}
export function tSupportSVG(s){const W=680,H=110,l=35,r=645,R=tRadius(s.fn,s.a),lo=s.a-s.span,hi=s.a+s.span,X=x=>l+(x-lo)/(hi-lo)*(r-l),left=Number.isFinite(R)?Math.max(l,X(s.a-R)):l,right=Number.isFinite(R)?Math.min(r,X(s.a+R)):r;let body=line(l,55,r,55,'stroke="#d9dfd0" stroke-width="7"');if(right>left)body+=line(left,55,right,55,`stroke="${s.fn==='flat'?'#c9cfc0':C.green}" stroke-width="7"`);
 if(Number.isFinite(R)){for(const x of [s.a-R,s.a+R])if(x>=lo&&x<=hi){const included=s.fn==='log'&&x>s.a;body+=`<circle cx="${f(X(x))}" cy="55" r="6" fill="${included?C.green:'white'}" stroke="${C.green}" stroke-width="2"/>`+text(X(x),85,tNum(x),'text-anchor="middle"');}}
 body+=text(X(s.a),25,`a=${tNum(s.a)}`,'text-anchor="middle"')+line(X(s.a),35,X(s.a),65,`stroke="${C.ink}"`);
 const x=s.a+s.h;body+=`<circle cx="${f(X(x))}" cy="55" r="5" fill="${C.orange}" stroke="white" stroke-width="2"/>`+text(X(x),102,`x=${tNum(x)}`,'text-anchor="middle"');
 return frame(W,H,'绿色表示 Taylor 级数等于原函数的区间；空心点排除，实心点包含。灰色反例不能按收敛半径推断相等。',body);}

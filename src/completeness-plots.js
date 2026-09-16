import { completenessNodes, completenessEdges, cpTarget, cpNode, exactBrackets, rnumber, rtext, rsub, rdiv, implicationPath, subsequenceData, cauchyCertificate, parseRational } from './completeness-math.js';
const green='#246853',deep='#174d43',amber='#b16f44',muted='#65745e',pale='#e6efdd',grid='#e3e9dc';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const line=(x1,y1,x2,y2,color=grid,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" ${extra}/>`;
const text=(x,y,t,anchor='start',extra='')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${muted}" ${extra}>${esc(t)}</text>`;
const circle=(x,y,r,fill=green,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const svg=(body,w,h,label)=>`<svg class="cp-plot-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg"><title>${esc(label)}</title>${body}</svg>`;
const approximate=a=>rnumber(a).toFixed(8).replace(/0+$/,'').replace(/\.$/,'');
export function completenessGraph(s){
 const path=implicationPath(s.from,s.to),pos={sup:[400,76],mono:[650,249],nested:[553,470],bw:[247,470],cauchy:[150,249]};
 const curves=[['M 503 96 Q 590 117 625 202',590,136],['M 650 291 Q 659 377 588 425',700,366],['M 448 470 L 352 470',400,540],['M 212 425 Q 141 377 150 291',104,366],['M 175 202 Q 210 117 297 96',210,136]];
 let body='<defs><marker id="cp-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#246853"/></marker></defs>';
 body+=`<circle cx="400" cy="290" r="115" fill="#f3f6ed" stroke="#e3eada" stroke-dasharray="3 6"/>`+text(400,265,'不是五个孤岛','middle','class="cp-ring-small"')+text(400,300,'一个完备性','middle','class="cp-ring-title"')+text(400,333,'终点仍属于 K','middle','class="cp-ring-sub"');
 completenessEdges.forEach((e,i)=>{const [d,x,y]=curves[i];body+=`<g class="cp-graph-edge${path.includes(e.id)?' on-route':''}" data-cp-edge="${e.id}" role="button" tabindex="0" aria-label="${cpNode(e.from).name} 推出 ${cpNode(e.to).name}：${e.verb}，点击查看证明"><title>${e.verb}</title><path class="cp-edge-hit" d="${d}"/><path class="cp-edge-line" d="${d}" marker-end="url(#cp-arrow)"/><rect x="${x-87}" y="${y-19}" width="174" height="34" rx="17"/>${text(x,y+3,e.verb,'middle')}</g>`;});
 completenessNodes.forEach((n,i)=>{const[x,y]=pos[n.id];body+=`<g class="cp-graph-node ${s.domain==='R'?'holds':'fails'}${s.node===n.id?' selected':''}" data-cp-node="${n.id}" role="button" tabindex="0" aria-label="${n.name}，打开可视化实验"><rect x="${x-104}" y="${y-43}" width="208" height="86" rx="12"/>${text(x-85,y-16,`0${i+1} · ${n.code}`,'start','class="cp-node-code"')}${text(x,y+8,n.short,'middle','class="cp-node-name"')}${text(x,y+29,s.domain==='R'?'✓ 在 ℝ 中普遍成立':'× 在 ℚ 中不普遍成立','middle','class="cp-node-status"')}</g>`;});
 const mobile=completenessNodes.map((n,i)=>`<button class="cp-mobile-node ${s.domain==='R'?'holds':'fails'}" data-cp-node="${n.id}"><span>0${i+1} · ${n.code}</span><strong>${n.name}</strong><small>${s.domain==='R'?'✓ ℝ 中成立':'× ℚ 中不普遍成立'}</small></button><button class="cp-mobile-arrow" data-cp-edge="${completenessEdges[i].id}"><span>↓ ${completenessEdges[i].verb}</span><small>${i===4?'回到上确界，闭合证明环 ↶':'为什么能推出？'}</small></button>`).join('');
 return `<svg class="cp-desktop-graph" viewBox="0 0 800 585" xmlns="http://www.w3.org/2000/svg" aria-label="完备性的五节点有向证明环">${body}</svg><div class="cp-mobile-graph" aria-label="纵向等价证明环">${mobile}</div>`;
}
export function cpBracketSVG(s,compact=false){
 const w=compact?440:780,h=328,left=65,right=w-35,rows=exactBrackets(s.target,s.n),start=Math.max(0,s.n-5),frame=rows[s.zoom?start:0],lo=frame.a,span=frame.width;
 const X=a=>left+rnumber(rdiv(rsub(a,lo),span))*(right-left);
 let out=text(left,25,s.zoom?'局部放大 · 横轴重新标定':'同一条数轴上的嵌套','start','font-weight="600"');
 out+=text(right,25,`n = ${s.n}`,'end');
 out+=line(left,62,right,62,'#9eaf93');out+=text(left,51,`≈ ${approximate(frame.a)}`)+text(right,51,`≈ ${approximate(frame.b)}`,'end');
 for(let n=start;n<=s.n;n++){const r=rows[n],y=96+(n-start)*32,xa=X(r.a),xb=X(r.b),active=n===s.n;
  out+=text(12,y+4,`I${n}`)+`<rect x="${xa}" y="${y-9}" width="${Math.max(.7,xb-xa)}" height="18" rx="2" fill="${active?pale:'#f0f3eb'}"/>`+line(xa,y,xb,y,active?green:'#90a77f',`stroke-width="${active?4:2}"`)+circle(xa,y,active?4:3)+circle(xb,y,active?4:3,amber);
 }
 if(s.reference){const t=cpTarget(s.target),root=Math.sqrt(Number(t.num)/Number(t.den)),fraction=(root-rnumber(frame.a))/rnumber(span),x=left+fraction*(right-left),inField=s.domain==='R'||t.rational;
  out+=line(x,70,x,280,amber,'stroke-dasharray="4 5"')+circle(x,62,6,inField?amber:'#fff',`stroke="${amber}" stroke-width="2"`)+text(x,300,`${t.label}${inField?' ∈ '+(s.domain==='R'?'ℝ':'ℚ'):' ∉ ℚ（ℝ参照）'}`,'middle');
 }
 out+=text(left,321,s.zoom?'端点用分数精确定位；参照点为近似投影。':'再窄的有限区间仍非空；像素重合不代表宽度为零。');
 return svg(out,w,h,`闭区间套第 ${start} 到 ${s.n} 层；精确宽度 2 的负 n 次方。虚线目标仅为实数背景中的近似参照。`);
}
function supSVG(s,compact){
 const w=compact?440:780,h=330,l=48,r=w-40,X=x=>l+x/2*(r-l),t=cpTarget(s.target),root=Math.sqrt(Number(t.num)/Number(t.den)),row=exactBrackets(s.target,s.n)[s.n];
 let out=text(l,29,'A = {x ∈ K : 0 ≤ x，x² < d}','start','font-weight="600"');
 out+=text(l,58,'点：A 中有限个示例有理数，不是整个集合。');
 out+=line(l,118,r,118,'#91a180','stroke-width="1.5"');
 for(let i=0;i<=32;i++){const q=i/16;if(q*q<Number(t.num)/Number(t.den))out+=circle(X(q),118,3.5,green);}
 for(let i=0;i<=2;i++)out+=line(X(i),111,X(i),126,'#91a180')+text(X(i),151,i,'middle');
 const xa=X(rnumber(row.a)),xb=X(rnumber(row.b));
 out+=text(l,189,`第 ${s.n} 层：夹在两端点之间，不等于已经到达。`)+line(xa,227,xb,227,green,'stroke-width="5"')+circle(xa,227,5)+circle(xb,227,5,amber)+text(xa-8,254,'aₙ','end')+text(xb+8,254,'bₙ');
 const q=parseRational(s.candidate);if(q){const v=rnumber(q);if(v>=0&&v<=2)out+=line(X(v),82,X(v),136,deep,'stroke-dasharray="3 3"')+text(X(v),78,`q=${rtext(q)}`,'middle');}
 if(s.reference){const x=X(root),exists=s.domain==='R'||t.rational;out+=line(x,155,x,269,amber,'stroke-dasharray="5 5"')+circle(x,118,7,exists?amber:'#fff',`stroke="${amber}" stroke-width="2"`)+text(l,293,exists?`${t.label} 是上确界，但不属于严格不等式定义的 A。`:`${t.label} 不属于 ℚ；这是缺失点，不是有宽度的空隙。`);}
 out+=text(l,321,'最小上界的验证在下方解析式中完成，不靠点阵。');
 return svg(out,w,h,'上确界示例：集合中的有理采样点、用户候选上界与当前二分区间。');
}
function monoSVG(s,compact){
 const w=compact?440:780,h=330,l=48,r=w-30,top=43,bottom=266,rows=exactBrackets(s.target,s.n),max=Math.max(8,s.n),X=n=>l+n/max*(r-l),Y=v=>bottom-(v-1)*(bottom-top);let out='';
 for(const v of [1,1.25,1.5,1.75,2])out+=line(l,Y(v),r,Y(v))+text(l-8,Y(v)+5,String(v),'end');
 const pts=rows.map(row=>`${X(row.n)},${Y(rnumber(row.a))}`).join(' '),ups=rows.map(row=>`${X(row.n)},${Y(rnumber(row.b))}`).join(' ');
 out+=`<polyline points="${ups}" fill="none" stroke="${amber}" stroke-dasharray="5 5"/><polyline points="${pts}" fill="none" stroke="${green}" stroke-width="2.5"/>`;
 rows.forEach(row=>out+=circle(X(row.n),Y(rnumber(row.a)),row.n===s.n?5:3));
 if(s.reference){const t=cpTarget(s.target),y=Y(Math.sqrt(Number(t.num)/Number(t.den)));out+=line(l,y,r,y,amber,'stroke-dasharray="2 6"')+text(r-5,y-9,`${t.label} · ℝ 参照`,'end');}
 for(let n=0;n<=max;n+=Math.max(1,Math.ceil(max/6)))out+=text(X(n),289,n,'middle');out+=text(r,312,'原始下标 n','end')+text(l,25,'aₙ 不减，bₙ 不增；连线只帮助追踪下标。');
 return svg(out,w,h,'有限前缀中的单调左端点与单调右端点。是否有域内极限要由证明决定。');
}
function bwSVG(s,compact){
 const w=compact?440:780,h=354,l=47,r=w-28,top=48,bottom=293,max=Math.max(10,s.n),X=n=>l+n/max*(r-l),Y=v=>bottom-(v+2)/4*(bottom-top);let out='';
 for(const v of [-2,-1,0,1,2])out+=line(l,Y(v),r,Y(v))+text(l-9,Y(v)+5,v,'end');
 const data=subsequenceData(s.target,s.n,s.parity);
 data.forEach((d,i)=>{const x=X(d.index),y=Y(rnumber(d.value));if(i){const prev=data[i-1];out+=line(X(prev.index),Y(rnumber(prev.value)),x,y,'#d6dece','stroke-dasharray="3 4"');}out+=circle(x,y,d.selected?5:3,d.selected?green:'#d2dacb');});
 if(s.reference){const t=cpTarget(s.target),a=Math.sqrt(Number(t.num)/Number(t.den));for(const sign of [-1,1])out+=line(l,Y(sign*a),r,Y(sign*a),amber,'stroke-dasharray="4 5"')+text(r-2,Y(sign*a)-8,`${sign<0?'−':''}${t.label}`,'end');}
 out+=text(l,25,s.parity==='all'?'有界 ≠ 整列收敛':s.parity==='even'?'保留 nₖ=2k：只删项，不重排':'保留 nₖ=2k+1：另一条子列');
 for(let n=0;n<=max;n+=Math.max(1,Math.ceil(max/6)))out+=text(X(n),317,n,'middle');
 out+=text(l,344,'横轴仍是原始下标；浅点是被删项。');
 return svg(out,w,h,`序列 z_j=(-1)^j a_j 的前 ${s.n+1} 项，${s.parity==='all'?'整列':s.parity==='even'?'保留偶数原始下标':'保留奇数原始下标'}。`);
}
function cauchySVG(s,compact){
 const w=compact?440:780,h=330,l=55,r=w-40,N=s.n,rows=exactBrackets(s.target,N),interval=rows[N],cert=cauchyCertificate(s.target,N,s.epsilon,s.m,s.k),X=a=>l+rnumber(rdiv(rsub(a,interval.a),interval.width))*(r-l);
 let out=text(l,28,'放大第 N 层：整个尾部都困在这里。','start','font-weight="600"');
 out+=`<rect x="${l}" y="91" width="${r-l}" height="74" rx="10" fill="${pale}"/>`+line(l,128,r,128,green,'stroke-width="2"')+circle(l,128,5)+circle(r,128,5,amber)+text(l,191,'a_N')+text(r,191,'b_N','end');
 const x=X(cert.a),y=X(cert.b);out+=circle(x,128,6,green)+line(x,128,x,73,green)+text(Math.max(l+15,Math.min(r-15,x)),62,`aₘ，m=${cert.m}`,'middle')+circle(y,128,6,amber)+line(y,128,y,223,amber)+text(Math.max(l+15,Math.min(r-15,y)),242,`aⱼ，j=${cert.n}`,'middle');
 out+=text(l,281,`全部尾项两两距离 ≤ 2⁻${N}，而非只检查这两点。`)+text(l,312,'精确差值见下方；像素可能重合，分数未必相等。');
 return svg(out,w,h,'Cauchy 尾部放大示意，选择的两项按精确有理差值定位；有限点不能替代所有尾项的界。');
}
export function completenessPlot(s,compact=false){return ({sup:supSVG,mono:monoSVG,nested:cpBracketSVG,bw:bwSVG,cauchy:cauchySVG}[s.node]??cpBracketSVG)(s,compact);}
export function cpMiniSVG(s){return cpBracketSVG({...s,zoom:false,n:s.n},true);}

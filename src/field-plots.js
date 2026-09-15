import { fieldAt, surfacePoint, surfaceNormal, gridCells, rectangleEdges, selectedPair, cancellationLedger } from './field-math.js';
// SVG uses sampled geometry only. Integral values come exclusively from field-math.
const C={green:'#257966',deep:'#174d43',orange:'#bd633f',gold:'#ae7b31',grid:'#d7e4dc',muted:'#708679',blue:'#55749b'};
const f=x=>Number(x).toFixed(2);
const pts=a=>a.map(p=>`${f(p[0])},${f(p[1])}`).join(' ');
const line=(a,b,color=C.green,width=1.5,extra='')=>`<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const poly=(a,color=C.green,width=1.5,extra='')=>`<polyline points="${pts(a)}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const text=(x,y,t,extra='')=>`<text class="${['x','y','z','0','L','n','curl F'].includes(t)?'axis-label':'scene-annotation'}" x="${f(x)}" y="${f(y)}" ${extra}>${t}</text>`;
const polygon=(a,fill,extra='')=>`<polygon points="${pts(a)}" fill="${fill}" ${extra}/>`;
function arrow(a,b,color=C.green,width=1.7,extra='') {
  const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);
  if(d<.1)return '';
  const ux=dx/d,uy=dy/d,size=Math.min(6,d*.37),base=[b[0]-size*ux,b[1]-size*uy];
  return `<g ${extra}>${line(a,b,color,width)}${polygon([b,[base[0]+uy*size*.48,base[1]-ux*size*.48],[base[0]-uy*size*.48,base[1]+ux*size*.48]],color)}</g>`;
}
const begin=(label)=>`<svg class="field-svg" viewBox="0 0 760 460" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><title>${label}</title><defs><pattern id="field-dot" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#c9d9cf" opacity=".5"/></pattern></defs><rect width="760" height="460" fill="#f7faf7"/><rect width="760" height="460" fill="url(#field-dot)"/><g font-family="system-ui, sans-serif" font-size="12" fill="${C.muted}">`;
const end='</g></svg>';
function fillColor(value,s,dim) {
  const max=Math.max(.1,Math.abs(dim===3?s.a:s.stage==='flux'?s.a:s.b)*(3+2*s.c*s.L));
  const alpha=.07+.17*Math.min(1,Math.abs(value)/max);
  return value>=0?`rgba(37,121,102,${alpha})`:`rgba(189,99,63,${alpha})`;
}
function edgeArrow2D(a,b,s,isFlux,offset=0,color=C.green,opacity=1) {
  const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1;
  const ux=dx/d,uy=dy/d,m=[(a[0]+b[0])/2+uy*offset,(a[1]+b[1])/2-ux*offset];
  // screen y is inverted. RIGHT physical normal becomes screen-left normal.
  const v=isFlux?[-uy*s.orientation,ux*s.orientation]:[ux*s.orientation,uy*s.orientation];
  const len=isFlux?17:Math.min(24,d*.48);
  return arrow([m[0]-v[0]*len/2,m[1]-v[1]*len/2],[m[0]+v[0]*len/2,m[1]+v[1]*len/2],color,1.8,`opacity="${f(opacity)}"`);
}
export function planeFieldSVG(s) {
  const size=294,x0=233,y0=367,P=([x,y])=>[x0+size*x/s.L,y0-size*y/s.L];
  const cells=gridCells(s),ledger=cancellationLedger(s),pair=selectedPair(s,ledger);
  const flux=s.stage==='flux',cancel=s.phase===2?s.cancel:0;
  let out=begin(flux?'平面通量：相邻小区域的公共边外法向相反，抵消后只剩外边界。':'Green 环流：小方格同向绕行，共用边被反向经过两次。');
  out+=text(27,32,flux?'02 · 同一条边，换一种读法':'01 · 面内的小环流',`font-size="12" fill="${C.deep}" font-weight="600"`);
  out+=text(733,32,'D = [0, L]²','text-anchor="end" font-family="Georgia, serif" font-size="16"');
  out+=arrow(P([0,0]),P([s.L*1.14,0]),C.muted,1)+arrow(P([0,0]),P([0,s.L*1.14]),C.muted,1);
  out+=text(x0+size+45,y0+5,'x')+text(x0-5,y0-size-48,'y')+text(x0-17,y0+21,'0')+text(x0+size,y0+22,'L');
  for(const cell of cells) {
    const edges=rectangleEdges(cell.bounds,s),selected=cell.id===s.cell;
    const points=edges.map(e=>P(e.p));
    const localVisible=s.phase<3;
    out+=`<g data-field-cell="${cell.id}" class="field-cell" aria-label="小区域 ${cell.id+1}"><title>区域 ${cell.id+1}；选择后查看精确积分</title>`;
    out+=polygon(points,fillColor(cell.local/(s.L/s.n)**2,s,2),`stroke="${selected&&localVisible?C.gold:C.grid}" stroke-width="${selected&&localVisible?2:1}" opacity="${s.phase===0&&!selected ? .4 : 1}"`);
    if((s.phase===0&&selected)||s.phase===1||s.phase===2)for(let k=0;k<edges.length;k++) {
      const boundary=(k===0&&cell.j===0)||(k===1&&cell.i===s.n-1)||(k===2&&cell.j===s.n-1)||(k===3&&cell.i===0);
      const opacity=boundary?1:1-cancel;
      out+=edgeArrow2D(P(edges[k].p),P(edges[k].q),s,flux,boundary?0:3,boundary?C.green:C.orange,opacity);
    }
    if(s.phase===1&&s.n<=4) { const center=P(cell.center);out+=`<text class="cell-value" x="${center[0]}" y="${center[1]+4}" text-anchor="middle" fill="${C.deep}" font-size="12">${cell.local.toFixed(2)}</text>`; }
    out+='</g>';
  }
  if(s.arrows)for(let j=0;j<5;j++)for(let i=0;i<5;i++) {
    const xy=[(i+.4)*s.L/5,(j+.4)*s.L/5,0],v=fieldAt(xy,s),m=P(xy),d=Math.hypot(v[0],v[1]);
    if(d>1e-10)out+=arrow(m,[m[0]+v[0]/d*16,m[1]-v[1]/d*16],C.muted,1,'opacity=".33"');
  }
  const outer=rectangleEdges([0,s.L,0,s.L],s);
  out+=poly([...outer.map(e=>P(e.p)),P(outer[0].p)],C.deep,s.phase===3?3:1.5);
  if(s.phase===3)for(const e of outer)out+=edgeArrow2D(P(e.p),P(e.q),s,flux,0,C.deep);
  const selected=cells[s.cell];
  if(s.phase===0||s.phase===1) {
    const center=P(selected.center);
    out+=`<circle cx="${center[0]}" cy="${center[1]}" r="4" fill="${C.gold}"/>`;
    out+=poly([[center[0],center[1]], [173,center[1]],[150,233]],C.gold,1.2,'stroke-dasharray="3 3"');
    out+=text(32,211,`选中区域 ${s.cell+1}`,`fill="${C.gold}" font-weight="600"`);
    out+=text(32,231,flux?'读它的净流出':'读它的微小环流');
    out+=text(32,251,'点击方格可切换');
  }
  if(s.phase===2&&pair) {
    const edge=rectangleEdges(cells[pair[0].cell].bounds,s)[pair[0].side];
    out+=line(P(edge.p),P(edge.q),C.gold,4,'opacity=".65"');
    const mid=P([(edge.p[0]+edge.q[0])/2,(edge.p[1]+edge.q[1])/2]);
    out+=poly([mid,[585,190],[603,179]],C.gold,1,'stroke-dasharray="3 4"');
    out+=text(610,166,'同一条公共边',`fill="${C.gold}" font-weight="600"`)+text(610,186,'两次 · 相反定向')+text(610,206,'不是把场删掉');
  } else {
    out+=text(594,205,flux?'法向箭头':'绕行箭头',`fill="${C.deep}" font-weight="600"`)+text(594,225,s.orientation===1?(flux?'朝外':'逆时针'):(flux?'朝内':'顺时针'));
  }
  out+=text(27,436,flux?'橙：每格的法向约定　绿：整体的边界法向':'橙：每格的边界定向　绿：整体的边界定向','font-size="11"');
  out+=text(733,436,'细灰箭头仅表示 F 的方向','text-anchor="end" font-size="10"');
  return out+end;
}
function projector(s) {
  const t=.72+s.viewAngle*Math.PI/180,maxZ=s.stage==='stokes'?Math.max(s.h,s.L*.6):s.L;
  const scale=Math.min(248/s.L,310/(.55*s.L+.81*maxZ));
  return p=>[371+scale*(Math.cos(t)*(p[0]-s.L/2)-Math.sin(t)*(p[1]-s.L/2)),
    337+scale*(.46*(Math.sin(t)*(p[0]-s.L/2)+Math.cos(t)*(p[1]-s.L/2))-.81*p[2])];
}
function depth(p,s) {const t=.72+s.viewAngle*Math.PI/180;return Math.sin(t)*p[0]+Math.cos(t)*p[1]+p[2]*.15;}
function pointMean(a) {return [0,1,2].map(i=>a.reduce((v,p)=>v+p[i],0)/a.length);}
function axisScene(s,P) {
  let out='';
  for(let i=0;i<=4;i++) {
    const t=i*s.L/4;
    out+=line(P([t,0,0]),P([t,s.L,0]),C.grid,.7)+line(P([0,t,0]),P([s.L,t,0]),C.grid,.7);
  }
  const origin=P([0,0,0]);
  for(let k=0;k<3;k++) {
    const p=[0,0,0];p[k]=s.L*1.18;const q=P(p);
    out+=arrow(origin,q,C.muted,1)+text(q[0]+5,q[1]-4,['x','y','z'][k]);
  }
  return out;
}
function curvedEdge(e,s,P) {
  const a=e.uv[0],b=e.uv[1],points=[];
  for(let i=0;i<=12;i++) {const t=i/12;points.push(P(surfacePoint(a[0]*(1-t)+b[0]*t,a[1]*(1-t)+b[1]*t,s)));}
  return points;
}
export function stokesFieldSVG(s) {
  const P=projector(s),cells=gridCells(s),pair=selectedPair(s,cancellationLedger(s));
  let out=begin('Stokes 曲面网格：有向小曲面边缘的环流在公共曲线上抵消，只剩固定的外边界。');
  out+=text(27,32,'04 · 把 Green 的面弯起来',`fill="${C.deep}" font-weight="600"`)+text(733,32,'边界仍在 z = 0','text-anchor="end"');
  out+=axisScene(s,P);
  const sorted=[...cells].sort((a,b)=>depth(a.center,s)-depth(b.center,s));
  for(const cell of sorted) {
    const edges=rectangleEdges(cell.bounds,s,true),all=edges.flatMap(e=>curvedEdge(e,s,P));
    const selected=cell.id===s.cell;
    out+=`<g data-field-cell="${cell.id}" class="field-cell"><title>曲面片 ${cell.id+1}；参数区域映到曲面</title>`;
    out+=polygon(all,fillColor(cell.local/(s.L/s.n)**2,s,2),`stroke="${selected&&s.phase<3?C.gold:C.grid}" stroke-width="${selected&&s.phase<3?2:1}"`);
    for(let k=0;k<4;k++) {
      const boundary=(k===0&&cell.j===0)||(k===1&&cell.i===s.n-1)||(k===2&&cell.j===s.n-1)||(k===3&&cell.i===0);
      if(s.phase===3&&!boundary)continue;
      if(s.phase===0&&!selected&&!boundary)continue;
      const points=curvedEdge(edges[k],s,P),a=points[4],b=points[8];
      const opacity=boundary?1:s.phase===2?1-s.cancel:1;
      if(boundary)out+=poly(points,C.deep,2.6);
      out+=edgeArrow2D(a,b,s,false,boundary?0:3,boundary?C.deep:C.orange,opacity);
    }
    out+='</g>';
  }
  for(const swap of [false,true]) {const section=[];for(let j=0;j<=36;j++){const u=j*s.L/36;section.push(P(surfacePoint(swap?s.L/2:u,swap?u:s.L/2,s)));}out+=poly(section,C.green,1.25,'opacity=".65"');}
  const c=cells[s.cell],point=surfacePoint(c.center[0],c.center[1],s),normal=surfaceNormal(c.center[0],c.center[1],s),start=P(point);
  const to=P(point.map((x,i)=>x+normal.unit[i]*s.L*.2));
  out+=arrow(start,to,C.blue,2.6)+text(to[0]+7,to[1]-5,'n',`fill="${C.blue}" font-size="16" font-style="italic"`);
  const curlEnd=P([point[0],point[1],point[2]+s.L*.19*(s.b<0?-1:1)]);
  if(s.b!==0&&s.arrows)out+=arrow(start,curlEnd,C.green,2)+text(curlEnd[0]+9,curlEnd[1]+12,'curl F',`fill="${C.green}"`);
  if(s.phase===2&&pair) {
    const e=rectangleEdges(cells[pair[0].cell].bounds,s,true)[pair[0].side];
    out+=poly(curvedEdge(e,s,P),C.gold,4,'opacity=".7"');
  }
  out+=text(29,122,'同一条边界',`fill="${C.deep}" font-weight="600"`)+text(29,143,'不同的曲面')+text(29,164,'调节隆起 h ↓');
  out+=text(592,157,'蓝色：单位法向',`fill="${C.blue}"`)+text(592,177,'绿色：旋度方向')+text(592,197,'二者不必重合');
  out+=text(27,435,'曲面网格只为显示；积分使用精确参数化。','font-size="11"')+text(733,435,'边界定向与 n 配套','text-anchor="end" font-size="11"');
  return out+end;
}
function vertices(box,axis,side) {
  const val=box[2*axis+(side>0?1:0)],others=[0,1,2].filter(i=>i!==axis);
  return [[0,0],[1,0],[1,1],[0,1]].map(bits=> {
    const p=[0,0,0];p[axis]=val;others.forEach((k,i)=>{p[k]=box[2*k+bits[i]];});return p;
  });
}
export function gaussFieldSVG(s) {
  const P=projector(s),cells=gridCells(s),d=s.L/s.n,faces=[];
  let out=begin('Gauss 体元网格：公共面的两个外法向相反，内部通量抵消，剩下闭合外壳的净通量。');
  out+=text(27,32,'03 · 从小区域，升级到小体积',`fill="${C.deep}" font-weight="600"`)+text(733,32,'V = [0, L]³','text-anchor="end"');
  out+=axisScene(s,P);
  const selected=cells[s.cell],pair=selectedPair(s,cancellationLedger(s));
  for(const cell of cells)for(let axis=0;axis<3;axis++)for(const side of [-1,1]) {
    const coord=[cell.i,cell.j,cell.k][axis],boundary=side<0?coord===0:coord===s.n-1;
    const focus=cell.k===s.slice||cell.id===s.cell;
    if(s.phase===3&&!boundary)continue;
    if(s.phase===0&&!boundary&&cell.id!==s.cell)continue;
    if(s.phase===2&&!boundary&&s.cancel>=1)continue;
    if(!boundary&&side<0&&cell.id!==s.cell)continue;
    let v=vertices(cell.bounds,axis,side);
    const gap=s.phase===1?.11:s.phase===2?.11*(1-s.cancel):0;
    v=v.map(p=>p.map((x,i)=>x+gap*d*([cell.i,cell.j,cell.k][i]-(s.n-1)/2)));
    let opacity=boundary?.45:focus?.57:.06;
    if(s.phase===0)opacity=cell.id===s.cell?.85:.09;
    if(s.phase===2&&!boundary)opacity*=1-s.cancel;
    if(s.phase===3)opacity=side>0?.55:.22;
    faces.push({v,cell,axis,side,boundary,opacity,focus,depth:depth(pointMean(v),s)});
  }
  faces.sort((a,b)=>a.depth-b.depth);
  for(const item of faces) {
    const {v,cell,boundary,opacity,side,axis,focus}=item;
    const fill=cell.local>=0?'#81b6a1':'#d2a389';
    out+=`<g data-field-cell="${cell.id}" class="field-cell"><title>体元 ${cell.id+1}；第 ${cell.k+1} 层</title>${polygon(v.map(P),fill,`fill-opacity="${f(opacity)}" stroke="${cell.id===s.cell&&s.phase<3?C.gold:boundary?C.green:C.grid}" stroke-opacity="${f(Math.min(1,opacity+.2))}" stroke-width="${cell.id===s.cell&&s.phase<3?1.7:.9}"`)}</g>`;
    if((boundary&&s.phase===3&&cell.i%s.n===Math.floor(s.n/2))||(cell.id===s.cell&&s.phase<2&&side>0)) {
      const center=pointMean(v),to=[...center];to[axis]+=side*s.orientation*d*.6;
      out+=arrow(P(center),P(to),boundary?C.deep:C.orange,2);
    }
  }
  if(pair&&s.phase===2) {
    const e=pair[0],c=cells[e.cell],side=e.side%2===0?-1:1,axis=Math.floor(e.side/2);
    const verts=vertices(c.bounds,axis,side),center=pointMean(verts);
    out+=polygon(verts.map(P),'#f5d9a2','fill-opacity=".5" stroke="#ae7b31" stroke-width="2"');
    for(const sign of [-1,1]) {
      const to=[...center];to[axis]+=sign*d*.75;
      const p=P(center);p[1]+=sign*4;const q=P(to);q[1]+=sign*4;
      out+=arrow(p,q,sign>0?C.orange:C.green,2.8);
    }
    out+=text(575,165,'同一面，两侧法向',`fill="${C.gold}" font-weight="600"`)+text(575,186,'F · n 与 F · (−n)')+text(575,207,'抵消的是有向积分');
  } else {
    out+=text(579,140,s.phase===3?'六个面都属于外壳':'透视观察 · 非真实分离',`fill="${C.deep}" font-weight="600"`)+text(579,162,s.phase===3?'背面也计入通量':'高亮层可用下方滑块切换');
  }
  if(s.arrows) { const center=selected.center,v=fieldAt(center,s),len=Math.hypot(...v);if(len>1e-10){const q=center.map((x,i)=>x+v[i]/len*d*.75);out+=arrow(P(center),P(q),'#526a71',2)+text(P(q)[0]+7,P(q)[1]+7,'F',`fill="#526a71"`);}}
  out+=text(28,111,s.orientation===1?'定向：朝外':'定向：朝内',`fill="${C.deep}" font-weight="600"`)+text(28,133,'法向不是流速');
  out+=text(27,435,s.phase===3?'闭合外边界是曲面，不是一条曲线。':'透明度用于看见体元；分块不改变原来的向量场。','font-size="11"');
  return out+end;
}
export function unificationSVG(s) {
  let out=begin('统一关系：Green 和 Stokes 累积旋度得到边界环流；平面通量和 Gauss 累积散度得到外边界净通量。');
  const cols=[50,285,520],titles=['Green','Gauss','Stokes'];
  cols.forEach((x,i)=> {
    out+=`<rect x="${x}" y="46" width="188" height="270" rx="12" fill="white" stroke="#d7e4dc"/>`;
    out+=text(x+20,76,titles[i],`font-family="Georgia, serif" font-size="23" fill="${C.deep}"`);
    if(i===0) {
      for(let k=0;k<4;k++)for(let j=0;j<4;j++)out+=`<rect x="${x+42+k*25}" y="107" width="25" height="100" fill="none" stroke="#d7e4dc"/>`+line([x+42,107+j*25],[x+142,107+j*25],C.grid,1);
      out+=poly([[x+42,107],[x+142,107],[x+142,207],[x+42,207],[x+42,107]],C.green,3);
      out+=text(x+94,248,'平面上的旋度','text-anchor="middle"')+text(x+94,285,'面积 → 边界环流',`text-anchor="middle" fill="${C.deep}"`);
    } else if(i===1) {
      const A=[x+45,140],B=[x+103,116],D=[x+145,145],E=[x+85,170],shift=p=>[p[0],p[1]+58];
      out+=polygon([A,B,D,E],'#deece3','stroke="#257966"')+polygon([A,E,shift(E),shift(A)],'#c3dccd','stroke="#257966"')+polygon([E,D,shift(D),shift(E)],'#b0d3c1','stroke="#257966"');
      out+=arrow([x+83,143],[x+83,101],C.orange,2)+arrow([x+123,182],[x+156,201],C.orange,2);
      out+=text(x+94,248,'体积中的散度','text-anchor="middle"')+text(x+94,285,'体积 → 外壳通量',`text-anchor="middle" fill="${C.deep}"`);
    } else {
      out+=`<path d="M${x+30} 199 Q${x+68} 91 ${x+120} 142 Q${x+146} 152 ${x+163} 199 Z" fill="#dcebdd" stroke="#257966" stroke-width="2"/>`;
      out+=arrow([x+94,154],[x+74,109],C.blue,2)+arrow([x+67,201],[x+122,201],C.green,2);
      out+=text(x+94,248,'曲面法向的旋度','text-anchor="middle"')+text(x+94,285,'曲面 → 边缘环流',`text-anchor="middle" fill="${C.deep}"`);
    }
  });
  out+=text(380,360,'抵消机制相同，不代表被积量相同。',`text-anchor="middle" fill="${C.deep}" font-size="18"`);
  out+=text(380,400,'区域里面累积什么？边界上就测量与之配套的量。','text-anchor="middle" font-size="13"');
  return out+end;
}
export function holeSVG(hole) {
  let out=`<svg viewBox="0 0 340 190" role="img" aria-label="${hole?'环域的外边界逆时针、内边界顺时针，总环流为零':'圆盘包含原点，向量场在原点没有定义，不能使用 Green 公式'}" xmlns="http://www.w3.org/2000/svg"><rect width="340" height="190" fill="#f6f9f3"/><g font-family="system-ui" font-size="12" fill="#456856">`;
  out+='<circle cx="94" cy="92" r="66" fill="#dcebdd" stroke="#257966" stroke-width="2"/>';
  out+=arrow([157,79],[153,67],C.green,2)+text(180,54,'外边界：+2π');
  if(hole)out+='<circle cx="94" cy="92" r="28" fill="#f6f9f3" stroke="#bd633f" stroke-width="2"/>'+arrow([119,76],[122,92],C.orange,2)+text(180,92,'内边界：−2π')+text(180,127,'总环流 = 0');
  else out+=text(83,99,'×',`fill="${C.orange}" font-size="24"`)+text(180,92,'原点没有定义',`fill="${C.orange}"`)+text(180,127,'条件不满足');
  return out+'</g></svg>';
}
export function fieldScene(s) {
  return s.stage==='gauss'?gaussFieldSVG(s):s.stage==='stokes'?stokesFieldSVG(s):s.stage==='unify'?unificationSVG(s):planeFieldSVG(s);
}

/** Exact polynomial integral engine for the unified field lab.
 * Rendering samples do not enter any integral. Floating-point display is rounded;
 * the equalities are justified algebraically in docs/FIELD-MATHEMATICS.md.
 * D=[0,L]^2, V=[0,L]^3. c is a dimensionless profile coefficient in lab units.
 */
export const STAGES = ['green', 'flux', 'gauss', 'stokes', 'unify'];
export const dot3 = (a,b) => a.reduce((sum,x,i)=>sum+x*b[i],0);
export const sub3 = (a,b) => a.map((v,i)=>v-b[i]);
export const length3 = v => Math.hypot(...v);
export const integral1 = (lo,hi) => hi-lo;
export const integralX = (lo,hi) => (hi-lo)*(lo+hi)/2;
export const integralX2 = (lo,hi) => (hi-lo)*(lo*lo+lo*hi+hi*hi)/3;
export const integralX3 = (lo,hi) => (hi-lo)*(lo+hi)*(lo*lo+hi*hi)/4;
export function fieldAt([x,y,z],s) {
  return [s.a*(x+s.c*x*x)-s.b*y/2, s.a*y+s.b*(x+s.c*x*x)/2, s.a*z];
}
export function potential([x,y,z],s) { return s.a*(x*x/2+s.c*x*x*x/3+y*y/2+z*z/2); }
export function curlAt([x],s) { return [0,0,s.b*(1+s.c*x)]; }
export function divergenceAt([x],s,dimension=3) { return s.a*(dimension+2*s.c*x); }
export function surfacePoint(u,v,s) {
  const U=u/s.L,V=v/s.L;
  return [u,v,16*s.h*U*(1-U)*V*(1-V)];
}
export function surfaceDerivatives(u,v,s) {
  const U=u/s.L,V=v/s.L;
  return { zu:16*s.h/s.L*(1-2*U)*V*(1-V), zv:16*s.h/s.L*U*(1-U)*(1-2*V) };
}
export function surfaceNormal(u,v,s) {
  const {zu,zv}=surfaceDerivatives(u,v,s);
  const areaVector=[-zu,-zv,1],jacobian=length3(areaVector);
  return {areaVector,jacobian,unit:areaVector.map(x=>s.orientation*x/jacobian)};
}
/** Integral F.dr for axis-aligned parameter-grid edges of either flat D or S.
 * x,y vary affinely; z may follow the curved patch, not a straight chord.
 * Gradient part = endpoint potential difference. Rotational part is integrated
 * as a quadratic polynomial in the edge parameter. No quadrature involved.
 */
export function circulationEdge(p,q,s) {
  const [dx,dy]=sub3(q,p), avgX=(p[0]+q[0])/2,avgY=(p[1]+q[1])/2;
  const avgX2=(p[0]**2+p[0]*q[0]+q[0]**2)/3;
  return potential(q,s)-potential(p,s)+s.b/2*(-avgY*dx+(avgX+s.c*avgX2)*dy);
}
/** Flux P dy - Q dx across the RIGHT normal of an oriented planar edge. */
export function planarFluxEdge(p,q,s) {
  const dx=q[0]-p[0],dy=q[1]-p[1],x=(p[0]+q[0])/2,y=(p[1]+q[1])/2;
  const x2=(p[0]**2+p[0]*q[0]+q[0]**2)/3;
  return (s.a*(x+s.c*x2)-s.b*y/2)*dy-(s.a*y+s.b*(x+s.c*x2)/2)*dx;
}
export function rectangleEdges(rect,s,curved=false) {
  const [x0,x1,y0,y1]=rect;
  const xy=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
  const points=xy.map(([u,v])=>curved?surfacePoint(u,v,s):[u,v,0]);
  return points.map((p,i)=>({p,q:points[(i+1)%4],uv:[xy[i],xy[(i+1)%4]]}));
}
export function rectangleLocal(rect,s,mode='green') {
  const [x0,x1,y0,y1]=rect,dx=x1-x0,dy=y1-y0;
  return s.orientation*(mode==='flux'?s.a*(2*dx+2*s.c*integralX(x0,x1))*dy:s.b*(dx+s.c*integralX(x0,x1))*dy);
}
export function rectangleBoundary(rect,s,mode='green') {
  return rectangleEdges(rect,s,mode==='stokes').map(e=>s.orientation*(mode==='flux'?planarFluxEdge(e.p,e.q,s):circulationEdge(e.p,e.q,s)));
}
/** Outward integral on one planar face, independently evaluated from F.
 * box = [x0,x1,y0,y1,z0,z1], axis 0/1/2, side -1/+1.
 */
export function faceFlux(box,axis,side,s) {
  const [x0,x1,y0,y1,z0,z1]=box,dx=x1-x0,dy=y1-y0,dz=z1-z0;
  const x=side<0?x0:x1,y=side<0?y0:y1,z=side<0?z0:z1;
  if(axis===0)return side*((s.a*(x+s.c*x*x))*dy-s.b*integralX(y0,y1)/2)*dz;
  if(axis===1)return side*(s.a*y*dx+s.b*(integralX(x0,x1)+s.c*integralX2(x0,x1))/2)*dz;
  return side*s.a*z*dx*dy;
}
export function boxLocal(box,s) {
  const [x0,x1,y0,y1,z0,z1]=box;
  return s.orientation*s.a*(3*(x1-x0)+2*s.c*integralX(x0,x1))*(y1-y0)*(z1-z0);
}
export function boxFaces(box,s) {
  const faces=[];
  for(let axis=0;axis<3;axis++)for(const side of [-1,1])faces.push({axis,side,value:s.orientation*faceFlux(box,axis,side,s)});
  return faces;
}
export function gridCells(s,mode=s.stage) {
  const n=s.n,d=s.L/n,is3=mode==='gauss',cells=[];
  for(let k=0;k<(is3?n:1);k++)for(let j=0;j<n;j++)for(let i=0;i<n;i++) {
    const rect=[i*d,(i+1)*d,j*d,(j+1)*d], box=[...rect,k*d,(k+1)*d];
    const id=i+n*j+n*n*k;
    const bounds=is3?box:rect;
    cells.push({id,i,j,k,bounds,center:[(i+.5)*d,(j+.5)*d,is3?(k+.5)*d:0],
      local:is3?boxLocal(box,s):rectangleLocal(rect,s,mode),
      sides:is3?boxFaces(box,s).map(f=>f.value):rectangleBoundary(rect,s,mode)});
  }
  return cells;
}
export function domainLocal(s,mode=s.stage) {
  const rect=[0,s.L,0,s.L];
  return mode==='gauss'?boxLocal([...rect,0,s.L],s):rectangleLocal(rect,s,mode==='unify'?'green':mode);
}
export function domainBoundaryParts(s,mode=s.stage) {
  const rect=[0,s.L,0,s.L];
  return mode==='gauss'?boxFaces([...rect,0,s.L],s).map(f=>f.value):rectangleBoundary(rect,s,mode==='unify'?'green':mode);
}
export function domainBoundary(s,mode=s.stage) { return domainBoundaryParts(s,mode).reduce((a,b)=>a+b,0); }
/** Incidence keys express geometry only. Values are independently integrated
 * by each cell in its own induced direction. Interior opposite signs are tested,
 * never manufactured by copying and negating one precomputed number.
 */
export function contributions(s,mode=s.stage) {
  const entries=[], n=s.n;
  for(const cell of gridCells(s,mode)) {
    const {i,j,k}=cell;
    if(mode==='gauss') {
      let index=0;
      for(let axis=0;axis<3;axis++)for(const side of [-1,1]) {
        const pos=[i,j,k];if(side===1)pos[axis]++;
        const key=`f:${axis}:${pos.join(':')}`;
        entries.push({key,cell:cell.id,side:index,value:cell.sides[index++],boundary:pos[axis]===0||pos[axis]===n,axis,direction:s.orientation*side});
      }
    } else {
      const keys=[`h:${i}:${j}`,`v:${i+1}:${j}`,`h:${i}:${j+1}`,`v:${i}:${j}`];
      const boundary=[j===0,i===n-1,j===n-1,i===0];
      for(let side=0;side<4;side++)entries.push({key:keys[side],cell:cell.id,side,value:cell.sides[side],boundary:boundary[side],direction:s.orientation*(side<2?1:-1)});
    }
  }
  return entries;
}
export function cancellationLedger(s,mode=s.stage) {
  const map=new Map();
  for(const e of contributions(s,mode)) {if(!map.has(e.key))map.set(e.key,[]);map.get(e.key).push(e);}
  const pairs=[],outer=[];
  for(const group of map.values()) {if(group.length===2)pairs.push(group);else outer.push(...group);}
  const local=gridCells(s,mode).reduce((v,c)=>v+c.local,0);
  const interior=pairs.reduce((v,p)=>v+p[0].value+p[1].value,0);
  const boundary=outer.reduce((v,e)=>v+e.value,0);
  return {pairs,outer,local,interior,boundary,all:boundary+interior,cellCount:s.n**(mode==='gauss'?3:2)};
}
export function selectedPair(s,ledger) {
  return ledger.pairs.find(p=>p.some(e=>e.cell===s.cell))??ledger.pairs[0];
}
export function cellData(s) {
  const cells=gridCells(s),cell=cells[Math.min(cells.length-1,s.cell)],p=cell.center;
  const d=s.L/s.n;
  if(s.stage==='gauss')return {...cell,measure:d**3,density:s.orientation*divergenceAt(p,s),point:p};
  if(s.stage==='flux')return {...cell,measure:d*d,density:s.orientation*divergenceAt(p,s,2),point:p};
  const normal=s.stage==='stokes'?surfaceNormal(p[0],p[1],s):{jacobian:1,unit:[0,0,s.orientation]};
  const point=s.stage==='stokes'?surfacePoint(p[0],p[1],s):p;
  return {...cell,measure:d*d,density:dot3(curlAt(point,s),normal.unit),pullback:s.orientation*curlAt(point,s)[2],jacobian:normal.jacobian,point};
}
export function labCSV(s) {
  const rows=['# MA Playground unified field lab; independently evaluated analytic cell integrals (rounded floating-point output).',
    `# ${JSON.stringify({stage:s.stage,a:s.a,b:s.b,c:s.c,L:s.L,h:s.h,n:s.n,orientation:s.orientation})}`,
    'cell,i,j,k,local_integral,sum_boundary_integrals,difference'];
  for(const c of gridCells(s,s.stage==='unify'?'green':s.stage)) {
    const sum=c.sides.reduce((v,x)=>v+x,0);
    rows.push([c.id,c.i,c.j,c.k,c.local,sum,c.local-sum].join(','));
  }
  return rows.join('\n')+'\n';
}

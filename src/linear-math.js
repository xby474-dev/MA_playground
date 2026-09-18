/** Pure mathematical model. No DOM, finite differences, sampling-based theorem decisions,
 * or matrix inversion. All presets are globally smooth polynomials on R^2.
 */
export const lmMaps = {
  cubic: { id:'cubic', name:'弯折与抬升', formula:'F(u,v) = (u² − v, u³ + v)', note:'同一映射走完四站；沿 v=0 得到 (t²,t³)。', remainder:'R = (h₁², 3p₁h₁² + h₁³)', bound:'ρ √(1 + (3|p₁| + ρ)²)' },
  quadratic: { id:'quadratic', name:'交叉弯曲', formula:'F(u,v) = (u + v²/2, v + u²/2)', note:'一个温和的二次正例；中值等式在中点可以同时成立。', remainder:'R = (h₂²/2, h₁²/2)', bound:'ρ/2' },
  affine: { id:'affine', name:'线性变换 + 平移', formula:'F(u,v) = (u + 0.7v + 0.35, −0.4u + 1.1v − 0.2)', note:'平移消失在线性增量里；预测对任意大小的位移都准确。', remainder:'R = (0, 0)', bound:'0' }
};
export const lmOuters = {
  bend: { name:'再经过一个弯曲映射', formula:'G(r,s) = (r + 0.4s², s + 0.35rs)' },
  mix: { name:'再经过一台线性机器', formula:'G(r,s) = (r + s, −0.5r + s)' }
};
export function lmAdd(a,b){return a.map((v,i)=>v+b[i]);}
export function lmSub(a,b){return a.map((v,i)=>v-b[i]);}
export function lmScale(a,t){return a.map(v=>v*t);}
export function lmDot(a,b){return a.reduce((s,v,i)=>s+v*b[i],0);}
export function lmNorm(a){return Math.hypot(...a);}
export function lmMV(A,x){return A.map(row=>lmDot(row,x));}
export function lmMM(B,A){return B.map(row=>A[0].map((_,j)=>row.reduce((s,v,k)=>s+v*A[k][j],0)));}
export function lmFrobenius(A){return Math.hypot(...A.flat());}
export function lmDet(A){return A[0][0]*A[1][1]-A[0][1]*A[1][0];}
export function lmRotation(deg){const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return [[c,-s],[s,c]];}
export function lmUnit(deg){const a=deg*Math.PI/180;return [Math.cos(a),Math.sin(a)].map(v=>Math.abs(v)<1e-14?0:v);}
export function lmF(id,p){const [u,v]=p;
  if(id==='affine')return [u+.7*v+.35,-.4*u+1.1*v-.2];
  if(id==='quadratic')return [u+.5*v*v,v+.5*u*u];
  return [u*u-v,u*u*u+v];
}
export function lmJ(id,p){const [u,v]=p;
  if(id==='affine')return [[1,.7],[-.4,1.1]];
  if(id==='quadratic')return [[1,v],[u,1]];
  return [[2*u,-1],[3*u*u,1]];
}
/** Stable algebraic differences, rather than subtracting nearly equal endpoint values. */
export function lmR(id,p,h){const [s,t]=h;
  if(id==='affine')return [0,0];
  if(id==='quadratic')return [.5*t*t,.5*s*s];
  return [s*s,s*s*(3*p[0]+s)];
}
export function lmDelta(id,p,h){return lmAdd(lmMV(lmJ(id,p),h),lmR(id,p,h));}
/** A proved upper bound for sup_{||h||=rho} ||R||/rho, NOT a sampled supremum. */
export function lmBound(id,p,rho){
  if(rho<0||!Number.isFinite(rho))throw new RangeError('rho must be finite and nonnegative');
  if(id==='affine')return 0;
  if(id==='quadratic')return rho/2;
  return rho*Math.hypot(1,3*Math.abs(p[0])+rho);
}
export function lmLocal(id,p,h){const A=lmJ(id,p),pred=lmMV(A,h),R=lmR(id,p,h),rho=lmNorm(h),truth=lmAdd(pred,R);
  return {A,pred,truth,R,rho,error:lmNorm(R),ratio:rho===0?null:lmNorm(R)/rho,bound:rho===0?null:lmBound(id,p,rho)};
}
export function lmBasis(id,p,h,deg){const B=lmRotation(deg),A=lmJ(id,p),matrix=lmMM(A,B),coords=[B[0][0]*h[0]+B[1][0]*h[1],B[0][1]*h[0]+B[1][1]*h[1]];
  return {B,A,matrix,coords,physical:lmMV(matrix,coords)};
}
export function lmG(id,p){const [r,s]=p;return id==='mix'?[r+s,-.5*r+s]:[r+.4*s*s,s+.35*r*s];}
export function lmJG(id,p){const [r,s]=p;return id==='mix'?[[1,1],[-.5,1]]:[[1,.8*s],[.35*s,1+.35*r]];}
export function lmGR(id,k){return id==='mix'?[0,0]:[.4*k[1]*k[1],.35*k[0]*k[1]];}
export function lmGDelta(id,p,k){return lmAdd(lmMV(lmJG(id,p),k),lmGR(id,k));}
export function lmChain(id,outer,p,h){const local=lmLocal(id,p,h),at=lmF(id,p),B=lmJG(outer,at),product=lmMM(B,local.A),two=lmMV(B,local.pred),one=lmMV(product,h),truth=lmGDelta(outer,at,local.truth),R=lmAdd(lmMV(B,local.R),lmGR(outer,local.truth));
  const rho=local.rho,Cg=outer==='mix'?0:Math.hypot(.4,.35/2),rf=lmBound(id,p,rho),a=lmFrobenius(local.A),b=lmFrobenius(B);
  return {...local,at,B,product,two,one,truth,R,error:lmNorm(R),ratio:rho===0?null:lmNorm(R)/rho,bound:rho===0?null:b*rf+Cg*(a+rf)**2*rho,wrong:lmMV(lmMM(local.A,B),h),algebraResidual:lmNorm(lmSub(two,one))};
}
/** Coefficients C0..C3 of F(p+lambda*(y-p)), independently expanded. */
export function lmCurveCoefficients(id,p,y){const [u,v]=p,[s,t]=lmSub(y,p);
  if(id==='affine')return [lmF(id,p),[s+.7*t,-.4*s+1.1*t],[0,0],[0,0]];
  if(id==='quadratic')return [lmF(id,p),[s+v*t,t+u*s],[.5*t*t,.5*s*s],[0,0]];
  return [lmF(id,p),[2*u*s-t,3*u*u*s+t],[s*s,3*u*s*s],[0,s*s*s]];
}
export function lmCurve(C,t){return C[0].map((_,j)=>C[0][j]+t*(C[1][j]+t*(C[2][j]+t*C[3][j])));}
export function lmCurveDelta(C,t){return C[0].map((_,j)=>t*(C[1][j]+t*(C[2][j]+t*C[3][j])));}
export function lmVelocity(C,t){return C[1].map((v,j)=>v+2*t*C[2][j]+3*t*t*C[3][j]);}
/** Stable algebraic quadratic solver. These are floating evaluations of exact coefficient
 * equations; existence of an interior MVT point is a theorem, not a root search. */
export function lmQuadratic(A,B,C){const scale=Math.max(Math.abs(A),Math.abs(B),Math.abs(C));
  if(scale===0)return {all:true,roots:[],equation:[A,B,C]};
  let a=A/scale,b=B/scale,c=C/scale;const tol=2e-14;
  if(Math.abs(a)<tol){if(Math.abs(b)<tol)return {all:Math.abs(c)<tol,roots:[],equation:[A,B,C]};return {all:false,roots:[-c/b],equation:[A,B,C]};}
  let d=b*b-4*a*c;if(d<-tol)return {all:false,roots:[],equation:[A,B,C]};d=Math.max(0,d);
  const q=-.5*(b+(b>=0?1:-1)*Math.sqrt(d));const values=Math.abs(q)<tol?[-b/(2*a)]:[q/a,c/q];
  const roots=values.filter(Number.isFinite).sort((x,y)=>x-y).filter((x,i,s)=>i===0||Math.abs(x-s[i-1])>1e-10);
  return {all:false,roots,equation:[A,B,C]};
}
export function lmMVT(id,p,y,angle,t=.5){const C=lmCurveCoefficients(id,p,y),a=lmUnit(angle),d=lmSub(y,p),D=lmAdd(lmAdd(C[1],C[2]),C[3]),b=lmDot(a,C[2]),c=lmDot(a,C[3]),solution=lmQuadratic(3*c,2*b,-b-c),roots=solution.roots.filter(r=>r>0&&r<1);
  const z=lmAdd(p,lmScale(d,t)),curve=lmCurve(C,t),relative=lmCurveDelta(C,t),V=lmVelocity(C,t),scalar=lmDot(a,relative),chord=lmDot(a,D),slope=lmDot(a,V);
  return {C,a,d,D,z,curve,relative,V,scalar,chord,slope,residual:slope-chord,roots,all:solution.all,equation:solution.equation,distinct:lmNorm(d)>0};
}
export function lmCounterexample(){return {p:[-1,0],y:[1,0],first:[.5],second:[(1-1/Math.sqrt(3))/2,(1+1/Math.sqrt(3))/2],displacement:[0,2]};}
export function lmNumber(x,d=4){if(x===null||x===undefined)return '未定义';if(!Number.isFinite(x))return '超出数值范围';if(Object.is(x,-0)||x===0)return '0';if(Math.abs(x)<1e-3||Math.abs(x)>1e4)return x.toExponential(2);return Number(x.toFixed(d)).toString().replace('-', '−');}
export function lmVector(v,d=3){return '('+v.map(x=>lmNumber(x,d)).join(', ')+')';}
export function lmCSV(s){const p=[s.px,s.py],h=[s.hx,s.hy],rho=lmNorm(h),unit=rho?lmScale(h,1/rho):[1,0];
  const rows=['# MA Playground / Linear map lab; all values are floating evaluations of authored polynomial formulas.',`# F=${s.map}; G=${s.outer}; p=${p.join(';')}; direction=${unit.join(';')}`, 'rho,h1,h2,delta1,delta2,prediction1,prediction2,remainder_norm,normalized_error,proved_upper_bound,chain_normalized_error,chain_upper_bound'];
  for(let i=0;i<=32;i++){const r=10**(-i/8),v=lmScale(unit,r),L=lmLocal(s.map,p,v),K=lmChain(s.map,s.outer,p,v);rows.push([r,...v,...L.truth,...L.pred,L.error,L.ratio,L.bound,K.ratio,K.bound].join(','));}
  const C=lmMVT(s.map,p,[s.yx,s.yy],s.angle,s.lambda);rows.push(`# projection_angle=${s.angle}; y=${s.yx};${s.yy}; equation_A_B_C=${C.equation.join(';')}`,`# interior_roots=${C.all?'all':C.roots.join(';')}; root readings are algebraic floating evaluations, not a sampled proof.`);
  return rows.join('\n')+'\n';
}

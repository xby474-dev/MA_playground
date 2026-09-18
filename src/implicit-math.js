/** Analytic presets for the implicit-function lab. No sampled derivatives or generic root guesses. */
export const ipCurves = {
 circle:{name:'圆：一个方程，两条局部分支',formula:'F(x,y) = x² + y² − 1',note:'在圆上选工作点；自由变量的目标可能离开局部图像。'},
 parabola:{name:'抛物线：正常的全局对照',formula:'F(x,y) = y − x²',note:'解 y 时 F_y=1；改成解 x，在顶点就不一样了。'},
 flat:{name:'平坦约束：条件失败，函数仍光滑',formula:'F(x,y) = (y − x)³',note:'零集恰好是 y=x，但整条线上两个偏导都为 0。'},
 cusp:{name:'立方根：唯一，却不一定可微',formula:'F(x,y) = y³ − x',note:'在原点，y=∛x 唯一且连续，但没有有限导数。'},
 cross:{name:'交叉：不能唯一挑出依赖变量',formula:'F(x,y) = y² − x²',note:'零集是 y=x 与 y=−x。原点附近存在两支，而非唯一图像。'}
};
export const ipSurfaces = {
 bowl:{name:'二次曲面',formula:'F(x,y,z) = x² + xy + y² − z'},
 sphere:{name:'球面 · 上半球局部分支',formula:'F(x,y,z) = x² + y² + z² − 1'}
};
export function ipAdd(a,b){return a.map((v,i)=>v+b[i]);}
export function ipSub(a,b){return a.map((v,i)=>v-b[i]);}
export function ipScale(a,c){return a.map(v=>v*c);}
export function ipNorm(a){return a===null?null:Math.hypot(...a);}
export function ipMV(A,v){return A.map(row=>row.reduce((s,c,j)=>s+c*v[j],0));}
export function ipMM(A,B){return A.map(row=>B[0].map((_,j)=>row.reduce((s,c,k)=>s+c*B[k][j],0)));}
export function ipInv(A){const d=A[0][0]*A[1][1]-A[0][1]*A[1][0];return d===0?null:[[A[1][1]/d,-A[0][1]/d],[-A[1][0]/d,A[0][0]/d]];}
export function ipClamp(v,l,h){return Math.min(h,Math.max(l,v));}
export function ipNum(x,d=4){if(x===null||x===undefined)return '未定义';if(!Number.isFinite(x))return x===Infinity?'∞':'未定义';if(x===0)return '0';if(Math.abs(x)<.0001||Math.abs(x)>99999)return x.toExponential(2);return Number(x.toFixed(d)).toString().replace('-', '−');}
export function ipVec(v){return v===null?'未定义':'('+v.map(x=>ipNum(x)).join(', ')+')';}
export function ipUnit(a){const r=a*Math.PI/180;return [Math.abs(Math.cos(r))<1e-14?0:Math.cos(r),Math.abs(Math.sin(r))<1e-14?0:Math.sin(r)];}
export function ipCurveBase(s){const t=s.t;if(s.curve==='circle')return ipUnit(s.theta);if(s.curve==='parabola')return [t,t*t];if(s.curve==='cusp')return [t*t*t,t];return [t,t];}
export function ipCurveF(id,p){const [x,y]=p;switch(id){case 'circle':return x*x+y*y-1;case 'parabola':return y-x*x;case 'flat':return (y-x)**3;case 'cusp':return y*y*y-x;case 'cross':return y*y-x*x;default:throw new Error('Unknown curve');}}
export function ipCurveGradient(id,p){const [x,y]=p;switch(id){case 'circle':return [2*x,2*y];case 'parabola':return [-2*x,1];case 'flat':return [-3*(y-x)**2,3*(y-x)**2];case 'cusp':return [-1,3*y*y];case 'cross':return [-2*x,2*y];default:throw new Error('Unknown curve');}}
export function ipCurveSolve(id,free,dep,p){const i=dep==='y'?1:0,b=p[i];if(id==='circle'){const d=1-free*free;if(d<0)return null;return (b<0?-1:1)*Math.sqrt(d);}
 if(id==='parabola')return dep==='y'?free*free:(free<0?null:(b<0?-1:1)*Math.sqrt(free));
 if(id==='cusp')return dep==='y'?Math.cbrt(free):free**3;
 // For the crossing, y=x is explicitly the selected branch, not a unique zero set.
 return free;
}
export function ipCurve(s){const p=ipCurveBase(s),j=s.dep==='y'?1:0,i=1-j,gradient=ipCurveGradient(s.curve,p),A=gradient[i],B=gradient[j],formulaDg=B===0?null:-A/B,Dg=s.curve==='flat'?1:formulaDg,h=s.delta,k=Dg===null?null:Dg*h,trial=[...p];trial[i]+=h;
 const solved=ipCurveSolve(s.curve,trial[i],s.dep,p),exact=solved===null?null:trial.map((v,k)=>k===j?solved:v),pred=k===null?null:trial.map((v,l)=>l===j?v+k:v),realK=exact===null?null:exact[j]-p[j];
 let guarantee=B!==0,reason=guarantee?'定理适用：这个工作点附近有唯一 C¹ 隐函数。':'当前依赖偏导为 0：定理不给保证。';
 if(!guarantee){if(s.curve==='flat')reason='条件不满足，但零集恰好 y=x：唯一光滑隐函数仍存在。';else if(s.curve==='cusp'&&s.dep==='y')reason='y=∛x 唯一且连续，但原点没有有限导数。';else if(s.curve==='cross')reason='零集两支交叉：选定一支不等于整个零集是唯一图像。';else reason='这个方向出现折叠：同一自由变量可能有两解，另一侧可能无解。';}
 const ratio=h===0||realK===null||k===null?null:Math.abs(realK-k)/Math.abs(h);
 return {kind:'curve',p,i,j,A,B,Dg,formulaDg,explicitDerivative:s.curve==='flat',h,k,gradient,trial,pred,exact,realK,guarantee,reason,E:A*h,C:k===null?null:B*k,trialResidual:ipCurveF(s.curve,trial),predResidual:pred===null?null:ipCurveF(s.curve,pred),exactResidual:exact===null?null:ipCurveF(s.curve,exact),rho:Math.abs(h),ratio};
}
export function ipSurfaceZ(id,x,y){if(id==='bowl')return x*x+x*y+y*y;const d=1-x*x-y*y;return d<0?null:Math.sqrt(d);}
export function ipSurfaceF(id,p){const [x,y,z]=p;return id==='bowl'?x*x+x*y+y*y-z:x*x+y*y+z*z-1;}
export function ipSurface(s){const a=[s.sx,s.sy],h=[s.hx,s.hy],z=ipSurfaceZ(s.surface,...a),p=[...a,z],gradient=s.surface==='bowl'?[2*a[0]+a[1],a[0]+2*a[1],-1]:[2*a[0],2*a[1],2*z],A=[gradient.slice(0,2)],B=gradient[2],Dg=B===0?null:[A[0].map(v=>-v/B)],k=Dg?ipMV(Dg,h)[0]:null,target=ipAdd(a,h),trial=[...target,z],solved=ipSurfaceZ(s.surface,...target),exact=solved===null?null:[...target,solved],pred=k===null?null:[...target,z+k],rho=ipNorm(h),realK=solved===null?null:solved-z;
 return {kind:'surface',p,a,h,A,B,Dg,k,gradient,trial,pred,exact,realK,E:ipMV(A,h)[0],C:k===null?null:B*k,trialResidual:ipSurfaceF(s.surface,trial),predResidual:pred===null?null:ipSurfaceF(s.surface,pred),exactResidual:exact===null?null:ipSurfaceF(s.surface,exact),rho,ratio:rho===0||k===null||realK===null?null:Math.abs(realK-k)/rho,guarantee:B!==0};
}
export function ipH(x){return [x[0]+x[1]**2,x[0]**2+x[1]];}
export function ipDH(x){return [[1,2*x[1]],[2*x[0],1]];}
export function ipMatrix(l){return [[1,1],[1,1+l]];}
export function ipVectorF(x,y,l){return ipSub(ipMV(ipMatrix(l),y),ipH(x));}
export function ipVector(s){const l=s.coupling,x=l===0?[0,0]:[s.vx,s.vy],h=[s.vhx,s.vhy],B=ipMatrix(l),inverse=ipInv(B),A=ipDH(x).map(row=>row.map(v=>-v)),Dg=inverse?ipMM(inverse,ipDH(x)):null,y=inverse?ipMV(inverse,ipH(x)):[0,0],target=ipAdd(x,h),k=Dg?ipMV(Dg,h):null,E=ipMV(A,h),C=k?ipMV(B,k):null,pred=k?ipAdd(y,k):null,exact=inverse?ipMV(inverse,ipH(target)):null;
 const nonlinear=ipSub(ipH(target),ipH(x)),realK=inverse?ipMV(inverse,nonlinear):null,rest=[h[1]**2,h[0]**2],rem=inverse?ipMV(inverse,rest):null,rho=ipNorm(h);
 // At lambda=0, compatibility is the explicit polynomial identity H1-H2=(x1-x2)(1-x1-x2).
 const compatibility=(target[0]-target[1])*(1-target[0]-target[1]);const compatible=l===0&&compatibility===0;
 return {kind:'vector',x,y,h,A,B,inverse,Dg,k,E,C,pred,exact,realK,target,rest,rem,rho,ratio:rho===0||!rem?null:ipNorm(rem)/rho,guarantee:l!==0,det:l,condition:l===0?Infinity:(2+l)**2/l,trialResidual:ipScale(nonlinear,-1),predResidual:k?ipScale(rest,-1):null,exactResidual:exact?ipVectorF(target,exact,l):null,compatible,compatibility,linearCompatible:l===0&&h[0]===h[1],solution:compatible?[ipH(target)[0],0]:null};
}
export function ipEvaluate(s){return s.step==='surface'?ipSurface(s):s.step==='vector'?ipVector(s):ipCurve(s);}
export function ipMotion(s,m){const t=ipClamp(s.progress,0,3);if(m.kind==='vector'){const free=t<1?ipAdd(m.x,ipScale(m.h,t)):m.target;let y=m.y;if(t>1&&m.k)y=ipAdd(y,ipScale(m.k,Math.min(1,t-1)));if(t>2&&m.exact&&m.pred)y=ipAdd(m.pred,ipScale(ipSub(m.exact,m.pred),t-2));return {free,point:y,residual:ipVectorF(free,y,s.coupling)};}
 const p=m.p;let cur;if(t<1)cur=ipAdd(p,ipScale(ipSub(m.trial,p),t));else if(t<2)cur=m.pred?ipAdd(m.trial,ipScale(ipSub(m.pred,m.trial),t-1)):m.trial;else {const start=m.pred||m.trial;cur=m.exact?ipAdd(start,ipScale(ipSub(m.exact,start),t-2)):start;}
 return {point:cur,residual:m.kind==='surface'?ipSurfaceF(s.surface,cur):ipCurveF(s.curve,cur)};
}
export function ipErrorRows(s){return Array.from({length:37},(_,i)=>{const scale=10**(-3*i/36),q={...s};if(q.step==='surface'){q.hx*=scale;q.hy*=scale;}else if(q.step==='vector'){q.vhx*=scale;q.vhy*=scale;}else q.delta*=scale;const v=ipEvaluate(q);return {scale,rho:v.rho,ratio:v.ratio};});}
export function ipCSV(s){const m=ipEvaluate(s);const rows=ipErrorRows(s);return '# MA Playground: implicit function lab\n# Analytic preset formulas; finite floating-point values are not a proof\n# '+JSON.stringify({step:s.step,curve:s.curve,surface:s.surface,dep:s.dep,coupling:s.coupling,point:m.p??m.x})+'\nscale,input_norm,implicit_derivative_error_ratio\n'+rows.map(r=>[r.scale,r.rho,r.ratio===null?'undefined':r.ratio].join(',')).join('\n')+'\n';}

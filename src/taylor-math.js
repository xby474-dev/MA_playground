/** Analytic Taylor coefficients and bounds. No numerical differentiation or CAS.
 * Floats evaluate formulas; neither plotted samples nor rounding certify a theorem.
 */
export const taylorFunctions = {
 exp:{id:'exp',label:'eˣ',name:'指数函数',domain:'x ∈ ℝ',range:[-2,2],note:'每一阶导数都仍是 eˣ。'},
 sin:{id:'sin',label:'sin x',name:'正弦函数',domain:'x ∈ ℝ',range:[-3,3],note:'在 a=0，偶数阶系数恰好为零；有时升阶，曲线却不变。'},
 cos:{id:'cos',label:'cos x',name:'余弦函数',domain:'x ∈ ℝ',range:[-3,3],note:'在 a=0，奇数阶系数为零。导数信息来自解析公式。'},
 log:{id:'log',label:'ln(1+x)',name:'对数函数',domain:'x > −1',range:[-.75,2],note:'函数在 −1 的右侧有定义，但 Taylor 级数不是处处都代表它。'},
 reciprocal:{id:'reciprocal',label:'1/(1−x)',name:'几何级数',domain:'x ≠ 1',range:[-1,.75],note:'有限几何和给出可直接核对的精确余项公式。此实验的展开点只取 a<1。'},
 flat:{id:'flat',label:'e⁻¹⁄ˣ² · 原点补 0',name:'光滑却不解析',domain:'x ∈ ℝ',range:[0,0],note:'只在 a=0 展开。所有 Taylor 多项式都是零，但函数不恒为零。'}
};
export const TAYLOR_MAX = 12;
export function tf(id){return taylorFunctions[id] ?? taylorFunctions.exp;}
export function factorial(n){if(!Number.isInteger(n)||n<0||n>170)throw new RangeError('factorial requires an integer 0..170');let r=1;for(let k=2;k<=n;k++)r*=k;return r;}
export function tValue(id,x){
 if(!Number.isFinite(x))return null;
 switch(id){case 'exp':return Math.exp(x);case 'sin':return Math.sin(x);case 'cos':return Math.cos(x);case 'log':return x>-1?Math.log1p(x):null;case 'reciprocal':return x!==1?1/(1-x):null;case 'flat':return x===0?0:Math.exp(-1/(x*x));default:throw new RangeError('Unknown Taylor function');}
}
export function tDerivative(id,a,k){
 if(!Number.isInteger(k)||k<0||k>170)throw new RangeError('Invalid derivative order');
 if(tValue(id,a)===null)throw new RangeError('Expansion point outside domain');
 if(id==='flat'){if(a!==0)throw new RangeError('The flat example is implemented only at a=0');return 0;}
 if(k===0)return tValue(id,a);
 if(id==='exp')return Math.exp(a);
 if(id==='sin')return [Math.sin(a),Math.cos(a),-Math.sin(a),-Math.cos(a)][k%4];
 if(id==='cos')return [Math.cos(a),-Math.sin(a),-Math.cos(a),Math.sin(a)][k%4];
 if(id==='log')return (k%2?1:-1)*factorial(k-1)/(1+a)**k;
 return factorial(k)/(1-a)**(k+1);
}
export function tCoefficient(id,a,k){return tDerivative(id,a,k)/factorial(k);}
export function tCoefficients(id,a,n){return Array.from({length:n+1},(_,k)=>tCoefficient(id,a,k));}
export function tHorner(coefficients,h){let r=0;for(let i=coefficients.length-1;i>=0;i--)r=r*h+coefficients[i];return r;}
export function tPolynomial(id,a,n,x){return tHorner(tCoefficients(id,a,n),x-a);}
/** p=m+lambda means T_m+lambda*c_(m+1)*h^(m+1), NOT T_(m+1). */
export function tGrowth(p){const near=Math.round(p);if(Math.abs(p-near)<1e-9)p=near;const m=Math.floor(p);return {m,lambda:p-m,k:p===m?m:m+1,complete:p===m};}
export function tBlendCoefficients(id,a,p){const g=tGrowth(p),c=tCoefficients(id,a,g.k);if(!g.complete)c[g.k]*=g.lambda;return c;}
export function tBlend(id,a,p,x){return tHorner(tBlendCoefficients(id,a,p),x-a);}
export function tPolynomialDerivativeAtA(id,a,p,j){const g=tGrowth(p);if(j<=g.m)return tDerivative(id,a,j);if(!g.complete&&j===g.k)return g.lambda*tDerivative(id,a,j);return 0;}
export function tJet(id,a,p,count=5){const g=tGrowth(p);return Array.from({length:count},(_,j)=>{const original=tDerivative(id,a,j),approximation=tPolynomialDerivativeAtA(id,a,p,j);return {j,original,approximation,guaranteed:j<=g.m,equal:original===approximation,pending:!g.complete&&j===g.k};});}
export function tCurvature(id,a,p){const f1=tDerivative(id,a,1),f2=tDerivative(id,a,2),p1=tPolynomialDerivativeAtA(id,a,p,1),p2=tPolynomialDerivativeAtA(id,a,p,2);return {original:Math.abs(f2)/(1+f1*f1)**1.5,polynomial:Math.abs(p2)/(1+p1*p1)**1.5};}
/** A rounding scale is an explanatory heuristic, not interval arithmetic. */
export function tError(id,a,p,x){
 const y=tValue(id,x),poly=tBlend(id,a,p,x);if(y===null)return {valid:false,poly,error:null,absolute:null,method:'undefined',nearRoundoff:false};
 const g=tGrowth(p),h=x-a;
 if(h===0)return {valid:true,y,poly,error:0,absolute:0,method:'identity-at-center',nearRoundoff:false};
 // Exact finite-geometric-sum identity avoids subtractive cancellation, even outside convergence radius.
 if(id==='reciprocal'&&g.complete){const error=(h/(1-a))**(g.m+1)/(1-x);return {valid:true,y,poly,error,absolute:Math.abs(error),method:'geometric-identity',nearRoundoff:false};}
 if(id==='flat'){const error=y;return {valid:true,y,poly,error,absolute:error,method:'flat-identity',nearRoundoff:y===0};}
 const error=y-poly,c=tBlendCoefficients(id,a,p),mass=c.reduce((s,v,j)=>s+Math.abs(v*h**j),0);
 const scale=32*Number.EPSILON*Math.max(1,Math.abs(y),mass);
 return {valid:true,y,poly,error,absolute:Math.abs(error),method:'floating-difference',nearRoundoff:Math.abs(error)<=scale,roundingScale:scale};
}
/** Lagrange sufficient bound on the ENTIRE segment [a,x]. It is invalid across a pole. */
export function tBound(id,a,n,x){
 const h=Math.abs(x-a),lo=Math.min(a,x),hi=Math.max(a,x);
 if(tValue(id,x)===null)return {valid:false,reason:'观察点不在原函数的定义域内。'};
 if(id==='reciprocal'&&lo<=1&&hi>=1)return {valid:false,reason:'从 a 到 x 穿过 x=1 的奇点，不能在这段区间套用 Taylor 余项定理。'};
 if(id==='flat')return {valid:true,bound:x===0?0:Math.exp(-1/x**2),kind:'exact',M:null,formula:'|Rₙ(x)| = exp(−1/x²)（x≠0）',reason:'这是本例的精确余项，不是通用的 Lagrange 上界。'};
 let M;
 if(id==='exp')M=Math.exp(hi);
 else if(id==='sin'||id==='cos')M=1;
 else if(id==='log')M=factorial(n)/(1+lo)**(n+1);
 else M=factorial(n+1)/Math.min(Math.abs(1-a),Math.abs(1-x))**(n+2);
 return {valid:true,bound:M*h**(n+1)/factorial(n+1),M,kind:'lagrange',formula:'|Rₙ(x)| ≤ M |x−a|ⁿ⁺¹/(n+1)!',reason:'M 是整个连接区间上 |f⁽ⁿ⁺¹⁾| 的解析上界，不是采样点最大值。'};
}
export function tRadius(id,a){return id==='log'?1+a:id==='reciprocal'?Math.abs(1-a):Infinity;}
/** Series convergence AND equality to f are separate facts (flat example). */
export function tConvergence(id,a,x){
 const h=x-a,R=tRadius(id,a),u=h/R;
 if(id==='flat')return {R:Infinity,series:true,equal:x===0,kind:x===0?'center':'flat',title:x===0?'在原点，确实相等。':'级数收敛到 0，却不等于原函数。',explanation:'所有系数为零，级数在整个实轴收敛到 0；只有 x=0 时与原函数相同。收敛半径是 ∞，不是 0。'};
 if(!Number.isFinite(R))return {R,series:true,equal:true,kind:'entire',title:'每个固定实数 x，升阶最终都逼近 f(x)。',explanation:'有限阶误差未必逐阶下降；也没有宣称在整个无界实轴上一致逼近。'};
 if(Math.abs(h)<R)return {R,series:true,equal:true,kind:'inside',title:'位于开收敛区间内。',explanation:'这里 n→∞ 时 Tₙ(x)→f(x)。这是幂级数与余项的结论，不是从 12 个点推断。'};
 if(id==='log'&&h===R)return {R,series:true,equal:true,kind:'endpoint-converges',title:'右端点也收敛：端点必须单独检查。',explanation:'u=(x−a)/(1+a)=1，交错调和级数收敛到 ln 2；误差至多 1/(n+1)。'};
 if(tValue(id,x)===null)return {R,series:false,equal:false,kind:'undefined',title:'原函数在这里没有定义。',explanation:'有限 Taylor 多项式仍有值，但不能把它与不存在的 f(x) 比较；图形在这里断开。'};
 return {R,series:false,equal:false,kind:Math.abs(h)===R?'endpoint-diverges':'outside',title:Math.abs(h)===R?'这个端点不收敛。':'函数有定义，不代表 Taylor 级数能到达。',explanation:id==='log'?'|u|>1 时，uᵏ/k 的项不趋于零，所以级数发散。':'令 u=(x−a)/(1−a)。|u|≥1 时几何级数项不趋于零（u=−1 时来回振荡）。'};
}
export function tUniformBound(id,a,n,d){
 if(d<=0)return 0;
 if(id==='flat')return Math.exp(-1/d**2);
 const left=tBound(id,a,n,a-d),right=tBound(id,a,n,a+d);
 return left.valid&&right.valid?Math.max(left.bound,right.bound):Infinity;
}
/** A dyadic radius selected using a formula, never a sampled maximum.
 * Displayed evaluation is float and is not claimed to be a machine-verified enclosure. */
export function tToleranceRadius(id,a,n,epsilon,span){
 for(let j=-3;j<=28;j++){const d=2**(-j);if(d>span)continue;const bound=tUniformBound(id,a,n,d);if(Number.isFinite(bound)&&bound<epsilon*.99)return {d,bound,epsilon};}return null;
}
export function tOrderRows(s){const x=s.a+s.h;return Array.from({length:TAYLOR_MAX+1},(_,n)=>({n,coefficient:tCoefficient(s.fn,s.a,n),term:tCoefficient(s.fn,s.a,n)*s.h**n,...tError(s.fn,s.a,n,x),bound:tBound(s.fn,s.a,n,x)}));}
export function tNum(v,digits=4){if(v===null||v===undefined)return '未定义';if(!Number.isFinite(v))return v===Infinity?'∞':v===-Infinity?'−∞':'不可计算';if(v===0)return '0';if(Math.abs(v)<1e-3||Math.abs(v)>=1e5){const [m,e]=v.toExponential(2).split('e');const chars={'-':'⁻','+':'','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};return m+' ×10'+[...e].map(c=>chars[c]).join('');}return Number(v.toPrecision(digits)).toString();}
export function tCSV(s){
 const keys=['n','coefficient','term_at_probe','polynomial','f_x','signed_error','absolute_error','method','near_roundoff','lagrange_or_exact_bound'];
 const rows=tOrderRows(s).map(r=>[r.n,r.coefficient,r.term,r.poly,r.y??'',r.error??'',r.absolute??'',r.method,r.nearRoundoff,r.bound.valid?r.bound.bound:'not_applicable'].join(','));
 return `# MA Playground Taylor v1.4\n# fn=${s.fn}; a=${s.a}; h=${s.h}; x=${s.a+s.h}; target_n=${s.n}; growth=${s.p}\n# FINITE DATA, not a convergence proof. Floating evaluations, not certified interval arithmetic.\n# Rows are COMPLETE T_n; intermediate animation curves are not included.\n${keys.join(',')}\n${rows.join('\n')}\n`;
}

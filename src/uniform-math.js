/** Analytic model for the seventh notebook. Plot samples NEVER decide convergence.
 * All catalogue families have explicit S_N, S and exact norms or a named bound.
 * A sequence A_N is a series via u_1=A_1, u_n=A_n-A_{n-1} (n>=2).
 */
export const ufFamilies = {
  power:{name:'xᴺ · 每个点都能等到吗？',formula:'S_N(x)=xᴺ',series:'u₁=x；uₙ=xⁿ−xⁿ⁻¹（n≥2）',kind:'函数列 → 望远镜级数',domains:true},
  geometric:{name:'几何级数 · 换区间就不同',formula:'S_N(x)=1+x+⋯+xᴺ⁻¹',series:'uₙ(x)=xⁿ⁻¹（n≥1）',kind:'原生函数项级数',domains:true},
  alternating:{name:'交错线性项 · 一致但不正规',formula:'S_N(x)=x∑ₖ₌₁ᴺ(−1)ᵏ⁻¹/k',series:'uₙ(x)=(−1)ⁿ⁻¹x/n',kind:'原生函数项级数',domains:false},
  spike:{name:'移动尖峰 · 高度变窄，面积不走',formula:'S_N(x)=2N·max(1−|2Nx−1|,0)',series:'u₁=S₁；uₙ=Sₙ−Sₙ₋₁（n≥2）',kind:'函数列 → 望远镜级数',domains:false},
  wave:{name:'细小波纹 · 高度趋零，斜率不趋零',formula:'S_N(x)=sin(2πNx)/(2πN)',series:'u₁=S₁；uₙ=Sₙ−Sₙ₋₁（n≥2）',kind:'函数列 → 望远镜级数',domains:false},
  drift:{name:'常数漂移 · 求导会丢掉什么？',formula:'S_N(x)=N',series:'uₙ(x)=1',kind:'原生函数项级数',domains:false}
};
export const ufNodes=['normal','absolute','uniform','pointwise','continuous','integral','derivativeHyp','derivative'];
export const ufNodeNames={normal:'正规收敛 / M 证书',absolute:'逐点绝对收敛',uniform:'一致收敛',pointwise:'逐点收敛',continuous:'极限函数连续',integral:'逐项积分成立',derivativeHyp:'导数一致 + 一点收敛',derivative:'逐项求导成立'};
export function ufEscape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function ufNum(v){if(v===null||v===undefined)return '未定义';if(v===Infinity)return '+∞';if(!Number.isFinite(v))return '未定义';if(Object.is(v,-0)||v===0)return '0';if(v<1&&v>1-1e-5)return Number(v.toPrecision(15)).toString();if(Math.abs(v)<.0001||Math.abs(v)>=1e5)return v.toExponential(3);return Number(v.toPrecision(6)).toString();}
export function ufDomain(s){const mode=ufFamilies[s.family].domains?s.domain:'closed';const end=mode==='restricted'?s.r:1;return {mode,end,compact:mode!=='open',label:mode==='restricted'?`[0, ${ufNum(end)}]`:mode==='open'?'[0, 1)':'[0, 1]'};}
export function ufInDomain(s,x){const d=ufDomain(s);return Number.isFinite(x)&&x>=0&&(d.mode==='open'?x<1:x<=d.end);}
const altCache=new Map([[0,0]]);
export function ufAlt(N){if(altCache.has(N))return altCache.get(N);let sum=0,c=0;for(let k=1;k<=N;k++){const y=(k%2?1:-1)/k-c,t=sum+y;c=(t-sum)-y;sum=t;}altCache.set(N,sum);return sum;}
export function ufPartial(s,N,x){if(!Number.isInteger(N)||N<0||!ufInDomain(s,x))return null;if(N===0)return 0;switch(s.family){case 'power':return x**N;case 'geometric':return x===1?N:x===0?1:-Math.expm1(N*Math.log(x))/(1-x);case 'alternating':return x*ufAlt(N);case 'spike':return 2*N*Math.max(1-Math.abs(2*N*x-1),0);case 'wave':return Math.sin(2*Math.PI*N*x)/(2*Math.PI*N);case 'drift':return N;}return null;}
export function ufTerm(s,n,x){if(n<1||!Number.isInteger(n)||!ufInDomain(s,x))return null;return ufPartial(s,n,x)-ufPartial(s,n-1,x);}
export function ufLimit(s,x){if(!ufInDomain(s,x))return null;switch(s.family){case 'power':return x===1?1:0;case 'geometric':return x===1?null:1/(1-x);case 'alternating':return x*Math.LN2;case 'spike':case 'wave':return 0;case 'drift':return null;}return null;}
export function ufError(s,N,x){if(ufLimit(s,x)===null)return null;switch(s.family){case 'power':return x===1?0:x**N;case 'geometric':return x**N/(1-x);case 'alternating':return x*Math.abs(ufAlt(N)-Math.LN2);case 'spike':case 'wave':return Math.abs(ufPartial(s,N,x));default:return null;}}
export function ufDerivative(s,N,x){if(!ufInDomain(s,x))return null;switch(s.family){case 'power':return N===1?1:N*x**(N-1);case 'geometric':{let sum=0;for(let k=1;k<N;k++)sum+=k*x**(k-1);return sum;}case 'alternating':return ufAlt(N);case 'wave':return Math.cos(2*Math.PI*N*x);case 'spike':{const y=N*x;if(y===.5||y===1)return null;return y<.5?4*N*N:y<1?-4*N*N:0;}case 'drift':return 0;}return null;}
export function ufLimitDerivative(s,x){if(ufLimit(s,x)===null)return null;if(s.family==='power'&&x===1)return null;switch(s.family){case 'geometric':return 1/(1-x)**2;case 'alternating':return Math.LN2;case 'power':case 'spike':case 'wave':return 0;default:return null;}}
export function ufNorm(s,N=s.N){const d=ufDomain(s);switch(s.family){case 'power':return d.mode==='restricted'?{value:d.end**N,formula:'E_N=rᴺ',attained:true,note:'在 x=r 取得最大值。'}:{value:1,formula:'E_N=1',attained:false,note:d.mode==='closed'?'上确界为 1，但不取到：x<1 时误差趋近 1；x=1 的误差反而为 0。':'上确界为 1，但 1 不在区间中；不存在最大误差点。'};
case 'geometric':return d.mode==='closed'?{value:null,formula:'E_N 未定义',attained:false,note:'x=1 处 S_N(1)=N 发散，整个区间上没有有限极限函数 S。'}:d.mode==='restricted'?{value:d.end**N/(1-d.end),formula:'E_N=rᴺ/(1−r)',attained:true,note:'由余项精确公式，在 x=r 取得最大值。'}:{value:Infinity,formula:'E_N=+∞',attained:false,note:'每个 x<1 的余项有限，但固定 N 后令 x→1⁻，余项无界。∞ 不是某一点的误差。'};
case 'alternating':return {value:Math.abs(ufAlt(N)-Math.LN2),formula:'E_N=|H_N^(alt)−ln 2| ≤ 1/(N+1)',attained:true,note:'左侧来自精确表达式的浮点求值；右侧是覆盖全部 x 的解析上界。',bound:1/(N+1)};
case 'spike':return {value:2*N,formula:'E_N=2N',attained:true,note:'在移动点 x_N=1/(2N) 取得最大值。尖峰变窄，但最高误差在增大。'};
case 'wave':return {value:1/(2*Math.PI*N),formula:'E_N=1/(2πN)',attained:true,note:'例如在 x_N=1/(4N) 取得最大误差。高度统一趋零，不控制斜率。'};
default:return {value:null,formula:'E_N 未定义',attained:false,note:'S_N=N 没有有限极限，不能先指定一个 S 再称其为极限误差。'};}}
export function ufTruth(s){const d=ufDomain(s),restricted=d.mode==='restricted';let r;
switch(s.family){case 'power':r={pointwise:true,uniform:restricted,normal:restricted,absolute:true,continuous:d.mode!=='closed',integral:d.compact?true:null,derivativeHyp:restricted,derivative:true};break;
case 'geometric':r={pointwise:d.mode!=='closed',uniform:restricted,normal:restricted,absolute:d.mode!=='closed',continuous:d.mode==='closed'?null:true,integral:restricted?true:null,derivativeHyp:restricted,derivative:d.mode==='closed'?null:true};break;
case 'alternating':r={pointwise:true,uniform:true,normal:false,absolute:false,continuous:true,integral:true,derivativeHyp:true,derivative:true};break;
case 'spike':r={pointwise:true,uniform:false,normal:false,absolute:true,continuous:true,integral:false,derivativeHyp:false,derivative:null};break;
case 'wave':r={pointwise:true,uniform:true,normal:false,absolute:false,continuous:true,integral:true,derivativeHyp:false,derivative:false};break;
default:r={pointwise:false,uniform:false,normal:false,absolute:false,continuous:null,integral:null,derivativeHyp:false,derivative:null};}
return r;}
export function ufReasons(s){const d=ufDomain(s),r=ufTruth(s);const common={
 pointwise:r.pointwise?'每个固定 x 都有有限极限。N 可以随 x 改变。':'整个定义域上没有有限逐点极限；不能使用以该极限为前提的结论。',
 uniform:r.uniform?'同一个 N 能控制整个定义域及全部后续项。见解析尾部证书。':'不能用一个 N 同时控制所有点；增加有限显示项数不会改变此结论。',
 normal:r.normal?'存在可求和的 Mₙ≥sup|uₙ|。本模块“正规”指固定整个 E 上的 ∑||uₙ||∞<∞。':'这里有不正规的证明，不是“随便选了一个 Mₙ 失败”。请查看正规性说明。',
 absolute:r.absolute?'对每个固定 x，∑|uₙ(x)| 收敛。所需控制不必对全部 x 统一。':'“逐点绝对”要求每个 x；至少存在一个点，其绝对值级数发散。',
 continuous:r.continuous===null?'没有整个域上的有限 S，此结论不适用。':r.continuous?'极限函数在当前定义域上连续。连续并不反推一致收敛。':'每个 S_N 连续，但极限在 x=1 跳跃；失去一致收敛，连续性可能丢失。',
 integral:r.integral===null?'本图的积分定理只指有限闭区间的 Riemann 积分。开区间／无有限 S 不直接套用，也未把两个 +∞ 当成等式。':r.integral?'本例 lim ∫S_N=∫S 成立。非一致收敛的例子也可能恰好成立，充分不等于必要。':'lim ∫S_N=1，而 ∫S=0。每个点最终离开尖峰，并不控制全部面积。',
 derivativeHyp:r.derivativeHyp?'C¹ 部分和、导数列一致收敛、锚点 S_N(0) 收敛：三项前提都满足。':'这条箭头需要 C¹ 部分和、导数列一致收敛和一点的函数值收敛；不是只要函数列一致。',
 derivative:r.derivative===null?'当前案例不满足整个域的有限极限或逐项 C¹ 设置，不宣称整个内部可逐项求导。':r.derivative?'在区间内部，lim S_N′(x)=S′(x)。开区间几何／幂例可在每个较小闭区间局部论证。':'在内点 x=1/2，S_N′(1/2)=(−1)ᴺ 不收敛，但 S′(1/2)=0。'
};if(s.family==='drift')common.derivativeHyp='导数恒为 0，确实一致收敛；但 S_N(0)=N 不收敛。丢掉锚点就丢掉了加法常数。';if(s.family==='spike')common.derivativeHyp='每个 S_N 连续且可积，但在折点不可微，不满足逐项 C¹ 前提。';if(s.family==='alternating')common.absolute='x>0 时 ∑|uₙ(x)|=x∑1/n 发散；仅 x=0 例外。因此不是逐点绝对收敛。';if(s.family==='wave')common.absolute='在 x=1/4，奇数下标的波纹值为交替的 ±1/(2πn)，偶数下标为 0；相邻差的绝对值和包含发散的奇数调和子级数。';if(d.mode==='open'&&s.family==='power')common.continuous='在 [0,1) 上极限恒为 0，连续；仍不一致。因此“连续极限”也不反推一致。';return common;}
export function ufMajorant(s){const d=ufDomain(s);if(s.family==='geometric'){if(d.mode==='restricted')return {valid:true,title:'Mₙ=rⁿ⁻¹：同一列数控制所有点',formula:'|uₙ(x)|≤rⁿ⁻¹；∑Mₙ=1/(1−r)',tail:d.end**s.N/(1-d.end),note:'M 证书与误差上界在本例恰好相等。固定 r<1 后，尾和趋零。'};return {valid:false,title:'最小统一上界已经不可求和',formula:'sup_E |uₙ|=1；∑ₙ1=∞',note:'x<1 时可以逐点求和，但不能把每个 x 的几何系数混成一个对全域有效的 r<1。'};}
if(s.family==='power'){if(d.mode==='restricted')return {valid:true,title:'望远镜项也有 M 证书',formula:'M₁=r；Mₙ=rⁿ⁻¹ (n≥2)；∑Mₙ<∞',tail:d.end**s.N/(1-d.end),note:'本证书只是上界；实际 E_N=rᴺ 更小。不是把一个不紧的上界当实际误差。'};return {valid:false,title:'逐点绝对收敛，仍不正规',formula:'||uₙ||∞=(1/n)(1−1/n)ⁿ⁻¹ ~ 1/(en) (n≥2)',note:'最大值在 x=(n−1)/n；统一范数的级数发散，尽管每个点的绝对值望远镜和有限。'};}
if(s.family==='alternating')return {valid:false,title:'一致收敛，不需要一个可求和的 Mₙ',formula:'||uₙ||∞=1/n；∑||uₙ||∞=∞',note:'这证明不正规；一致收敛改由交错尾项界 ≤1/(N+1) 保证。'};
if(s.family==='spike')return {valid:false,title:'项的统一范数甚至不趋零',formula:'|uₙ(1/(2n))|=4−2/n ≥ 2 (n≥2)',note:'每个固定点只有有限个非零项；但不同点把各项的峰值不断接走。'};
if(s.family==='wave')return {valid:false,title:'小的部分和，不等于可求和的项范数',formula:'||uₙ||∞ ≥ 1/(2πn) (n≥2)',note:'取 xₙ=1/2+1/(4n)，两相邻波形反号，|uₙ(xₙ)|=1/(2πn)+cos(π/(2n))/(2π(n−1))。故不正规。'};
return {valid:false,title:'每项恒为 1',formula:'||uₙ||∞=1',note:'原级数已经逐点发散。'};}
function waitGeometric(base,factor,eps){if(base===0||factor===0)return 1;const raw=Math.floor(Math.log(eps/factor)/Math.log(base))+1;let N=Math.max(1,raw);if(!Number.isSafeInteger(N))return Infinity;while(factor*base**N>=eps)N++;return N;}
export function ufCertificate(s,x=null){const e=s.eps,d=ufDomain(s),uniform=x===null;if(!uniform&&!ufInDomain(s,x))return {N:null,reason:'观察点不在定义域内。'};if(uniform&&!ufTruth(s).uniform)return {N:null,reason:'不存在对全域与全部后续项有效的统一 N。'};
let N,formula;
switch(s.family){case 'power':{const b=uniform?d.end:x;N=b===1?1:waitGeometric(b,1,e);formula=b===1?'x=1 的误差对每一项都为 0。':`m≥N 时，误差 ≤ ${ufNum(b)}ᴺ < ε。`;break;}
case 'geometric':{const b=uniform?d.end:x;if(b===1)return {N:null,reason:'x=1 处部分和 N 发散。'};N=waitGeometric(b,1/(1-b),e);formula=`m≥N 时，误差 ≤ ${ufNum(b)}ᴺ/(1−${ufNum(b)}) < ε。`;break;}
case 'alternating':{const b=uniform?1:x;N=Math.max(1,Math.floor(b/e)+1);formula=`m≥N 时，误差 ≤ ${ufNum(b)}/(m+1) ≤ ${ufNum(b)}/(N+1) < ε。`;break;}
case 'wave':N=Math.floor(1/(2*Math.PI*e))+1;formula='m≥N 时，误差 ≤ 1/(2πm) ≤ 1/(2πN) < ε。';break;
case 'spike':N=x===0?1:Math.floor(1/x)+1;formula=x===0?'x=0 时所有项均为 0。':'m≥N>1/x 时，该固定 x 已在全部后续尖峰支集外，误差为 0。';break;
default:return {N:null,reason:'没有有限极限，不能给出收敛证书。'};}
return {N,formula,reason:uniform?'一个 N，对所有 x 与所有 m≥N 有效。':'先固定这个 x，再选择 N；也控制所有 m≥N。',uniform};}
export function ufProbe(s){const d=ufDomain(s);if(s.track==='fixed')return Math.min(s.x*d.end,d.mode==='open'?1-1e-9:d.end);switch(s.family){case 'power':return d.mode==='restricted'?d.end:((1+s.eps)/2)**(1/s.N);case 'geometric':return d.mode==='restricted'?d.end:d.mode==='closed'?1:Math.pow(.5,1/s.N);case 'alternating':return 1;case 'spike':return 1/(2*s.N);case 'wave':return 1/(4*s.N);default:return .5;}}
export function ufIntegral(s,N=s.N){const d=ufDomain(s);if(!d.compact)return {partial:null,limit:null,reason:'当前 E 非闭区间：不把本图的闭区间定理延伸为广义积分定理。'};let partial,limit;switch(s.family){case 'power':partial=d.end**(N+1)/(N+1);limit=0;break;case 'geometric':partial=0;for(let k=1;k<=N;k++)partial+=d.end**k/k;limit=d.end===1?null:-Math.log1p(-d.end);break;case 'alternating':partial=ufAlt(N)/2;limit=Math.LN2/2;break;case 'spike':partial=1;limit=0;break;case 'wave':partial=0;limit=0;break;default:partial=N;limit=null;}
const norm=ufNorm(s,N),valid=ufTruth(s).uniform;return {partial,limit,bound:valid&&Number.isFinite(norm.value)?d.end*(norm.bound??norm.value):null,reason:valid?'有限闭区间上：|∫S_N−∫S| ≤ |E|·E_N。范数上界控制整体面积差。':s.family==='spike'?'宽度 1/N × 高度 2N ÷ 2 = 1；每个点最终归零，而面积一直为 1。':'结论须由本例的积分公式判断；不满足充分条件并不自动意味着不能交换。'};}
export function ufDerivativeBound(s,N=s.N){const d=ufDomain(s);if(s.family==='geometric'&&d.mode==='restricted')return {value:N*d.end**(N-1)/(1-d.end)+d.end**N/(1-d.end)**2,formula:'||S_N′−S′||∞=Nrᴺ⁻¹/(1−r)+rᴺ/(1−r)² → 0'};if(s.family==='power'&&d.mode==='restricted')return {value:N*d.end**(N-1),formula:'||S_N′−0||∞=Nrᴺ⁻¹ → 0'};if(s.family==='alternating')return {value:Math.abs(ufAlt(N)-Math.LN2),formula:'||S_N′−ln 2||∞=|H_N^(alt)−ln 2| ≤ 1/(N+1)'};if(s.family==='wave')return {value:1,formula:'||S_N′−0||∞=1；在 x=1/2 为 (−1)ᴺ'};if(s.family==='drift')return {value:0,formula:'S_N′≡0 一致收敛，但 S_N(0)=N 没有收敛'};return {value:null,formula:'本域上没有使用导数一致收敛的证书；请检查定理前提。'};}
export function ufCSV(s){const d=ufDomain(s),norm=ufNorm(s);const lines=['# MA Playground v1.6 | uniform convergence | finite plot samples are not proofs',`# family=${s.family}; E=${d.label}; N=${s.N}; epsilon=${s.eps}; sup=${ufNum(norm.value)}; attained=${norm.attained}`,`# ${ufFamilies[s.family].series}`,`# ${norm.formula}; analytic expression evaluated with floating point`, '# grid samples plus analytic feature points; undefined means no derivative / finite limit there', 'x,S_N,S,abs_error,derivative_N,derivative_limit'];const points=new Set(Array.from({length:201},(_,i)=>d.end*i/200));points.add(ufProbe(s));if(s.family==='spike'){points.add(1/(2*s.N));points.add(1/s.N);}if(s.family==='wave')points.add(1/(4*s.N));for(const x of [...points].sort((a,b)=>a-b)){if(!ufInDomain(s,x))continue;lines.push([x,ufPartial(s,s.N,x),ufLimit(s,x),ufError(s,s.N,x),ufDerivative(s,s.N,x),ufLimitDerivative(s,x)].map(v=>v===null?'undefined':v).join(','));}return lines.join('\n')+'\n';}


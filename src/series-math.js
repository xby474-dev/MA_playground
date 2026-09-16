/** Analytic catalogue, not an automatic convergence oracle. Finite samples never
 * feed the verdicts below. All statements concern tails; n starts at 1. */
export const seriesFamilies = {
 geometric:{name:'几何级数',formula:'aₙ = qⁿ',parameter:'q',prompt:'几何衰减，同时通过两道门。'},
 power:{name:'p 级数',formula:'aₙ = 1/nᵖ',parameter:'p',prompt:'比值与根值都是 1，结论却由 p 决定。'},
 telescopic:{name:'望远镜正例',formula:'aₙ = 1/[n(n+1)]',parameter:null,prompt:'与 1/n² 同阶，也能直接拆项。'},
 paired:{name:'齿状几何项',formula:'bₙ = cₙqⁿ；c奇 = 1，c偶 = 4',parameter:'q',prompt:'相邻项会跳高，整体仍可能几何衰减。'},
 wavy:{name:'有界摆动系数',formula:'bₙ = cₙ/nᵖ；c奇 = 1，c偶 = 3',parameter:'p',prompt:'夹得住，不意味着商有极限。'},
 logarithmic:{name:'对数边界',formula:'bₙ = 1/[(n+1) lnᵖ(n+1)]',parameter:'p',prompt:'比调和项小，仍可能发散。'},
 sparse:{name:'稀疏非负项',formula:'bₙ = 1/n²（n = 2ᵏ），否则 0',parameter:null,prompt:'无穷多个零：比值不能硬算成 0。'},
 cancellation:{name:'不单调的抵消',formula:'b₂ₖ₋₁ = 1/k，b₂ₖ = 1/k + 1/k²',parameter:null,prompt:'Leibniz 不适用，仍可能条件收敛。'}
};
export const seriesMethods = ['ratio','root','limit','comparison','integral','leibniz','absolute','convergence','zero'];
export const seriesMethodNames = {ratio:'比值条件',root:'根值条件',limit:'极限比较',comparison:'直接比较',integral:'积分条件',leibniz:'Leibniz 条件',absolute:'绝对收敛',convergence:'原级数收敛',zero:'通项趋零'};
export function seNum(x,d=5){if(x===null||x===undefined||Number.isNaN(x))return '未定义';if(x===Infinity)return '∞';if(x===-Infinity)return '−∞';if(x===0)return '0';return Math.abs(x)<.0001||Math.abs(x)>=1e5?x.toExponential(3):String(Number(x.toPrecision(d)));}
export function seEscape(x){return String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
export function sePowerOfTwo(n){if(!Number.isSafeInteger(n)||n<1)return false;while(n%2===0)n/=2;return n===1;}
export function seLogB(s,n){if(!Number.isInteger(n)||n<1)throw new RangeError('n must be a positive integer');
 switch(s.family){
 case 'geometric': return n*Math.log(s.q);
 case 'paired': return n*Math.log(s.q)+(n%2===0?Math.log(4):0);
 case 'power': return -s.p*Math.log(n);
 case 'wavy': return -s.p*Math.log(n)+(n%2===0?Math.log(3):0);
 case 'telescopic': return -Math.log(n)-Math.log(n+1);
 case 'logarithmic': return -Math.log(n+1)-s.p*Math.log(Math.log(n+1));
 case 'sparse':return sePowerOfTwo(n)?-2*Math.log(n):-Infinity;
 case 'cancellation':{const k=Math.ceil(n/2);return -Math.log(k)+(n%2===0?Math.log1p(1/k):0);}
 default:throw new RangeError('Unknown family');
 }}
export function seB(s,n){return Math.exp(seLogB(s,n));}
export function seA(s,n){return (s.signed&&n%2===0?-1:1)*seB(s,n);}
export function seRatio(s,n){const x=seLogB(s,n),y=seLogB(s,n+1);if(x===-Infinity)return null;return Math.exp(y-x);}
export function seRoot(s,n){return Math.exp(seLogB(s,n)/n);}
export function seReference(s){if(s.ref==='harmonic')return {kind:'power',p:1,label:'vₙ = 1/n',converges:false};if(s.ref==='square')return {kind:'power',p:2,label:'vₙ = 1/n²',converges:true};if(s.ref==='geometric')return {kind:'geo',q:.5,label:'vₙ = 2⁻ⁿ',converges:true};
 if(['geometric','paired'].includes(s.family))return {kind:'geo',q:s.q,label:`vₙ = (${seNum(s.q)})ⁿ`,converges:s.q<1};
 const p=['power','wavy'].includes(s.family)?s.p:['telescopic','sparse'].includes(s.family)?2:1;return {kind:'power',p,label:p===1?'vₙ = 1/n':`vₙ = 1/n^${seNum(p)}`,converges:p>1};}
export function seRefLog(s,n){const r=seReference(s);return r.kind==='geo'?n*Math.log(r.q):-r.p*Math.log(n);}
export function seQuotient(s,n){const l=seLogB(s,n);return l===-Infinity?0:Math.exp(l-seRefLog(s,n));}
export function seLimits(s){const f=s.family;return {ratio:['geometric'].includes(f)?s.q:['paired','wavy','sparse'].includes(f)?null:1,root:['geometric','paired'].includes(f)?s.q:1,rootOrdinary:f!=='sparse',ratioLow:f==='paired'?s.q/4:f==='wavy'?1/3:f==='sparse'?null:['geometric'].includes(f)?s.q:1,ratioHigh:f==='paired'?4*s.q:f==='wavy'?3:f==='sparse'?null:['geometric'].includes(f)?s.q:1};}
export function seTruth(s){let absolute,converges,zero=true,reason;
 switch(s.family){
 case 'geometric':case 'paired':absolute=s.q<1;zero=absolute;converges=absolute;reason=absolute?'被收敛几何级数的常数倍控制。':'沿至少一列下标，通项不趋于零。';break;
 case 'power':absolute=s.p>1;converges=absolute||s.signed;reason=absolute?'p > 1，p 级数收敛。':s.signed?'幅度单调趋零，Leibniz 给出收敛；绝对值是发散 p 级数。':'0 < p ≤ 1，p 级数发散。';break;
 case 'wavy':absolute=s.p>1;converges=absolute;reason=absolute?'n⁻ᵖ ≤ bₙ ≤ 3n⁻ᵖ，且 p > 1。':s.signed?'成对和约为 −2(2k)⁻ᵖ；偶数部分和趋于 −∞，不能只看交错符号。':'bₙ ≥ n⁻ᵖ，而 p ≤ 1。';break;
 case 'telescopic':case 'sparse':absolute=true;converges=true;reason=s.family==='sparse'?'0 ≤ bₙ ≤ 1/n²；零项不妨碍比较。':'0 < bₙ ≤ 1/n²；正号时部分和为 1−1/(N+1)。';break;
 case 'logarithmic':absolute=s.p>1;converges=absolute||s.signed;reason=absolute?'令 u=ln x，积分化为 ∫u⁻ᵖ du，p > 1 时收敛。':s.signed?'幅度递减趋零；绝对值积分在 p ≤ 1 时发散。':'换元后的广义积分在 p ≤ 1 时发散。';break;
 case 'cancellation':absolute=false;converges=s.signed;reason=s.signed?'每对和 = −1/k²，未成对的最后一项 1/k→0；绝对值每对至少 2/k。':'每对正项之和 = 2/k+1/k²，因此发散。';break;
 default:throw new RangeError('Unknown family');
 }return {absolute,converges,zero,conditional:converges&&!absolute,label:converges?(absolute?(s.signed?'绝对收敛':'非负项收敛（也绝对收敛）'):'条件收敛'):'原级数发散',reason};}
export function seIntegral(s){const f=s.family;const valid=['power','telescopic','logarithmic','geometric'].includes(f)&&(f!=='geometric'||s.q<=1);const converges=valid&&(['power','logarithmic'].includes(f)?s.p>1:f==='geometric'?s.q<1:true);
 let formula=f==='power'?(s.p===1?'∫₁ᴹ dx/x = ln M':`∫₁ᴹ x⁻ᵖ dx = (M^(1−p)−1)/(1−p)`):f==='logarithmic'?(s.p===1?'∫₂ᴹ dx/(x ln x) = ln ln M − ln ln 2':'∫₂ᴹ dx/(x lnᵖx) = [(ln M)^(1−p)−(ln 2)^(1−p)]/(1−p)'):f==='telescopic'?'∫₁ᴹ dx/[x(x+1)] = ln(2M/(M+1))':f==='geometric'?(s.q===1?'∫₁ᴹ 1 dx = M−1':'∫₁ᴹ qˣ dx = (qᴹ−q)/ln q'):'不存在在尾部递减、同时穿过全部 bₙ 的连续插值';
 return {valid,converges,formula,reason:valid?'正、连续、最终单调不增的延拓；检查的是广义积分。':'bₙ 在无穷多个位置上升；标准积分判别的单调前提不成立。分组或另找可积上界属于另一条论证。'};}
export function seContinuous(s,x){if(x<1)return null;switch(s.family){case 'power':return x**(-s.p);case 'geometric':return s.q**x;case 'telescopic':return 1/(x*(x+1));case 'logarithmic':return 1/((x+1)*Math.log(x+1)**s.p);default:return null;}}
export function seLeibniz(s){const monotone=['power','telescopic','logarithmic'].includes(s.family)||(s.family==='geometric'&&s.q<=1);const zero=seTruth(s).zero;return {alternating:s.signed,monotone,zero,valid:s.signed&&monotone&&zero,reason:!s.signed?'当前没有交错赋号。':!monotone?'幅度并非最终单调不增；有交错符号本身不够。':!zero?'幅度没有趋零，通项这一关都未通过。':'交错赋号、幅度最终单调不增且趋零。只保证收敛，不自动保证条件收敛。'};}
function base(s){switch(s.family){case 'geometric':return {kind:'geo',q:s.q,lo:1,hi:1,c:1};case 'paired':return {kind:'geo',q:s.q,lo:1,hi:4,c:null};case 'power':return {kind:'power',p:s.p,lo:1,hi:1,c:1};case 'wavy':return {kind:'power',p:s.p,lo:1,hi:3,c:null};case 'telescopic':return {kind:'power',p:2,lo:.5,hi:1,c:1};case 'sparse':return {kind:'power',p:2,lo:0,hi:1,c:null};case 'logarithmic':return {kind:'log',p:s.p,lo:1,hi:1,c:1};case 'cancellation':return {kind:'power',p:1,lo:1,hi:4,c:2};default:throw new RangeError('Unknown family');}}
export function seComparison(s){const b=base(s),r=seReference(s);let trend=0;
 if(b.kind==='geo'&&r.kind==='geo')trend=Math.sign(b.q-r.q);
 else if(b.kind==='geo')trend=b.q<1?-1:1;
 else if(r.kind==='geo')trend=r.q<1?1:-1;
 else if(b.kind==='power')trend=Math.sign(r.p-b.p);
 else trend=r.p<=1?-1:1; // log^p grows slower than any positive power, p>0.
 let kind,c=null,lower=null,upper=null,scope='对所有 n ≥ 1';
 if(trend===0){c=b.c;kind=c===null?'oscillates':'finite';lower=b.lo;upper=b.hi;}
 else if(trend<0){kind='zero';upper=1;scope='存在 N₀，对所有 n ≥ N₀';}
 else if(s.family==='sparse'){kind='unbounded-spikes';scope='无限个零与无界尖峰';}
 else{kind='infinity';lower=1;scope='存在 N₀，对所有 n ≥ N₀';}
 const direct=upper!==null&&r.converges?'absolute':lower!==null&&lower>0&&!r.converges?'abs-diverges':'inconclusive';
 const standard=kind==='finite'?(r.converges?'absolute':'abs-diverges'):'precondition';
 const label=kind==='finite'?`bₙ/vₙ → ${seNum(c)}`:kind==='zero'?'bₙ/vₙ → 0':kind==='infinity'?'bₙ/vₙ → ∞':kind==='oscillates'?`商无极限；${seNum(lower)} ≤ bₙ/vₙ ≤ ${seNum(upper)}`:'商沿零项为 0，沿尖峰无界';
 return {ref:r,kind,c,lower,upper,scope,direct,standard,label,oneWay:['zero','infinity'].includes(kind)&&direct!=='inconclusive'};}
function result(kind,reason,extra=''){return {kind,reason,extra};}
export function seEvaluate(s){const l=seLimits(s),c=seComparison(s),i=seIntegral(s),a=seLeibniz(s),truth=seTruth(s);
 const ratio=l.ratio===null?result('precondition',s.family==='sparse'?'分母有无穷多个零，尾部的逐项比值未定义。':`两列相邻比值分别趋于 ${seNum(l.ratioLow)} 与 ${seNum(l.ratioHigh)}，普通极限不存在。`):l.ratio<1?result('absolute',`普通比值极限 L=${seNum(l.ratio)} < 1。`):l.ratio>1?result('divergent',`L=${seNum(l.ratio)} > 1，通项不能趋零。`):result('inconclusive','L=1：这个版本不作决定。');
 const root=l.root<1?result('absolute',`根值上极限 ρ=${seNum(l.root)} < 1。`):l.root>1?result('divergent',`根值上极限 ρ=${seNum(l.root)} > 1，通项不能趋零。`):result('inconclusive','ρ=1：收敛与发散都可能。',!l.rootOrdinary?'本例普通根值极限也不存在；上极限仍有定义。':'');
 return {ratio,root,limit:result(c.standard,c.kind==='finite'?`${c.label}，0 < c < ∞；与当前参照同敛散。`:`${c.label}，不符合标准双向版 0 < c < ∞。`,c.oneWay?'单向扩展仍可给结论：见直接比较。这不等于所有极限比较都失效。':c.kind==='oscillates'?'虽然商不收敛，已有常数界仍可以用于直接比较。':''),comparison:result(c.direct,`${c.scope}；${c.upper!==null?'有上界 '+seNum(c.upper)+'vₙ；':''}${c.lower!==null&&c.lower>0?'有下界 '+seNum(c.lower)+'vₙ；':''}参照${c.ref.converges?'收敛':'发散'}。`,c.direct==='inconclusive'?'参照不合适或不等式方向无效，不是证明级数发散。':''),integral:result(!i.valid?'precondition':i.converges?'absolute':'abs-diverges',i.reason,i.formula),leibniz:result(a.valid?'converges':'precondition',a.reason),absolute:result(truth.absolute?'absolute':'abs-diverges','由本例独立解析论证判断，不从有限部分和猜测。'),convergence:result(truth.converges?'converges':'divergent',truth.reason),zero:result(truth.zero?'inconclusive':'divergent',truth.zero?'aₙ→0 是必要条件，不足以证明收敛。':'通项不趋零，原级数必发散。')};}
export function seNodeHolds(s,key){const e=seEvaluate(s);if(key==='zero')return seTruth(s).zero;if(key==='convergence')return seTruth(s).converges;return ['absolute','converges'].includes(e[key].kind);}
export const seStatusLabels={absolute:'✓ 证明绝对收敛',converges:'✓ 证明原级数收敛',divergent:'↗ 证明原级数发散','abs-diverges':'|aₙ| 的级数发散',inconclusive:'? 此法无法判断',precondition:'— 此版本前提未满足'};
export function seSamples(s,N=s.N){let sum=0,abs=0,cs=0,ca=0;const out=[];for(let n=1;n<=N;n++){const b=seB(s,n),a=seA(s,n);let y=a-cs,t=sum+y;cs=(t-sum)-y;sum=t;y=b-ca;t=abs+y;ca=(t-abs)-y;abs=t;out.push({n,a,b,sum,absoluteSum:abs,ratio:seRatio(s,n),root:seRoot(s,n),comparison:seQuotient(s,n),logB:seLogB(s,n)});}return out;}
export function seCSV(s){return '# MA Playground v1.5; finite values are observations, not convergence proofs\n# '+JSON.stringify({family:s.family,p:s.p,q:s.q,signed:s.signed,reference:seReference(s).label})+'\n'+['n','a','b','sum','absoluteSum','ratio','root','comparison','logB'].join(',')+'\n'+seSamples(s).map(r=>Object.values(r).map(v=>v===null?'undefined':Number.isFinite(v)?v:String(v)).join(',')).join('\n')+'\n';}

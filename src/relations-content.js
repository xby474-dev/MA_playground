import { properties, models, modelIds, relations, getModel, getRelation, relationVerdict, planeLabel } from './relations-math.js';
import { relationGraph } from './relations-plots.js';
import { icon } from './icons.js';
const mi=x=>`<mi>${x}</mi>`, mn=x=>`<mn>${x}</mn>`, mo=x=>`<mo>${x}</mo>`;
const power=(x,n)=>`<msup>${mi(x)}${mn(n)}</msup>`;
const frac=(a,b)=>`<mfrac><mrow>${a}</mrow><mrow>${b}</mrow></mfrac>`;
const x2=power('x',2),y2=power('y',2),sum=x2+mo('+')+y2,xy=mi('x')+mi('y');
export function mathml(label,body,block=false){return `<math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="${label}"${block?' display="block"':''}><mrow>${body}</mrow></math>`;}
export function functionFormula(id){
 const bodies={bowl:sum,saddle:xy,wave:mi('sin')+mi('x')+mi('cos')+mi('y'),quadratic:x2+mo('+')+xy+mo('+')+y2,ratio:frac(xy,sum),absolute:mo('|')+mi('x')+mo('|')+mo('+')+mo('|')+mi('y')+mo('|'),oscillation:x2+mi('sin')+mo('(')+frac(mn(1),mi('x'))+mo(')'),cone:frac(xy,`<msqrt>${sum}</msqrt>`),ridge:frac(power('x',3),sum),rational:frac(x2+y2,sum),radial:mo('(')+sum+mo(')')+mi('sin')+mo('(')+frac(mn(1),`<msqrt>${sum}</msqrt>`)+mo(')')};
 return mathml(`f(x,y) = ${getModel(id).formula}`,mi('f')+mo('(')+mi('x')+mo(',')+mi('y')+mo(')')+mo('=')+bodies[id],true);
}
export const journeys=['建立关系','正例走通','尝试逆推','反例破局','自己判断'];
export function relationsHeader(s){
 const title=s.screen==='map'?'四个性质，一张关系图。':s.screen==='challenge'?'把判断权交还给你。':getRelation(s.edge).label;
 return `<section class="page-heading rel-heading"><div><div class="breadcrumb">实验室 <span>/</span> 偏导与可微 <span>/</span> 关系实验</div><span class="eyebrow">EXPERIMENT 02 <span>—</span> THE LOGIC OF DIFFERENTIABILITY</span><h1 tabindex="-1" id="rel-page-title">${title}</h1><p class="page-subtitle">不靠记住一串结论。选一个函数，走一条箭头，让观察接受证明的检验。</p></div><div class="heading-actions"><button class="button subtle" data-r-action="reset">${icon('reset')} 重置</button><button class="button subtle" data-action="share">${icon('share')} 分享实验</button></div></section>
 <nav class="rel-journey" aria-label="连续学习路径">${journeys.map((x,i)=>`<button data-r-stage="${i}" aria-current="${s.stage===i?'step':'false'}"><span>0${i+1}</span><strong>${x}</strong><i aria-hidden="true">${i<4?'→':'✓'}</i></button>`).join('')}</nav>`;
}
export function functionPicker(s,compact=false){
 const ids=modelIds.filter(id=>models[id].group!=='迁移挑战'||id===s.fn);
 return `<label class="control-label" for="rel-function">当前函数 <span class="tag-small">所有性质均在原点判断</span></label><select id="rel-function" class="rel-select">${[...new Set(ids.map(id=>models[id].group))].map(g=>`<optgroup label="${g}">${ids.filter(id=>models[id].group===g).map(id=>`<option value="${id}"${id===s.fn?' selected':''}>${models[id].formula} · ${models[id].name}</option>`).join('')}</optgroup>`).join('')}</select><div class="function-box rel-function-box" id="rel-function-box">${functionFormula(s.fn)}<span>${getModel(s.fn).extension??'定义在整个平面；f(0,0) = 0。'}</span></div>${compact?'':`<div class="rel-smooth-picks" aria-label="四个光滑正例">${['bowl','saddle','wave','quadratic'].map((id,i)=>`<button data-r-model="${id}" aria-pressed="${s.fn===id}">${['圆碗','马鞍','波面','椭圆碗'][i]}</button>`).join('')}</div>`}`;
}
export function predictions(s,challenge=false){return `<form id="rel-predictions" class="rel-predictions"><h3>${challenge?'先独立判断四个性质':'先判断，再揭晓'}</h3><p class="rel-muted">${challenge?'每一项都要选择。结论与理由会在提交后揭晓。':'暂时拿不准可以留空；图上的节点不会替你提前作答。'}</p>${properties.map(p=>`<fieldset><legend>${p.symbol} · ${p.name}</legend><label><input type="radio" name="rel-${p.id}" value="yes" ${challenge?'required':''}> 成立</label><label><input type="radio" name="rel-${p.id}" value="no" ${challenge?'required':''}> 不成立</label></fieldset>`).join('')}<button class="button primary full-width" type="submit">${challenge?'提交判断与理由':'查看解析结论'} <span aria-hidden="true">→</span></button><p id="rel-prediction-result" role="status" aria-live="polite"></p></form>`;}
export function statusStrip(s){const p=getModel(s.fn).properties;return `<div class="rel-status-strip">${properties.map(a=>`<span class="rel-status ${s.reveal?(p[a.id]?'yes':'no'):'unknown'}"><b>${s.reveal?(p[a.id]?'✓':'×'):'?'}</b> ${a.name}</span>`).join('')}</div>`;}
export function relationsMap(s){
 return `<section class="rel-map-layout"><div class="card rel-map-card"><div class="rel-card-head"><div><span class="eyebrow">ONE MAP · FOUR PROPERTIES</span><h2>你能走哪条箭头？</h2></div><div class="rel-legend"><span class="theorem">⟶ 定理 / 为什么成立</span><span class="inverse">⇏ 错误逆推 / 反例在哪里</span></div></div><div id="rel-map-graph">${relationGraph(s)}</div><div class="rel-map-foot"><p><strong>箭头属于定理，节点属于当前函数。</strong> 即使当前函数不满足前提，绿色箭头也不会失效；只是不能套用。</p><details><summary>教材图片中的附加条件，为什么不能省略？</summary><p>上传图片的上方箭头写着“在某邻域上偏导数有界”。这里展开为：全部偏导在原点的某个开邻域内存在且有界，才能由中值定理得到连续。仅原点的偏导存在不够。下方绿色条件箭头保留这条命题。</p></details></div></div>
 <aside class="card rel-map-inspector"><span class="eyebrow">YOUR FUNCTION · YOUR VERDICT</span>${functionPicker(s,true)}${predictions(s)}<div class="rel-concept" id="rel-concept"><span class="eyebrow">点击节点，澄清定义</span><h3>先弄清“在哪里”。</h3><p>P、C、D 都在原点判断。C∂ 则先要求偏导在某邻域内存在，再要求它们在原点连续；这里不把它偷换为整片邻域都是 C¹。</p></div></aside></section>
 <section class="rel-next-banner"><div><span class="eyebrow">START WITH SOMETHING FAMILIAR</span><h2>从一个光滑的圆碗开始。</h2><p>先沿绿色箭头走通，再问：能不能反过来？</p></div><button class="button primary" data-r-stage="1">开始这条学习路径 →</button></section>`;
}
export function edgeExplanation(id){
 const content={
 's-d':{claim:'两个偏导在某开邻域存在，并在原点连续 ⇒ 存在统一的一阶线性近似。',steps:[['把位移拆成两段','f(h,k) − f(0,0) = [f(h,k) − f(0,k)] + [f(0,k) − f(0,0)]。这是坐标折线路径，不是在假设任意曲线的极限。'],['一元中值定理登场','在足够小的开矩形内，两段上的一元函数处处可导。存在 ξ 介于 0 与 h、η 介于 0 与 k，使增量等于 fₓ(ξ,k)h + fᵧ(0,η)k。零长度段直接记为 0。'],['连续性控制余项','令 L(h,k) = fₓ(0,0)h + fᵧ(0,0)k。偏导在原点连续，所以任给 ε > 0，可令两个偏导的差都小于 ε/√2。于是 |R| ≤ ε(|h| + |k|)/√2 ≤ ε√(h²+k²)。'],['量词完成证明','这一个 δ 同时控制所有方向的位移，不是给每条方向各选一个尺度。因此 |R|/ρ → 0，可微成立。']],warning:'偏导连续是充分条件，不是必要条件。把箭头反过来，x² sin(1/x) 就会击破它。'},
 'd-p':{claim:'若 f 在原点可微，则两个偏导都存在，并等于线性映射的系数。',steps:[['先写出可微性','f(h,k) − f(0,0) = Ah + Bk + R(h,k)，且 |R(h,k)| / √(h²+k²) → 0。'],['只沿 x 轴取位移','取 (h,k) = (t,0)，差商为 A + R(t,0)/t。其余项绝对值是 |R(t,0)|/|t| → 0，t 可正可负，所以 fₓ(0,0) = A。'],['再沿 y 轴','同理 fᵧ(0,0) = B。若一个候选导数存在，它必定是 L(h,k) = fₓ(0,0)h + fᵧ(0,0)k。']],warning:'由偏导写出一个平面，不等于已经证明它是切平面。还要检查余项相对于位移是否趋于 0。'},
 'd-c':{claim:'可微要求比连续更精确，因此可微必连续。',steps:[['同一个展开式','f(h) − f(0) = L(h) + R(h)，其中 R(h) = o(‖h‖)。'],['分别控制两部分','有限维线性映射有界：|L(h)| ≤ ‖L‖‖h‖。在足够小邻域内还可令 |R(h)| ≤ ‖h‖。'],['选择一个 δ','于是 |f(h) − f(0)| ≤ (‖L‖+1)‖h‖。给定 ε，再令 ‖h‖ < ε/(‖L‖+1)，就得到连续性。']],warning:'|R| → 0 只是绝对接近；可微额外要求 |R|/ρ → 0。把绝对误差和归一化误差来回切换，观察差别。'},
 'bounded-c':{claim:'所有偏导在原点的某开邻域内存在且有界 ⇒ f 在原点连续。',steps:[['把附加条件写完整','在某个开矩形 U 内，两偏导处处存在，且 |fₓ| ≤ Mₓ、|fᵧ| ≤ Mᵧ。不能只要求原点的两个偏导数是有限数。'],['沿矩形内折线路径用中值定理','对足够小的 (h,k)，|f(h,k) − f(0,0)| ≤ Mₓ|h| + Mᵧ|k| ≤ √(Mₓ²+Mᵧ²)ρ。'],['得到连续，甚至局部 Lipschitz','同样估计适用于较小矩形内的任意两点；因此得到局部 Lipschitz 性。这不是可微性证明，因为归一化上界是常数，未必趋于 0。']],warning:'xy/√(x²+y²) 的偏导在整个平面存在且有界，却在原点不可微：补上“有界”仍不能升级成可微。'},
 'd-s':{claim:'错误逆推：可微就意味着偏导在原点连续？不成立。',steps:[['反例先满足前提','令 f = x² sin(1/x)，在 x=0 时补为 0。两个偏导在原点为 0，且 |f|/ρ ≤ x²/ρ ≤ ρ → 0，所以它确实可微，导数为 0。'],['再否定结论','x ≠ 0 时 fₓ = 2x sin(1/x) − cos(1/x)，x = 0 时 fₓ = 0；fᵧ 恒为 0。'],['两列点给出严格证据','取 xₙ = 1/(2πn)、x′ₙ = 1/((2n+1)π)，并令 y=0。两列都趋于 0，但 fₓ(xₙ,0) = −1，fₓ(x′ₙ,0) = +1，均不趋于 fₓ(0,0)=0。']],warning:'画得平坦不等于邻近点的斜率稳定。函数值受 x² 压低，而求导后的 cos(1/x) 仍有固定振幅。'},
 'p-d':{claim:'错误逆推：偏导存在就可微？即使再加连续也不成立。',steps:[['先保住两个偏导','g = xy/√(x²+y²)，g(0,0)=0。两坐标轴上恒为 0，因此 gₓ(0,0)=gᵧ(0,0)=0，唯一候选 L=0。'],['它甚至连续','|xy| ≤ (x²+y²)/2，所以 |g| ≤ ρ/2 → 0。'],['但一阶误差没有足够快地消失','令 (x,y)=ρ(cos θ,sin θ)，则 |g−L|/ρ = |sin(2θ)|/2。沿 θ=45° 恒为 1/2，不趋于 0。']],warning:'P ∧ C ⇏ D。“偏导存在”和“连续”不是拼在一起就能替代可微。'},
 'c-d':{claim:'错误逆推：函数连续，就能找到切平面？不成立。',steps:[['反例与连续性的证据','取 g = xy/√(x²+y²)，g(0,0)=0。|g| ≤ ρ/2，对任意趋近方式都趋于 0。'],['锁定唯一候选平面','坐标轴差商为 0，若可微，其导数只能是 L=0，不能用换一个斜平面来挽救。'],['归一化误差才是区别','沿 x=y ≠ 0，|g| = ρ/2 → 0，但 |g|/ρ = 1/2。绝对误差会变小，比例却不消失，因此不可微。']],warning:'“连续”说的是值接近；“可微”说的是线性近似在所有方向都达到一阶精度。'},
 'p-c':{claim:'错误逆推：偏导存在，就能保证连续？不成立，甚至邻域内偏导都存在也不够。',steps:[['两个偏导确实存在','f = xy/(x²+y²)，f(0,0)=0。f(t,0)=f(0,t)=0，因此原点两个偏导都是 0；非原点处是分母非零的有理函数，偏导也都存在。'],['找到坐标轴看不到的路径','沿 (t,t)，t ≠ 0，有 f(t,t)=1/2。它不趋于原点值 0，所以原点不连续。取 ε₀=1/4，对任意 δ>0 选 0<√2|t|<δ 即得严格反证。'],['为什么不违背“有界偏导 ⇒ 连续”？','在非原点 fₓ = y(y²−x²)/(x²+y²)²。沿 (0,t)，fₓ(0,t)=1/t，无界。正是教材上那条附加条件没有满足。']],warning:'沿坐标轴的两个差商只测到两条线；连续性不能省略其他趋近方式。'},
 'c-p':{claim:'错误逆推：连续就有偏导？不成立。',steps:[['先用统一估计证明连续','f=|x|+|y|，满足 |f(x,y)| ≤ √2ρ，因此原点连续。'],['分别检查双侧差商','沿 x 轴，f(t,0)/t = |t|/t：t>0 时等于 1，t<0 时等于 −1。因此 fₓ(0,0) 不存在；沿 y 轴同理。'],['不要把单侧斜率当偏导','这里讨论开邻域中原点的通常偏导，要求正负两侧趋于同一个数。看见右侧斜率 +1 还不够。']],warning:'原点没有由两个偏导生成的候选平面。页面会禁用此平面，而不是偷偷拿 z=0 当导数。'}
 };
 return content[id]??content['s-d'];
}
export const modelProofs={
 bowl:'fₓ=2x，fᵧ=2y，均在全平面连续。原点导数 L=0，|R|/ρ=ρ，与方向无关，因此四个性质都成立。',
 saddle:'fₓ=y，fᵧ=x，均连续，L=0。|R|/ρ=ρ|sin 2θ|/2，所有方向的上确界正好是 ρ/2 → 0。',
 wave:'fₓ=cos x cos y，fᵧ=−sin x sin y，均连续，原点梯度为 (1,0)，切平面 z=x。由 |sin x−x|≤|x|³/6、|cos y−1|≤y²/2，得 |sin x cos y−x|/ρ ≤ 2ρ²/3 → 0。这里显示的是统一上界，不冒充精确上确界。',
 quadratic:'fₓ=2x+y，fᵧ=x+2y，均连续，L=0。R=ρ²(1+sin 2θ/2)，始终非负；所有方向的最大误差比例为 3ρ/2 → 0。',
 ratio:'原点两个偏导为 0，非原点处有理函数可微，因此邻域内偏导存在。沿 (t,t) 的函数值恒为 1/2，所以原点不连续，也不可能可微。fₓ(0,t)=1/t 无界，所以偏导不连续，且不能使用“邻域偏导有界”定理。',
 absolute:'|f|≤√2ρ，故连续。两坐标轴的右差商是 +1、左差商是 −1，因此两个偏导均不存在，进而不可微、偏导连续条件也不成立。|f|/ρ 只能叫“相对高度”，不是由原点偏导生成的线性近似误差。',
 oscillation:'两个偏导在原点为 0。|R|/ρ ≤ x²/ρ ≤ ρ，故可微且连续；但 fₓ=2x sin(1/x)−cos(1/x)（x≠0）沿两列点交替为 −1、+1，不趋于原点偏导 0。所有偏导仍在邻域内存在且有界：|x|<1 时 |fₓ|≤3、fᵧ=0。有界不等于连续。',
 cone:'|g|≤ρ/2，所以连续；坐标轴上的偏导为 0。沿 45°，|R|/ρ=1/2，故不可微。非原点 gₓ=y³/ρ³，gᵧ=x³/ρ³，二者绝对值≤1，但 gₓ(0,t)=sign(t) 不趋于原点偏导 0。它同时反驳 P∧C⇒D 和“有界偏导⇒D”。',
 ridge:'|f|≤ρ，故连续。沿 x 轴 f(t,0)=t，沿 y 轴恒为 0，所以原点偏导为 (1,0)，唯一候选 L=x。R=−xy²/(x²+y²)，沿 θ=45° 的误差比例恒为 1/(2√2)，所以不可微。非原点 fₓ=x²(x²+3y²)/(x²+y²)²，沿 (0,t) 为 0，却不趋于原点值 1；偏导不连续。',
 rational:'|f|=x²y²/ρ²≤ρ²/4，原点偏导为 0，因此 |R|/ρ≤ρ/4 → 0，可微。非原点 fₓ=2xy⁴/ρ⁴、fᵧ=2yx⁴/ρ⁴，各自绝对值≤2ρ → 0；原点偏导也为 0，因此偏导在原点连续。四个性质都成立。分式外形本身不是病态的证据。',
 radial:'令 ρ=√(x²+y²)。|f|≤ρ²，原点两偏导为 0，|R|/ρ≤ρ → 0，故可微且连续。非原点 fₓ=2x sin(1/ρ)−(x/ρ)cos(1/ρ)，fᵧ 同理。沿正 x 轴取 ρₙ=1/(2πn)，有 fₓ=−1，不趋于原点值 0，因此偏导不连续。'
};
export function proofBlock(s){
 const e=getRelation(s.edge),c=edgeExplanation(s.edge),m=getModel(s.fn);
 return `<details class="card rel-proof" id="rel-proof"><summary><span><span class="eyebrow">FROM OBSERVATION TO PROOF</span><strong>${e.kind==='theorem'?'为什么成立':'反例在哪里'} · 沿着这条箭头完成推导</strong></span><span aria-hidden="true">＋</span></summary><div class="rel-proof-body"><p class="rel-proof-claim">${c.claim}</p><div class="rel-proof-steps">${c.steps.map(([title,body],i)=>`<section><span class="rel-step-number">0${i+1}</span><div><h3>${title}</h3><p>${body}</p></div></section>`).join('')}</div><div class="rel-proof-warning">${c.warning}</div><h3>当前函数的四项判定</h3><p><strong>${m.formula}</strong>：${modelProofs[s.fn]}</p><p class="rel-muted">上面的推导基于定义、代数恒等式和统一估计。图中的网格、曲线与有限个采样点只帮助观察，不承担证明。</p><details><summary>四个定义里的量词</summary><p><strong>P：</strong>两个差商各有双侧极限。<br><strong>C：</strong>∀ε&gt;0，∃δ&gt;0，∀h，‖h‖&lt;δ ⇒ |f(h)−f(0)|&lt;ε。<br><strong>D：</strong>∃线性 L，∀ε&gt;0，∃δ&gt;0，∀h，0&lt;‖h‖&lt;δ ⇒ |R(h)|/‖h‖&lt;ε。<br><strong>C∂：</strong>∃原点开邻域 U，偏导在 U 上存在，且两个偏导作为函数在原点连续。</p><p>逐条射线各自收敛，不等于所有方向统一收敛；这里没有从有限扫描宣称全称命题。</p></details></div></details>`;
}
export function relationResult(s){
 if(!s.reveal)return `<span class="eyebrow">YOUR HYPOTHESIS</span><h3>这一个函数，能说明什么？</h3><p>先判断四个节点。绿色箭头要检查前提；虚线箭头要找到“前提成立、结论失败”的函数。</p>`;
 const e=getRelation(s.edge),v=relationVerdict(s.edge,s.fn);
 const words={inapplicable:['前提没有满足，不能从这里启动。','这不否定定理，也不是这条逆命题的有效反例。结论本身可能仍然成立；请分别判断。'],compatible:['这个函数与箭头相容。',e.kind==='theorem'?'正例帮助理解，但不能用一个正例证明一般定理。严格理由在下方。':'两端在这个例子里都成立，不代表逆推总成立。还需要试试建议的反例。'],counterexample:['前提成立，结论失败：反例成立。','一个经过严格验证的反例，就足以否定“对所有函数都成立”的逆推。不是“多数时候不行”，而是逻辑蕴含不成立。']};
 return `<span class="eyebrow">LOGIC CHECK · 解析判定，非采样</span><h3>${words[v.role][0]}</h3><p>${words[v.role][1]}</p><div class="rel-logic-readout">前提 <b>${v.premise?'成立':'不成立'}</b> <span>${e.kind==='theorem'?'→':'⇏'}</span> 结论 <b>${v.conclusion?'成立':'不成立'}</b></div>`;
}
export function relationsCase(s){
 const e=getRelation(s.edge),m=getModel(s.fn);
 return `<div class="rel-context"><button class="text-button" data-r-action="map">← 返回关系图</button><span>${e.kind==='theorem'?'定理 · 绿色实线':'错误逆推 · 虚线 / 问号'}</span><button class="text-button" data-r-action="proof">${e.kind==='theorem'?'为什么成立':'反例在哪里'} ↓</button></div>
 <section class="rel-edge-intro ${e.kind==='theorem'?'theorem':'inverse'}"><div><span class="rel-edge-symbol" aria-hidden="true">${e.kind==='theorem'?'→':'⇏'}</span><p>${edgeExplanation(s.edge).claim}</p></div><div id="rel-status-strip">${statusStrip(s)}</div></section>
 <section class="rel-case-grid"><aside class="card rel-case-controls"><span class="eyebrow">ONE FUNCTION · FOUR QUESTIONS</span>${functionPicker(s)}<div class="rel-pair-buttons"><button class="button" data-r-model="${e.example}">${e.kind==='theorem'?'推荐正例':'加载关键反例'}</button><button class="button" data-r-model="${e.pair}">对照：${e.kind==='theorem'?'检验条件':'换回正例'}</button></div>
 <div class="divider"></div><label class="control-label" for="rel-angle">截面方向 θ <output id="rel-angle-output">${s.angle}°</output></label><div class="slider-block"><input type="range" id="rel-angle" min="0" max="360" step="1" value="${s.angle}" aria-label="截面方向角度"><div class="rel-direction-picks">${[0,90,45].map(a=>`<button data-r-angle="${a}" aria-pressed="${s.angle===a}">${a===0?'x 轴':a===90?'y 轴':'对角线 45°'}</button>`).join('')}</div></div>
 <div class="slider-block"><label class="control-label" for="rel-scale">位移距离 ρ <output id="rel-scale-output"></output></label><input type="range" id="rel-scale" min="0" max="4" step="0.025" value="${s.q}" aria-label="位移距离的负对数"><div class="slider-endpoints"><span>1</span><span>10⁻⁴ · 更靠近原点</span></div></div><div class="rel-sign-row"><span>沿截面哪一侧？</span><button data-r-sign="1" aria-pressed="${s.sign===1}">正侧 +</button><button data-r-sign="-1" aria-pressed="${s.sign===-1}">负侧 −</button></div>
 <label class="rel-checkbox"><input type="checkbox" id="rel-zoom" ${s.zoom?'checked':''}> 随位移放大局部</label><label class="rel-checkbox"><input type="checkbox" id="rel-plane" ${s.plane&&m.gradient?'checked':''} ${m.gradient?'':'disabled'}> 显示${m.properties.D?'切平面':'候选平面'}</label><p class="rel-muted" id="rel-plane-label">${planeLabel(s.fn)}</p><div class="rel-play-row"><button class="button" data-r-action="play">▷ 自动趋近</button><button class="button" data-r-action="camera">重置视角</button></div><div class="divider"></div>${predictions(s)}<button class="text-button" data-r-action="export">${icon('download')} 导出本次观察 CSV</button></aside>
 <div class="rel-observation-column"><section class="card rel-visual-card"><div class="rel-view-tabs" aria-label="观察方式">${[['surface','曲面与平面'],['section','截面与极限'],['derivative','偏导的变化']].map(([id,label])=>`<button data-r-view="${id}" aria-pressed="${s.view===id}">${label}</button>`).join('')}</div><div id="rel-plot" class="rel-plot"></div><p class="rel-plot-note" id="rel-plot-note"></p><div id="rel-live-data" class="rel-live-data"></div><div id="rel-derivative-controls" ${s.view==='derivative'?'':'hidden'}><label class="control-label" for="rel-sequence">序列下标 n <output id="rel-n-output">${s.sequence}</output></label><div class="slider-block"><input id="rel-sequence" type="range" min="1" max="120" step="1" value="${s.sequence}" aria-label="解析序列下标"></div><p id="rel-sequence-note" class="rel-muted"></p></div></section>
 <section class="card rel-chart-card"><div class="rel-card-head"><div><span class="eyebrow">SHRINK THE DISPLACEMENT</span><h3 id="rel-chart-title">值接近，还是一阶近似？</h3></div><div class="segmented">${[['value','函数值'],['raw','绝对误差'],['ratio','归一化']].map(([id,label])=>`<button data-r-metric="${id}" aria-pressed="${s.metric===id}">${label}</button>`).join('')}</div></div><div id="rel-error-plot"></div><div class="rel-uniform-bound" id="rel-bound"></div></section>
 <section class="rel-observation" id="rel-relation-result">${relationResult(s)}</section></div></section>${proofBlock(s)}
 <details class="card rel-location-map"><summary>回到同一张图：当前走的是哪条箭头？</summary>${relationGraph(s,'compact')}</details>
 ${caseContinuation(s)}`;
}
export function relationsChallenge(s){return `<section class="rel-challenge-layout"><div class="card rel-challenge-task"><span class="eyebrow">TRANSFER · NOT RECALL</span><h2>这次，不告诉你它属于哪一类。</h2><p>请判断四个性质，再选出真正能支持判断的理由。不要根据曲面好不好看、有没有分式来猜。</p><div class="rel-challenge-picks">${['ridge','rational','radial'].map((id,i)=>`<button data-r-challenge="${id}" aria-pressed="${s.challenge===id}">新函数 ${'ABC'[i]}</button>`).join('')}</div><div class="function-box">${functionFormula(s.challenge)}<span>${models[s.challenge].extension}</span></div>${predictions(s,true)}<fieldset class="rel-reason-pick" form="rel-predictions"><legend>哪一种理由能支持你的判断？</legend>${challengeReasons(s.challenge).options.map((x,i)=>`<label><input type="radio" name="reason" value="${i}" form="rel-predictions" required> ${x}</label>`).join('')}</fieldset></div><aside class="card rel-challenge-feedback"><span class="eyebrow">YOUR LOGICAL MAP</span><h2>先把结论填进关系里。</h2><div id="rel-challenge-answer"><p>提交后，这里会把你的答案放回四个节点，并解释每一项为什么成立或失败。</p><div class="rel-unknown-chain">C∂ ?<br><span>↓</span><br>D ?<br><span>↙　↘</span><br>P ?　　　 C ?</div><p class="rel-muted">提示：P 和 C 同时成立，仍然不能自动点亮 D。</p></div></aside></section><section class="rel-next-banner"><div><h3>判断完，再带着问题去观察。</h3><p>解析证明在提交后出现；也可以先探索，不会自动替你填答案。</p></div><button class="button" data-r-action="challenge-explore">带这个函数进入实验 →</button></section>`;}
export function challengeReasons(id){
 const all={ridge:{options:['曲面看起来没有断裂，所以四个性质都成立。','坐标轴确定 L=x，但对角线上的归一化余项不趋于 0。','有分式，所以原点必不连续。'],correct:1},rational:{options:['统一估计 |f|≤ρ²/4，且两个偏导绝对值≤2ρ，均趋于原点偏导 0。','分母为 0，所以补定义后一定不可微。','检查两条坐标轴就已经证明可微。'],correct:0},radial:{options:['函数振荡，所以必不连续。','有限网格上没有明显斜率变化，所以偏导连续。','|f|/ρ≤ρ 证明可微，但一列点上的 fₓ 恒为 −1，不趋于原点偏导 0。'],correct:2}};return all[id];
}
export function relationsPage(s){return relationsHeader(s)+(s.screen==='map'?relationsMap(s):s.screen==='case'?relationsCase(s):relationsChallenge(s));}

export function caseContinuation(s){
 const positive={'s-d':['d-p','沿坐标轴，看线性映射的系数。'],'d-p':['d-c','再看为什么可微一定连续。']};
 const counter={'d-s':['p-c','下一步：坐标轴的平静，会骗过你吗？'],'p-c':['c-p','把连续与偏导的箭头也反过来。'],'c-p':['p-d','最后试试：连续 + 偏导存在，够不够？']};
 let title,action,label;
 if(s.stage<2&&positive[s.edge]){const [id,t]=positive[s.edge];title=t;action=`data-r-edge="${id}"`;label='沿下一条定理继续';}
 else if(s.stage<2){title='现在，试着把箭头反过来。';action='data-r-stage="2"';label='尝试逆推';}
 else if(s.stage===2){title='一个光滑正例，不能证明逆推总是成立。';action='data-r-model="oscillation"';label='换成 x² sin(1/x)';}
 else if(s.stage===3&&counter[s.edge]){const [id,t]=counter[s.edge];title=t;action=`data-r-edge="${id}"`;label='继续检验下一条逆推';}
 else{title='把反例放回图中，再独立判断一个新函数。';action='data-r-stage="4"';label='进入新函数挑战';}
 return `<section class="rel-next-banner"><div><span class="eyebrow">KEEP THE THREAD</span><h3>${title}</h3><p>正例帮助理解定理；反例必须同时满足“前提真、结论假”。</p></div><button class="button primary" ${action}>${label} →</button></section>`;
}

import { icon } from './icons.js';
import { format } from './math.js';

// All markup below is trusted, authored mathematical content. URL input is never HTML.
export const math = (body, label = '', display = false) => `<math xmlns="http://www.w3.org/1998/Math/MathML" ${display?'display="block"':''} ${label?`aria-label="${label}"`:''}>${body}</math>`;
const row = s => `<mrow>${s}</mrow>`;
export const frac = (a,b) => `<mfrac>${row(a)}${row(b)}</mfrac>`;
const sq = x => `<msup><mi>${x}</mi><mn>2</mn></msup>`;
const fourth = x => `<msup><mi>${x}</mi><mn>4</mn></msup>`;
const x2y2 = `${sq('x')}<mo>+</mo>${sq('y')}`;
const norm = `<msqrt>${x2y2}</msqrt>`;
export const formulas = {
  limits: math(`<mi>F</mi><mo>(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo>)</mo><mo>=</mo>${frac(`${sq('x')}<mi>y</mi>`,`${fourth('x')}<mo>+</mo>${sq('y')}`)}`, 'F(x,y) = x²y / (x⁴+y²)'),
  smooth: math(`<mi>f</mi><mo>(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo>)</mo><mo>=</mo>${x2y2}`, 'f(x,y) = x²+y²'),
  counter: math(`<mi>g</mi><mo>(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo>)</mo><mo>=</mo>${frac('<mi>x</mi><mi>y</mi>',norm)}`, 'g(x,y) = xy / √(x²+y²)'),
  error: math(`<mi>E</mi><mo>(</mo><mi>h</mi><mo>)</mo><mo>=</mo>${frac('<mo>|</mo><mi>f</mi><mo>(</mo><mi>h</mi><mo>)</mo><mo>−</mo><mi>f</mi><mo>(</mo><mn>0</mn><mo>)</mo><mo>−</mo><mi>L</mi><mo>(</mo><mi>h</mi><mo>)</mo><mo>|</mo>','moPLACEHOLDER')}`.replace('moPLACEHOLDER','<mo>‖</mo><mi>h</mi><mo>‖</mo>'), 'E(h) = |f(h) − f(0) − L(h)| / ‖h‖'),
};

export function header(s) {
  const is=s.lab==='limits';
  return `<div class="page-heading"><div><div class="breadcrumb">实验室 <span>/</span> ${is?'多元极限':'偏导与可微性'}</div><div class="eyebrow">EXPERIMENT ${is?'01':'02'} <span>—</span> ${is?'THE PATH TRAP':'BEYOND PARTIAL DERIVATIVES'}</div><h1>${is?'所有直线，都不够。':'偏导存在，也不够。'}</h1><p class="page-subtitle">${is?'如果沿每条直线都趋于 0，二元极限就一定是 0 吗？':'曲面靠近了平面，就足够了吗？把误差放到正确的尺度上。'}</p></div><div class="heading-actions"><button class="button subtle" data-action="reset">${icon('reset')}<span>重置</span></button><button class="button subtle" data-action="share">${icon('share')}<span>分享实验</span></button></div></div>
    <div class="workspace-tabs" role="tablist" aria-label="学习阶段"><button id="tab-explore" role="tab" data-tab="explore" aria-selected="${s.tab==='explore'}" aria-controls="panel-explore" tabindex="${s.tab==='explore'?0:-1}">${icon('eye')}<span>动手探索</span><small>01</small></button><button id="tab-proof" role="tab" data-tab="proof" aria-selected="${s.tab==='proof'}" aria-controls="panel-proof" tabindex="${s.tab==='proof'?0:-1}">${icon('book')}<span>定义与证明</span><small>02</small></button><button id="tab-quiz" role="tab" data-tab="quiz" aria-selected="${s.tab==='quiz'}" aria-controls="panel-quiz" tabindex="${s.tab==='quiz'?0:-1}">${icon('quiz')}<span>检查理解</span><small>03</small></button><span class="tabs-note">观察 → 猜想 → 证明</span></div>`;
}
const choice = (key,value,label) => `<button data-set="${key}" data-value="${value}" aria-pressed="false">${label}</button>`;
const slider = (id,label,min,max,step,value,helper='') => `<div class="slider-block"><div class="control-label"><label for="${id}">${label}</label><output id="${id}-value" for="${id}">${value}</output></div><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">${helper?`<div class="slider-endpoints">${helper}</div>`:''}</div>`;

function limitsControls(s) {
  return `<section class="card controls-card" aria-labelledby="control-title"><div class="card-eyebrow"><span class="status-dot"></span> THE EXPERIMENT <span class="card-corner">ℝ² → ℝ</span></div><h2 id="control-title">选择一条到原点的路</h2><div class="function-box">${formulas.limits}<span>在原点补定义 F(0, 0) = 0；分式只用于非原点。</span></div>
    <div class="control-label"><span>路径族</span><span class="tag-small">先固定，再趋近</span></div><div class="segmented" role="group" aria-label="选择路径">${choice('path','line','直线')}${choice('path','parabola','抛物线')}${choice('path','vertical','竖直线')}</div>
    <div class="path-equation" id="path-equation"></div>
    ${slider('coefficient','固定系数 k',-3,3,.1,s.k,'<span>−3</span><span>0</span><span>3</span>')}
    <div class="divider"></div>
    ${slider('scale','靠近原点 · |t|',0,4,.01,s.q,'<span>1 · 远</span><span>10⁻⁴ · 近</span>')}
    <div class="small-row"><div class="sign-choice" role="group" aria-label="参数方向">${choice('sign','1','t > 0')}${choice('sign','-1','t < 0')}</div><button class="button play-button" data-action="play">${icon('play')}<span>自动靠近</span></button></div>
    <div class="live-data" id="live-data" aria-label="当前点的计算结果"></div>
    <button class="button full-width pin-button" data-action="pin">${icon('plus')}加入路径比较 <span class="button-end" id="pin-count">0/4</span></button><div id="pin-list" class="pin-list"></div>
    <p class="control-footnote">数值显示已舍入。t 不是欧氏距离；原点值不决定极限。</p>
  </section>`;
}
function diffControls(s) {
  return `<section class="card controls-card" aria-labelledby="control-title"><div class="card-eyebrow"><span class="status-dot"></span> THE EXPERIMENT <span class="card-corner">R / ‖h‖</span></div><h2 id="control-title">近似，要有多精确？</h2>
    <div class="segmented model-choice" role="group" aria-label="选择函数">${choice('model','smooth','光滑函数 f')}${choice('model','counter','反例函数 g')}</div><div class="function-box" id="function-box"></div>
    <div class="partial-badges"><span>∂ / ∂x = 0</span><span>∂ / ∂y = 0</span><span>在原点</span></div><p class="control-footnote">两个例子的偏导都为零，唯一候选线性映射都是 L = 0。是否真的可微，还要检查余项。</p>
    ${slider('angle','靠近方向 θ',0,360,1,s.angle,'<span>0° · x 轴</span><span>180°</span><span>360°</span>')}
    <div class="preset-row"><button data-action="direction" data-value="0">沿 x 轴</button><button data-action="direction" data-value="90">沿 y 轴</button><button data-action="direction" data-value="45">沿对角线 ↗</button></div>
    ${slider('scale','位移长度 ρ',0,4,.01,s.q,'<span>1 · 远</span><span>10⁻⁴ · 近</span>')}
    <button class="button play-button full-width" data-action="play">${icon('play')}<span>自动靠近原点</span></button>
    <div class="divider"></div><div class="control-label"><span>你正在观察什么？</span></div><div class="segmented metric-choice" role="group" aria-label="误差度量">${choice('metric','raw','绝对误差 |R|')}${choice('metric','ratio','归一化 |R| / ρ')}</div><div class="live-data diff-data" id="live-data" aria-label="当前误差计算结果"></div><div id="worst-error" class="worst-error"></div><p class="control-footnote">面板数值已舍入；精确公式与证明见下一页。</p>
  </section>`;
}
export function explore(s) {
  const is=s.lab==='limits';
  return `<section id="panel-explore" role="tabpanel" aria-labelledby="tab-explore" class="experiment-grid">${is?limitsControls(s):diffControls(s)}<div class="visual-column">
    <section class="card visualization-card" aria-labelledby="visual-title"><div class="visual-head"><div><span class="overline">${is?'01 / INPUT SPACE':'01 / LOCAL GEOMETRY'}</span><h2 id="visual-title">${is?'同一个原点，不同的靠近方式':'同一组偏导，不同的局部行为'}</h2></div><div class="view-switch" role="group" aria-label="图形视图">${is?choice('view','plane','平面')+choice('view','surface','曲面'):choice('view','surface','曲面')+choice('view','polar','方向扫描')}</div></div>
      <div class="main-plot" id="main-plot"></div><div class="visual-toolbar"><label class="toggle"><input id="zoom" type="checkbox" ${s.zoom?'checked':''}><span class="toggle-track"></span><span>${is?'跟随放大':'局部放大'}</span></label><span id="plot-hint" class="plot-hint"></span><button class="text-button camera-reset" data-action="camera-reset">重置视角</button></div>
      <div class="chart-separator"></div><div class="chart-head"><div><span class="overline">02 / ${is?'WATCH THE LIMIT':'MEASURE THE ERROR'}</span><h3 id="chart-title">${is?'当 |t| 变小，函数值去哪儿？':'误差变小了，比例呢？'}</h3></div><button class="icon-button" data-action="export" aria-label="导出当前曲线数据为 CSV" title="导出 CSV">${icon('download')}</button></div><div id="convergence-plot" class="convergence-plot"></div><div id="chart-legend" class="chart-legend"></div>
    </section><div id="observation" class="observation" aria-label="解析结论提示"></div>
  </div>
  <section class="discovery-card"><div class="discovery-icon">${icon('info')}</div><div><span class="overline">TRY THIS NEXT</span><h3>${is?'试着让两条路径给出不同答案。':'先看它缩小，再检查它缩小得够不够快。'}</h3><p>${is?'保留直线 y = x，再沿 y = x² 靠近。两条曲线的横轴使用同一个参数 t，而不是相同距离。':'在 45° 方向，先看 |R|，再切换到 |R| / ρ。之后沿坐标轴重试：一个好方向能代表所有方向吗？'}</p></div><button class="button" data-action="challenge">${is?'构造反例':'开始对照'} ${icon('arrow')}</button></section>
  <div class="evidence-note">${icon('info')} <span><strong>图像帮助发现，证明负责确认。</strong> 上面的曲线只包含有限采样；下方公式来自解析计算，不是从图上猜出的极限。</span><button class="text-button" data-tab="proof">阅读证明 →</button></div>
  </section>`;
}

const proofBlock = (n,title,body) => `<section class="proof-block"><span class="proof-number">${n}</span><div><h3>${title}</h3>${body}</div></section>`;
const equation = html => `<div class="proof-equation">${html}</div>`;
const inline = s => `<span class="inline-math">${s}</span>`;

export function proof(s) {
  const is=s.lab==='limits';
  return `<section id="panel-proof" role="tabpanel" aria-labelledby="tab-proof" class="reading-layout"><article class="card proof-article"><div class="reading-heading"><span class="eyebrow">FROM OBSERVATION TO PROOF</span><span class="proof-badge">${icon('check')} 解析论证</span></div><h2>${is?'“每条直线”与“所有趋近方式”，<br>中间还差了什么？':'可微性要求的，<br>不只是“误差趋于零”。'}</h2>${is?limitsProof():diffProof()}<div class="reading-bottom"><span>■</span><button class="button primary" data-tab="quiz">用一个新问题检验理解 ${icon('arrow')}</button></div></article><aside class="reading-aside"><div class="card takeaway"><span class="overline">THE TAKEAWAY</span><h3>${is?'反例需要一条路。<br>证明需要所有路。':'绝对误差趋于零，<br>只是开始。'}</h3><p>${is?'找到两条路径的极限不同，就能否定二元极限。验证有限条路径、甚至全部直线，都不足以确认二元极限。':'可微性要求存在一个统一的线性映射，使误差相对于位移长度，在所有方向上都趋于零。'}</p><button class="text-button" data-tab="explore">带着定义回到实验 →</button></div><div class="reading-reference"><h4>继续阅读</h4><p>OpenStax · Calculus Volume 3</p><a href="https://openstax.org/books/calculus-volume-3/pages/${is?'4-2-limits-and-continuity':'4-4-tangent-planes-and-linear-approximations'}" target="_blank" rel="noopener noreferrer">${is?'§4.2 Limits and Continuity':'§4.4 Tangent Planes'} ↗</a><p>本站推导独立写成，引用用于延伸学习。函数、原点定义与量词以本页为准。</p></div></aside></section>`;
}
function limitsProof() {
  return `<p class="reading-intro">实验中的分式定义在非原点处；另设 F(0, 0) = 0。我们研究的是穿孔邻域内的极限，改变原点值不会改变极限是否存在。</p><div class="definition-box"><span class="overline">严格定义 · 二元极限</span><p>称 F(x, y) 在 (x, y) → (0, 0) 时趋于 A，是指：</p>${equation(math('<mo>∀</mo><mi>ε</mi><mo>&gt;</mo><mn>0</mn><mo>,</mo><mspace width=".5em"/><mo>∃</mo><mi>δ</mi><mo>&gt;</mo><mn>0</mn><mo>,</mo><mspace width=".5em"/><mn>0</mn><mo>&lt;</mo>'+norm+'<mo>&lt;</mo><mi>δ</mi><mo>⇒</mo><mo>|</mo><mi>F</mi><mo>(</mo><mi>x</mi><mo>,</mo><mi>y</mi><mo>)</mo><mo>−</mo><mi>A</mi><mo>|</mo><mo>&lt;</mo><mi>ε</mi>'))}<p>同一个 δ 必须覆盖邻域内的<strong>所有点</strong>，不能先为每条路径挑一个不同的尺度，再把它当成统一尺度。</p></div>
  ${proofBlock('01','固定任意斜率，直线路径的极限确实是 0',`<p>沿 y = kx。若 k ≠ 0，对 x ≠ 0 有：</p>${equation(math('<mi>F</mi><mo>(</mo><mi>x</mi><mo>,</mo><mi>k</mi><mi>x</mi><mo>)</mo><mo>=</mo>'+frac('<mi>k</mi><mi>x</mi>',sq('x')+'<mo>+</mo>'+sq('k'))+'<mo>→</mo><mn>0</mn>'))}<p>若 k = 0，则 F(x, 0) = 0。竖直线 x = 0 不在 y = kx 这一族中，需要另外检查：F(0, y) = 0。因此<strong>所有经过原点的直线</strong>都给出极限 0。这是代数证明，不是滑块穷举。</p>`)}
  ${proofBlock('02','让斜率随着位置变化：抛物线漏网了',`<p>沿 y = cx²，对任意固定实数 c 和 x ≠ 0：</p>${equation(math('<mi>F</mi><mo>(</mo><mi>x</mi><mo>,</mo><mi>c</mi>'+sq('x')+'<mo>)</mo><mo>=</mo>'+frac('<mi>c</mi>'+fourth('x'),fourth('x')+'<mo>+</mo>'+sq('c')+fourth('x'))+'<mo>=</mo>'+frac('<mi>c</mi>','<mn>1</mn><mo>+</mo>'+sq('c'))))}<p>取 c = 1，沿 y = x² 恒为 1/2。与 x 轴上的 0 不同。注意 y = x² 也可以写成 y = k(x)x，其中 k(x) = x，<strong>斜率不再固定</strong>。</p>`)}
  ${proofBlock('03','严格否定二元极限',`<p>令 aₙ = (1/n, 0)，bₙ = (1/n, 1/n²)。两列非原点都趋于原点，但 F(aₙ) = 0，F(bₙ) = 1/2。若二元极限存在，任意趋于原点的非原点序列都必须得到相同函数极限，矛盾。</p><p>也可直接用定义：由 x 轴可知唯一可能的极限是 0。取 ε₀ = 1/4。对任意 δ &gt; 0，选 0 &lt; t &lt; min(1, δ/√2)。则</p>${equation(math('<mn>0</mn><mo>&lt;</mo><msqrt>'+sq('t')+'<mo>+</mo>'+fourth('t')+'</msqrt><mo>≤</mo><msqrt><mn>2</mn></msqrt><mi>t</mi><mo>&lt;</mo><mi>δ</mi>'))}<p>但 F(t, t²) = 1/2 &gt; ε₀，违背极限为 0 的定义。所以<strong>二元极限不存在</strong>。</p>`)}
  <div class="proof-warning"><strong>别把量词交换了。</strong><p>“对每个固定 k，都能足够靠近”不等于“足够靠近时，对所有点都成立”。甚至在任意很小的半径内，抛物线上的函数值仍然是 1/2。</p></div>`;
}
function diffProof() {
  return `<p class="reading-intro">比较 f(x, y) = x² + y² 与 g(x, y) = xy / √(x² + y²)，后者在原点补定义 g(0, 0) = 0。所有结论都针对原点。</p><div class="definition-box"><span class="overline">严格定义 · FRÉCHET 可微性</span><p>函数 u 在原点可微，是指存在<strong>线性映射</strong> L : ℝ² → ℝ，使</p>${equation(formulas.error.replaceAll('<mi>f</mi>','<mi>u</mi>'))}${equation(math('<munder><mi>lim</mi><mrow><mi>h</mi><mo>→</mo><mn>0</mn></mrow></munder>'+frac('<mo>|</mo><mi>u</mi><mo>(</mo><mi>h</mi><mo>)</mo><mo>−</mo><mi>u</mi><mo>(</mo><mn>0</mn><mo>)</mo><mo>−</mo><mi>L</mi><mo>(</mo><mi>h</mi><mo>)</mo><mo>|</mo>','<mo>‖</mo><mi>h</mi><mo>‖</mo>')+'<mo>=</mo><mn>0</mn>'))}<p>等价地：∀ε &gt; 0，∃δ &gt; 0，对所有 0 &lt; ‖h‖ &lt; δ，都有 |R(h)| &lt; ε‖h‖。<strong>h 是二维位移，不是某一条预选路径。</strong></p></div>
  ${proofBlock('01','先证明偏导存在，并确定唯一候选 L',`<p>光滑例子：f(t, 0)/t = t → 0，f(0, t)/t = t → 0。反例：g(t, 0) = g(0, t) = 0，所以两个偏导也都是 0。</p><p>若可微，线性映射必为 L(h₁, h₂) = uₓ(0)h₁ + uᵧ(0)h₂；因此这两个函数的<strong>唯一候选都是 L = 0</strong>。候选映射存在不代表它满足余项条件。</p>`)}
  ${proofBlock('02','光滑例子：误差是二阶小量',`<p>记 ρ = √(h₁² + h₂²) &gt; 0。对任意方向，f 的误差为 R = ρ²，因此</p>${equation(math(frac('<mo>|</mo><mi>R</mi><mo>|</mo>','<mi>ρ</mi>')+'<mo>=</mo><mi>ρ</mi><mo>→</mo><mn>0</mn>'))}<p>给定 ε &gt; 0，取 δ = ε 即满足定义。结论对所有位移成立，不依赖于方向，所以 <strong>f 在原点可微</strong>，切平面为 z = 0。</p>`)}
  ${proofBlock('03','反例甚至连续，但误差仍是一阶量',`<p>由 2|xy| ≤ x² + y²，得到 |g(x, y)| ≤ ρ/2 → 0，因此 g 在原点连续（给定 ε，取 δ = 2ε）。</p><p>令 (x, y) = (ρ cos θ, ρ sin θ)，其中 ρ &gt; 0。对候选 L = 0：</p>${equation(math('<mo>|</mo><mi>R</mi><mo>|</mo><mo>=</mo><mi>ρ</mi><mo>|</mo><mi>cos</mi><mi>θ</mi><mi>sin</mi><mi>θ</mi><mo>|</mo>'))}${equation(math(frac('<mo>|</mo><mi>R</mi><mo>|</mo>','<mi>ρ</mi>')+'<mo>=</mo><mo>|</mo><mi>cos</mi><mi>θ</mi><mi>sin</mi><mi>θ</mi><mo>|</mo><mo>=</mo>'+frac('<mo>|</mo><mi>sin</mi><mo>(</mo><mn>2</mn><mi>θ</mi><mo>)</mo><mo>|</mo>','<mn>2</mn>')))}<p>沿坐标轴该比例为 0；沿 θ = 45° 的射线却恒为 1/2，与 ρ 无关。所以 g <strong>在原点不可微</strong>。图中的 z = 0 只能称为“候选平面”。</p>`)}
  ${proofBlock('04','为什么“所有方向”必须统一？',`<p>在半径 ρ 的圆周上取所有方向的最坏归一化误差：</p>${equation(math('<msub><mi>M</mi><mi>u</mi></msub><mo>(</mo><mi>ρ</mi><mo>)</mo><mo>=</mo><munder><mi>sup</mi><mrow><mn>0</mn><mo>≤</mo><mi>θ</mi><mo>&lt;</mo><mn>2</mn><mi>π</mi></mrow></munder>'+frac('<mo>|</mo><mi>R</mi><mo>(</mo><mi>ρ</mi><mo>,</mo><mi>θ</mi><mo>)</mo><mo>|</mo>','<mi>ρ</mi>')))}<p>本例解析得到 M<sub>f</sub>(ρ) = ρ，而 M<sub>g</sub>(ρ) = 1/2。因此前者趋于 0，后者不会。页面上的“最坏方向”数值来自这些公式，<strong>不是从有限个角度取最大值</strong>。</p>`)}
  <div class="proof-warning"><strong>“靠近”与“线性近似得足够好”是不同的。</strong><p>绝对误差趋于 0 只说明函数值接近候选平面。可微性需要更强的 R(h) = o(‖h‖)，而不是仅仅 R(h) → 0 或 R(h) = O(‖h‖)。</p></div>
  <details class="extra-note"><summary>这个反例在其他方向上的方向导数存在吗？</summary><p>采用双侧定义 Dᵥg(0) = lim<sub>t→0</sub> g(tv)/t 时，对单位向量 v = (cos θ, sin θ)，g(tv)/t = sign(t) cos θ sin θ。因此除坐标轴方向外双侧方向导数不存在。实验的 ρ 总是正数；转动 θ 是在选择射线，不能把单侧径向观察误写成双侧方向导数。</p></details>`;
}

export const quizzes = {
  limits: [
    { question:'把 F(0, 0) 改成 1/2，能让这个函数在原点连续吗？', options:['可以，因为抛物线路径的值就是 1/2。','不可以，非原点路径之间的冲突仍然存在。','必须再检查更多条直线才能判断。'], correct:1, reason:'连续需要二元极限存在且等于函数值。改变单点值不能消除沿 x 轴为 0、沿抛物线为 1/2 的冲突。' },
    { question:'换成 y = −2x²，沿这条路径的极限是多少？', options:['0','−2/5','−1/2'], correct:1, reason:'代入 c/(1+c²)，取 c = −2，得到 −2/(1+4) = −2/5。不是所有抛物线都给出 1/2。' },
    { question:'下面哪种论证，足以证明一个一般二元函数在原点的极限为 0？', options:['检查一百万条靠近原点的路径，结果都很小。','严格证明沿每条直线都趋于 0。','找到对邻域内所有非原点都成立的界 |u(x,y)| ≤ √(x²+y²)。'], correct:2, reason:'第三个选项提供统一控制：对任意 ε > 0，取 δ = ε 即可。有限采样和所有直线都不能代替邻域内的全称量词。' },
  ],
  differentiability: [
    { question:'沿对角线把位移缩小十倍，反例 g 的绝对误差与归一化误差怎样变化？', options:['绝对误差缩小十倍；归一化误差不变。','两者都缩小十倍。','两者都不变。'], correct:0, reason:'θ = 45° 时 |R| = ρ/2，而 |R|/ρ = 1/2。原点越近不代表比例越小。' },
    { question:'某个函数满足：在足够小的整个邻域里，|u(h) − u(0) − L(h)| ≤ 7‖h‖³ᐟ²，且 L 为线性映射。可以推出什么？', options:['只能推出两个偏导存在。','可以推出在原点可微，导数为 L。','不可微，因为误差不是零。'], correct:1, reason:'除以 ‖h‖，误差比例 ≤ 7√‖h‖ → 0。可取 δ 不大于已知邻域半径及 (ε/7)²。线性近似不要求零误差。' },
    { question:'沿 x 轴，g 的归一化误差一直为 0。为什么不能据此判断可微？', options:['因为 x 轴不能用来求偏导。','因为归一化误差必须趋于 1。','因为可微性要求同一个线性映射在所有小位移上统一有效。'], correct:2, reason:'x 轴和 y 轴的行为只约束偏导与候选映射；对角线给出的恒定 1/2 已经否定全体位移上的要求。' },
  ],
};
export function quiz(s) {
  const qs=quizzes[s.lab];
  return `<section id="panel-quiz" role="tabpanel" aria-labelledby="tab-quiz" class="quiz-layout"><div class="quiz-heading"><span class="eyebrow">CAN YOU EXPLAIN WHY?</span><h2>不看图，你真的理解了吗？</h2><p>三个小问题。答案不会上传，也不计时；选完后可以查看逐题解释。</p></div><form id="quiz-form">${qs.map((q,i)=>`<fieldset class="card quiz-card"><legend><span class="question-no">0${i+1}</span>${q.question}</legend><div class="quiz-options">${q.options.map((o,j)=>`<label class="quiz-option"><input type="radio" name="question-${i}" value="${j}" required><span class="choice-letter">${String.fromCharCode(65+j)}</span><span>${o}</span></label>`).join('')}</div><div id="feedback-${i}" class="quiz-feedback" hidden></div></fieldset>`).join('')}<div class="quiz-submit"><button class="button primary" type="submit">检查我的理解 ${icon('check')}</button><span id="quiz-summary" role="status" aria-live="polite"></span><button class="text-button" type="button" data-action="quiz-reset">重新作答</button></div></form></section>`;
}
export const footer = `<footer class="page-footer"><span>MA PLAYGROUND <b>·</b> 数学分析我爱你～</span><span><button class="text-button footer-help" data-action="about">使用说明</button> · 在浏览器中计算 · 不收集数据 · <a href="https://github.com/xby474-dev/MA_playground/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT</a></span></footer>`;

import { icon } from './icons.js';
import { math, frac } from './content.js';
import { STAGES } from './field-math.js';
import { pageGuide } from './page-guide.js';
export const stageInfo={
  green:{tag:'GREEN · CIRCULATION',short:'Green',sub:'平面 · 环流',title:'从一个小方格开始。',intro:'沿边界绕一圈，记录的是切向累积。把许多小环流拼起来，会剩下什么？',inside:'面积内的旋度',outside:'边界环流',object:'小区域',boundary:'边',transition:'把“沿着边”改成“穿过边”，平面上也能读通量。',next:'换一种边界读数 →'},
  flux:{tag:'THE BRIDGE · PLANAR FLUX',short:'通量桥梁',sub:'平面 · 通量',title:'沿着边，还是穿过边？',intro:'同一向量场、同一分块。把切向读数换成外法向读数，内部对应的量也从旋度变成散度。',inside:'面积内的散度',outside:'边界净通量',object:'小区域',boundary:'边',transition:'二维区域向第三个方向延伸：边变成面，面积变成体积。',next:'把小区域叠成体元 →'},
  gauss:{tag:'GAUSS · DIVERGENCE',short:'Gauss',sub:'体积 · 通量',title:'把方格，叠成体元。',intro:'每个小盒子都有六个外法向。相邻盒子共享一个面，却把它的法向指向相反的方向。',inside:'体积内的散度',outside:'闭合外壳净通量',object:'体元',boundary:'面',transition:'回到环流这条线：不是给 Gauss 换个名字，而是把 Green 的平面弯成曲面。',next:'让面弯曲，保留边界 →'},
  stokes:{tag:'STOKES · CURVED SURFACE',short:'Stokes',sub:'曲面 · 环流',title:'让曲面弯曲，边界不动。',intro:'小曲面片仍能拼接。它们的公共曲线反向走两次，抵消之后，仍然只剩曲面边缘的环流。',inside:'曲面法向旋度的通量',outside:'曲面边缘环流',object:'曲面片',boundary:'曲线段',transition:'Green 与 Stokes 走“旋度—环流”；通量版 Green 与 Gauss 走“散度—通量”。',next:'把两条线合在一起 →'},
  unify:{tag:'ONE STRUCTURE · TWO READINGS',short:'统一视角',sub:'局部 → 边界',title:'不是三条公式，是一种结构。',intro:'统一的是局部累积与边界抵消的机制；旋度、散度、环流、通量不是可以随意替换的四个名字。',inside:'局部量的积分',outside:'相应的边界积分',object:'区域',boundary:'边界',transition:'回到一个小方格，带着定向、条件和被积量重新观察。',next:'重新走一遍学习路径 →'}
};
export const phaseInfo=[
  ['读一个局部','局部量','先看一个被选中的小区域。局部密度的正负，表示相对于约定方向的旋转或净流出。'],
  ['把区域分块','累积','对每个小区域做同样的读数，再把有向积分相加。它们没有被物理切开，只是在计算中分块。'],
  ['抵消公共边界','抵消','每条公共边或公共面，被相邻两块以相反定向计入两次。拖动抵消进度，看它们从总和中消去。'],
  ['只剩外边界','整体','内部配对的项精确相消。留在总和里的，只有整个区域的外边界。场本身并没有消失。']
];
const eq=(html,label='')=>`<div class="field-equation" ${label?`aria-label="${label}"`:''}>${html}</div>`;
const integral=(symbol,sub,body)=>`<msub><mo>${symbol}</mo><mrow>${sub}</mrow></msub>${body}`;
const F='<mi mathvariant="bold">F</mi>';
const dS='<mi>d</mi><mi>S</mi>',dA='<mi>d</mi><mi>A</mi>',dV='<mi>d</mi><mi>V</mi>';
const boundary='<mo>∂</mo>';
export function theoremEquation(stage,orientation=1) {
  const inward=orientation===-1&&['flux','gauss'].includes(stage)?'<mo>−</mo>':'';
  let body;
  if(stage==='green')body=integral('∬','<mi>D</mi>','<mo>(</mo><msub><mi>Q</mi><mi>x</mi></msub><mo>−</mo><msub><mi>P</mi><mi>y</mi></msub><mo>)</mo>'+dA)+'<mo>=</mo>'+integral('∮',boundary+'<mi>D</mi>','<mi>P</mi><mi>d</mi><mi>x</mi><mo>+</mo><mi>Q</mi><mi>d</mi><mi>y</mi>');
  else if(stage==='flux')body=integral('∬','<mi>D</mi>','<mo>(</mo><msub><mi>P</mi><mi>x</mi></msub><mo>+</mo><msub><mi>Q</mi><mi>y</mi></msub><mo>)</mo>'+dA)+'<mo>=</mo>'+integral('∮',boundary+'<mi>D</mi>',F+'<mo>·</mo><mi>ν</mi><mi>d</mi><mi>s</mi>');
  else if(stage==='gauss')body=integral('∭','<mi>V</mi>','<mo>∇</mo><mo>·</mo>'+F+dV)+'<mo>=</mo>'+integral('∯',boundary+'<mi>V</mi>',F+'<mo>·</mo><mi>n</mi>'+dS);
  else if(stage==='stokes')body=integral('∬','<mi>S</mi>','<mo>(</mo><mo>∇</mo><mo>×</mo>'+F+'<mo>)</mo><mo>·</mo><mi>n</mi>'+dS)+'<mo>=</mo>'+integral('∮',boundary+'<mi>S</mi>',F+'<mo>·</mo><mi>d</mi><mi mathvariant="bold">r</mi>');
  else body=integral('∫','<mi>M</mi>','<mi>d</mi><mi>ω</mi>')+'<mo>=</mo>'+integral('∫',boundary+'<mi>M</mi>','<mi>ω</mi>');
  // Green orientation reversal gives an oriented area, explicitly display minus.
  const sign=stage==='green'&&orientation===-1?'<mo>−</mo>':inward;
  return math(sign+body,stage==='unify'?'广义 Stokes：M 上 dω 的积分等于边界上 ω 的积分':`${stage} 积分恒等式`,true);
}
export function fieldJourney(s) {
  return `<nav class="field-journey" aria-label="统一实验学习路径">${STAGES.map((stage,i)=>`<button data-field-stage="${stage}" ${s.stage===stage?'aria-current="step"':''}><span class="journey-index">${String(i+1).padStart(2,'0')}</span><span><strong>${stageInfo[stage].short}</strong><small>${stageInfo[stage].sub}</small></span>${i<4?'<span class="journey-arrow" aria-hidden="true">→</span>':''}</button>`).join('')}</nav>`;
}
const slider=(key,label,min,max,step,s)=>`<div class="field-slider"><label for="field-${key}">${label}<output for="field-${key}" id="field-${key}-value">${s[key]}</output></label><input type="range" id="field-${key}" data-field-input="${key}" min="${min}" max="${max}" step="${step}" value="${s[key]}"></div>`;
export function fieldControls(s) {
  return `<section class="card field-controls" aria-labelledby="field-controls-title"><span class="overline">ONE VECTOR FIELD · 同一个场</span><h2 id="field-controls-title">转动与流出，分开调节。</h2>
    <div class="field-vector" aria-label="P=a(x+cx²)−by/2，Q=ay+b(x+cx²)/2，R=az"><div><i>P</i> = a(x + cx²) − by/2</div><div><i>Q</i> = ay + b(x + cx²)/2</div><div><i>R</i> = az <small>仅三维时使用</small></div></div>
    <p class="field-note">a 控制散度，b 控制旋度。两种局部量来自同一个 <strong>F = (P,Q,R)</strong>，却测量不同的事情。</p>
    ${slider('b','旋转参数 b',-2,2,.1,s)}${slider('a','源汇参数 a',-2,2,.1,s)}
    <div class="field-presets" role="group" aria-label="向量场预设"><button data-field-preset="rotation">旋转项</button><button data-field-preset="source">源汇项</button><button data-field-preset="mixed">混合场</button></div>
    <div class="field-rule"></div>${slider('n','每个方向分几块 n',2,6,1,s)}
    ${s.stage==='stokes'?slider('h','曲面隆起 h · 边界不动',0,2,.05,s):''}
    ${s.stage==='gauss'?slider('slice','透视观察层 · 从 0 计数',0,s.n-1,1,s):''}
    <label class="field-cell-picker" for="field-cell">选中的${stageInfo[s.stage].object}<input id="field-cell" type="number" min="1" max="${s.n**(s.stage==='gauss'?3:2)}" value="${s.cell+1}" inputmode="numeric"><span id="field-cell-total">/ ${s.n**(s.stage==='gauss'?3:2)}</span></label><p class="field-note">也可以点击图中网格。该输入框可用键盘切换选择。</p>
    <details class="field-advanced"><summary>参数化与定向 <span>进阶</span></summary>${slider('L','区域边长 L',1,3,.1,s)}${slider('c','非均匀程度 c',0,1,.1,s)}
    <div class="field-orientation" role="group" aria-label="选择边界和区域定向"><button data-field-orientation="1" aria-pressed="${s.orientation===1}">标准定向</button><button data-field-orientation="-1" aria-pressed="${s.orientation===-1}">反向定向</button></div><p class="field-note" id="field-orientation-note"></p>
    ${['gauss','stokes'].includes(s.stage)?slider('viewAngle','旋转观察视角',-180,180,5,s):''}
    <label class="field-check"><input type="checkbox" id="field-arrows" ${s.arrows?'checked':''}> 显示辅助向量箭头</label><p class="field-note">箭头作方向示意；图上的长度和颜色都不是积分证明。</p></details>
    <button class="button field-export" data-field-action="export">${icon('download')} 导出每块的积分账本</button>
  </section>`;
}
export function fieldExplore(s) {
  const info=stageInfo[s.stage];
  if(s.stage==='unify')return fieldUnify(s);
  return `<section id="panel-explore" role="tabpanel" aria-labelledby="tab-explore" class="field-experiment">${fieldJourney(s)}
    <div class="field-stage-intro"><div><span class="overline">${info.tag}</span><h2>${info.title}</h2><p>${info.intro}</p></div><span class="field-stage-number" aria-hidden="true">${String(STAGES.indexOf(s.stage)+1).padStart(2,'0')}</span></div>
    <div class="field-workspace">${fieldControls(s)}<div class="field-visual-column">
    <section class="card field-visual" aria-labelledby="field-scene-title">
      <div class="field-phase-track" role="group" aria-label="从局部走向整体">${phaseInfo.map((p,i)=>`<button data-field-phase="${i}" aria-pressed="${s.phase===i}"><span>${i+1}</span>${p[1]}</button>`).join('')}</div>
      <div class="field-phase-copy"><h3 id="field-scene-title">${phaseInfo[s.phase][0]}</h3><p id="field-phase-description">${phaseInfo[s.phase][2]}</p></div>
      <div id="field-scene" class="field-scene"></div>
      <div class="field-playbar"><button class="button" data-field-action="play" aria-pressed="false">${icon('play')} 播放抵消过程</button><span>可暂停，也可逐步点击上方四步</span></div>
      <div id="field-cancel-control" class="field-cancel-control" ${s.phase===2?'':'hidden'}>${slider('cancel','公共边界从总和中消去',0,1,.02,s)}</div>
      <div id="field-pair" class="field-pair" aria-label="公共边界的成对积分"></div>
      <div class="field-account-head"><span class="overline">EXACT INTEGRALS · 整个区域的解析账本</span><button class="text-button" data-tab="proof">为什么成立？ ↗</button></div>
      <div class="field-equivalence"><div><span id="field-inside-label">${info.inside}</span><strong id="field-inside-value"></strong><small>从导数的区域积分独立计算</small></div><b aria-hidden="true">=</b><div><span id="field-outside-label">${info.outside}</span><strong id="field-outside-value"></strong><small>从原场的边界积分独立计算</small></div></div>
      <div id="field-counts" class="field-counts"></div><div id="field-current-formula" class="field-current-formula"></div>
      <div id="field-numeric-note" class="field-numeric-note"></div>
    </section>
    <section class="card field-inspector" aria-labelledby="field-inspector-title"><div><span class="overline">READ ONE PIECE · 局部放大镜</span><h3 id="field-inspector-title">选中的一块，究竟在测什么？</h3></div><div id="field-local-data"></div></section>
    </div></div>
    <div class="field-transition"><div><span class="overline">THE SAME IDEA, ONE STEP FURTHER</span><h3>${info.transition}</h3></div><button class="button primary" data-field-action="next-stage">${info.next}</button></div>
    <p class="field-evidence">${icon('info')} 分块与图形用于建立直觉；本例等式由解析积分验证，一般定理依赖光滑性、定向及区域条件。有限采样不充当证明。</p>
  </section>`;
}
export function fieldUnify(s) {
  return `<section id="panel-explore" role="tabpanel" aria-labelledby="tab-explore" class="field-experiment">${fieldJourney(s)}<div class="field-stage-intro"><div><span class="overline">${stageInfo.unify.tag}</span><h2>${stageInfo.unify.title}</h2><p>${stageInfo.unify.intro}</p></div></div>
  <section class="card field-unify-hero"><div id="field-scene"></div><div class="field-unify-motto"><span>局部量的累积</span><b>=</b><span>边界上的整体效应</span></div></section>
  <section class="card field-comparison"><h3>同一组参数，四种配对。</h3><p class="field-note" id="field-summary-params"></p><div class="field-table-scroll"><table><caption class="sr-only">内部与边界的量及本例精确积分比较</caption><thead><tr><th>定理</th><th>在内部累积</th><th>在边界读取</th><th>本例有向积分</th></tr></thead><tbody id="field-summary-table"></tbody></table></div><p class="field-note">这里的数值保留了前面设置的参数。Stokes 的曲面是二维的，尽管它放在三维空间里；Gauss 的区域才是三维体积。</p></section>
  <div class="field-unify-grid"><section class="card field-condition-card"><span class="overline">A CONDITION IS NOT DECORATION</span><h3>遇到一个洞，还能忽略它吗？</h3><p>独立的条件检查：令 <span class="inline-math">G = (−y/(x²+y²), x/(x²+y²))</span>。它在原点以外的旋度为 0。</p><div class="field-hole-switch"><button data-field-action="hole" aria-pressed="${s.hole}">${s.hole?'填回原点，检查条件':'挖去原点，保留内边界'}</button></div><div id="field-hole-scene"></div><div id="field-hole-explanation" class="field-note"></div><p class="field-note">此例与上面的多项式场分开：没有把奇点数值填为 0，也没有省略内边界。</p></section>
  <section class="card field-condition-card"><span class="overline">ONE LEVEL DEEPER · OPTIONAL</span><h3>统一，不等于混同。</h3><p>三者都用到“反向计入的公共边界相消”。但一边是<strong>旋度的通量 → 原场的环流</strong>，另一边是<strong>散度的体积分 → 原场的通量</strong>。</p><details class="field-proof-details"><summary>进阶：广义 Stokes 的语言</summary>${eq(theoremEquation('unify'))}<p>ω 是与边界维数匹配的微分形式，dω 是它的外微分。环流使用 1-形式；三维通量使用 2-形式。这是不同次数的同一种结构，不需要先学微分形式才能理解本实验。</p><p>例如 ω=P dx+Q dy+R dz 对应经典 Stokes；η=P dy∧dz+Q dz∧dx+R dx∧dy 对应 Gauss，dη=(div F) dx∧dy∧dz。</p></details><div class="field-condition-reminder">定向要配套；场要在整个所需区域的邻域足够光滑；有洞的区域要保留所有边界分量。</div><button class="button" data-tab="proof">展开公式与证明 →</button></section></div>
  <div class="field-transition"><div><span class="overline">CHECK THE IDEA, NOT THE MEMORY</span><h3>现在能解释为什么内部项会消失，而场不会消失吗？</h3></div><button class="button primary" data-tab="quiz">检查理解 →</button></div></section>`;
}
const block=(n,title,body)=>`<section class="field-proof-block"><span>${n}</span><div><h3>${title}</h3>${body}</div></section>`;
export function fieldProof(s) {
  return `<section id="panel-proof" role="tabpanel" aria-labelledby="tab-proof" class="field-experiment">${fieldJourney(s)}<div class="field-proof-layout"><article class="card field-proof-article"><span class="overline">FROM CANCELLATION TO A PROOF</span><h2>让直觉，经得起定向与条件的检查。</h2><p class="field-reading-intro">下面先说明定理的条件，再给出本实验区域上的推导。公共边界的抵消是证明的一部分；它本身不能替代局部积分恒等式，更不能替代一般区域的极限论证。</p>
  ${block('01','先固定：积什么，沿什么方向？',`<div class="field-theorem-list">${['green','flux','gauss','stokes'].map(key=>`<details class="field-proof-details" ${s.stage===key?'open':''}><summary>${stageInfo[key].short} · ${stageInfo[key].inside} → ${stageInfo[key].outside}</summary>${eq(theoremEquation(key))}<p>${key==='green'?'D 是平面内有分片光滑边界的正则有界区域，P、Q 在包含其闭包的开集上为 C¹。正向外边界逆时针；有孔时每条内边界顺时针。':key==='flux'?'与 Green 环流版条件相同。ν 为平面外单位法向。外边界正向绕行时，ν 指向切向右侧，ν ds=(dy,−dx)。有孔时朝向孔内才是区域的“外”。':key==='gauss'?'V 是有分片光滑闭合边界的正则有界体积，F 在包含其闭包的开集上为 C¹。n 必须取外单位法向。只有一片不闭合的曲面，不能直接当成 ∂V。': 'S 是紧致、可定向的分片光滑曲面；边界分片光滑。F 在包含 S 的开集上为 C¹。曲面法向 n 与边界切向由右手规则配套；若有多条边界分量，须全部计入。'}</p><p>${key==='stokes'?'这里积的是 curl F 穿过曲面的通量，不是 F 本身的通量。':key==='gauss'?'朝内法向时，边界通量为 −∭V div F dV；散度本身不会因为观察者转向而改变。':'反向绕行会改变有向边界积分的符号，等式左侧也必须相应改号。'}</p></details>`).join('')}</div>`)}
  ${block('02','一个矩形：牛顿–莱布尼茨已经足够。',`<p>令 D=[x₀,x₁]×[y₀,y₁]，按逆时针方向把四条边积分相加。先配对上下边，再配对左右边：</p>${eq('∮<sub>∂D</sub> P dx + Q dy<br>= ∫<sub>x₀</sub><sup>x₁</sup> [P(x,y₀)−P(x,y₁)] dx + ∫<sub>y₀</sub><sup>y₁</sup> [Q(x₁,y)−Q(x₀,y)] dy<br>= ∬<sub>D</sub> (Q<sub>x</sub>−P<sub>y</sub>) dx dy')}<p>第二个等号由一维微积分基本定理与 Fubini 定理得到。这是矩形情形的严格证明，不需要“网格足够细所以应该正确”。</p><details class="field-proof-details"><summary>为什么通量会对应散度，而不是旋度？</summary><p>对辅助场 H=(−Q,P) 应用刚证明的 Green 环流公式：</p>${eq('∮<sub>∂D</sub> (−Q dx + P dy) = ∬<sub>D</sub> (P<sub>x</sub>+Q<sub>y</sub>) dA')}<p>左侧就是原场 F 的外向通量。切向测量换成法向测量时，配套的局部微分表达式也改变了。</p></details>`)}
  ${block('03','一对公共边界：相消是精确的。',`<p>如果两片区域共用一条边 e，那么各自的正向绕行在 e 上恰好相反：</p>${eq('∫<sub>e</sub> F·dr + ∫<sub>−e</sub> F·dr = 0')}<p>通量版本则是同一面、同一个 F、相反的外法向：</p>${eq('∬<sub>面</sub> F·n dS + ∬<sub>面</sub> F·(−n) dS = 0')}<p>这是有向积分的性质，对每一对公共边界都成立；不是两个不同点的采样值“恰好接近”，也不是让相邻的速度相互消失。本实验的配对账本对两侧分别积分，再核对和。</p>`)}
  ${block('04','一个长方体：六个面配成三对。',`<p>对 x 方向两面，固定 y,z，对 P 使用一维基本定理：</p>${eq('∬ [P(x₁,y,z)−P(x₀,y,z)] dy dz = ∭<sub>V</sub> P<sub>x</sub> dV')}<p>再分别对 y 方向的 Q、z 方向的 R 做同样计算，得到：</p>${eq('∯<sub>∂V</sub> F·n dS = ∭<sub>V</sub> (P<sub>x</sub>+Q<sub>y</sub>+R<sub>z</sub>) dV')}<p>这里得到的是长方体情形的严格证明。有限个相容体元拼接可精确相消；任意曲边区域的一般定理还需适当分割、边界逼近和误差控制，本实验不把动画当成那一步证明。</p>`)}
  ${block('05','弯曲的面：把积分拉回参数平面。',`<p>取一个 C² 正则参数化 r(u,v)。定义 A(u,v)=F(r(u,v))·r<sub>u</sub>，B(u,v)=F(r(u,v))·r<sub>v</sub>。对 A、B 应用 Green：</p>${eq('∮<sub>∂S</sub> F·dr = ∮<sub>∂D</sub> A du + B dv<br>= ∬<sub>D</sub> (B<sub>u</sub>−A<sub>v</sub>) du dv')}<details class="field-proof-details" open><summary>链式法则如何让旋度出现？</summary><p>把 F 的每个分量依次求导，乘积法则得到：</p>${eq('B<sub>u</sub>−A<sub>v</sub><br>= (DF(r) r<sub>u</sub>)·r<sub>v</sub> − (DF(r) r<sub>v</sub>)·r<sub>u</sub><br>+ F(r)·(r<sub>vu</sub>−r<sub>uv</sub>)<br>= (curl F)(r)·(r<sub>u</sub>×r<sub>v</sub>)')}<p>最后一项因为混合偏导相等而消失；前两项按分量展开，就是叉积与旋度。又因为 n dS=(r<sub>u</sub>×r<sub>v</sub>) du dv，得到曲面版本。选择 −n 时，边界定向也要一起反转。</p></details><p>这对本实验的单张正则图面给出严格推导。多张相容曲面片可以拼接，其公共曲线反向抵消。该论证说明 Green 是经典 Stokes 在平面上的特例，不是说经典 Stokes 是 Gauss 的直接升级。</p>`)}
  ${block('06','本实验为什么不依赖数值积分？',`<p>使用全空间上光滑的多项式场：</p>${eq('F = (a(x+cx²)−by/2, ay+b(x+cx²)/2, az)<br>curl F = (0,0,b(1+cx))<br>div₂ F = a(2+2cx)，div₃ F = a(3+2cx)')}<p>a 部分是势函数 φ=a(x²/2+cx³/3+y²/2+z²/2) 的梯度；b 部分散度为零。四种完整区域的标准定向结果是：</p>${eq('Green / Stokes：b(L²+cL³/2)<br>平面通量：a(2L²+cL³)<br>Gauss：a(3L³+cL⁴)')}<p>右侧边界读数并非复制这些结果。边界模块独立计算每条边或每个面的原场积分，再求和。两边相等由上述解析推导保证；自动测试只能检查实现是否符合公式。</p><details class="field-proof-details"><summary>曲面隆起为什么不改变本例的环流？</summary>${eq('r(u,v)=(u,v,z(u,v))，0≤u,v≤L<br>z=16h(u/L)(1−u/L)(v/L)(1−v/L)<br>r<sub>u</sub>×r<sub>v</sub>=(−z<sub>u</sub>,−z<sub>v</sub>,1)')}<p>边界上 z=0，始终是同一个正方形。旋度只有 z 分量，所以：</p>${eq('(curl F)(r)·(r<sub>u</sub>×r<sub>v</sub>) = b(1+cu)')}<p>注意单位法向密度是 b(1+cu)/√(1+z<sub>u</sub>²+z<sub>v</sub>²)，实际面积元则多乘同一个平方根；不能把 dS 当成 du dv。本实验对相消后的参数密度做解析积分。</p><p>曲面网格的每条边在参数平面是线段，但在空间中可能是曲线。梯度部分积分用 φ(终点)−φ(起点)，旋转部分只依赖 x,y 的多项式积分，因此仍是精确边积分，不是用弦替代曲线。</p></details>`)}
  <div class="field-condition-reminder"><strong>适用范围：</strong>本页给出矩形、长方体及本实验图面的推导；一般积分定理采用上方条件。形状看起来合理、两次数值相等或有限网格抵消，都不能独立证明任意场、任意区域上的结论。</div>
  <div class="reading-bottom"><button class="text-button" data-tab="explore">← 回到实验</button><button class="button primary" data-tab="quiz">带着条件检查理解 →</button></div>
  </article><aside class="field-proof-aside"><div class="card field-condition-card"><span class="overline">KEEP THESE THREE</span><h3>先问这三件事。</h3><p>内部的区域是面还是体？</p><p>边界上测的是环流还是通量？</p><p>定向、光滑性、所有边界分量是否都已包含？</p></div><div class="field-references"><h4>进一步核对</h4><p>一般定理条件参考 OpenStax《Calculus Volume 3》；本实验的场、参数化、独立边积分与演示由项目实现。</p><a href="https://openstax.org/books/calculus-volume-3/pages/6-4-greens-theorem" target="_blank" rel="noopener noreferrer">§6.4 Green’s theorem ↗</a><a href="https://openstax.org/books/calculus-volume-3/pages/6-7-stokes-theorem" target="_blank" rel="noopener noreferrer">§6.7 Stokes’ theorem ↗</a><a href="https://openstax.org/books/calculus-volume-3/pages/6-8-the-divergence-theorem" target="_blank" rel="noopener noreferrer">§6.8 Divergence theorem ↗</a><p>参考链接可选；离线时本页的完整推导仍然可读。</p></div></aside></div></section>`;
}
export const fieldQuizzes=[
  {q:'两个相邻方格的公共边上，向量场 F 并不为零。为什么这条边对总环流的贡献仍然为零？',options:['两个方格的速度在物理上相互消失。','同一条边被以相反定向积分，两项相加为零。','网格足够小时，每个积分都精确等于零。'],correct:1,reason:'抵消的是同一条边的两个有向积分。场不需要为零，两个单独积分也不需要为零；反向参数化使积分变号。'},
  {q:'把 n=3 改成 n=6，场、区域和定向都不变。本实验显示的精确总积分会怎样？',options:['不变；改变的是分块和配对数量。','变成原来的四倍，因为方格更多。','只能数值趋近，不能判断是否相等。'],correct:0,reason:'每块用解析积分，相加后得到同一完整区域的积分。积分可加性与内部定向抵消不依赖网格足够细。一般采样求积则另外存在离散误差，不能混为一谈。'},
  {q:'Gauss 公式的边界读数，和 Stokes 公式的边界读数分别是什么？',options:['二者都是空间曲线上的环流。','二者都是曲面上的 F 的通量。','Gauss 是闭合外壳的 F 通量；Stokes 是曲面边缘的 F 环流。'],correct:2,reason:'Gauss：三维体积中的散度 → 二维闭合外壳通量。Stokes：二维曲面上的旋度法向通量 → 一维边缘环流。嵌在三维空间里的曲面仍是二维对象。'},
  {q:'在 Stokes 中只反转 n，却保持边界 C 的绕行方向不变，一般还能直接沿用原来的等号吗？',options:['能，因为曲面没有改变。','不能，曲面法向与边界定向必须配套。','能，因为 curl F 也自动反向了。'],correct:1,reason:'反转 n 使曲面积分改号，而保持 C 不动不会改变线积分。需要同时反转边界定向（或显式加入负号）。curl F 是场的局部性质，不会因选择法向而自动反向。'},
  {q:'对本实验 a=0、b=1、c=0、L=2，标准定向下 Green 环流和 Gauss 净通量分别是多少？',options:['4 和 0。','0 和 4。','二者都是 4。'],correct:0,reason:'此时 curl F=(0,0,1)，正方形面积为 4，因此环流为 4；div F=0，因此立方体闭合外壳净通量为 0。有旋度并不意味着存在净流出。'},
  {q:'曲面隆起后，为什么不能把 (curl F)·n 在参数方格上的值直接乘 du dv 当成实际曲面积分？',options:['因为隆起的曲面不能使用 Stokes。','因为 n 不再是单位向量。','因为实际面积元 dS=‖rᵤ×rᵥ‖ du dv，必须一起变换。'],correct:2,reason:'单位法向 n 与面积伸缩因子配套。本例曲面越倾斜，单位实际面积上的旋度通量越小，同时面积元增大；乘积恰好是 b(1+cu) du dv。'},
  {q:'场 G=(−y/(x²+y²),x/(x²+y²)) 在单位圆上的环流是 2π，却在原点外旋度为零。这推翻了 Green 公式吗？',options:['是，直观抵消证明是错误的。','否，原点奇点使圆盘上的光滑性条件不满足；环域还要加上内边界。','否，因为单位圆不是闭曲线。'],correct:1,reason:'不能把场在原点随意补成零后使用定理。挖掉原点后，内边界的正向是顺时针，环流为 −2π；加上外边界才与环域的零旋度积分相等。'},
  {q:'图中看见内部网格的箭头两两消失，是否已经证明任意光滑场、任意曲边区域上的积分定理？',options:['是，网格图就是完整证明。','否，还要建立局部恒等式，并在一般区域论证分割、定向和必要的极限。','是，只要继续拖动到更多网格。'],correct:1,reason:'内部相消是精确的代数机制，但它不自动建立导数的区域积分与小块边界积分之间的关系。矩形、长方体、本实验参数曲面的推导已给出；一般情形需要完整的分析论证。'}
];
export function fieldQuiz(s) {
  return `<section id="panel-quiz" role="tabpanel" aria-labelledby="tab-quiz" class="field-experiment">${fieldJourney(s)}<div class="quiz-layout"><div class="quiz-heading"><span class="overline">CHECK THE CONNECTIONS</span><h2>记住等号，还要知道它连接什么。</h2><p>八个问题，检查抵消、维数、定向和条件。作答保留在当前会话内，不上传。</p></div><form id="field-quiz-form">${fieldQuizzes.map((q,i)=>`<fieldset class="card quiz-card"><legend><span class="question-no">${String(i+1).padStart(2,'0')}</span>${q.q}</legend><div class="quiz-options">${q.options.map((o,j)=>`<label class="quiz-option"><input required type="radio" name="field-question-${i}" value="${j}"><span class="choice-letter">${String.fromCharCode(65+j)}</span>${o}</label>`).join('')}</div><div id="field-feedback-${i}" class="quiz-feedback" hidden></div></fieldset>`).join('')}<div class="quiz-submit"><button class="button primary" type="submit">检查并展开解释</button><span id="field-quiz-result" role="status"></span><button class="text-button" type="button" data-field-action="quiz-reset">重新作答</button></div></form></div></section>`;
}
export function fieldHeader(s) {
  return `<div class="page-heading"><div><div class="breadcrumb">实验室 <span>/</span> 向量场 · 积分定理</div><div class="eyebrow">EXPERIMENT 03 <span>—</span> THE BOUNDARY PRINCIPLE</div><h1>内部的累积，边界的回声。</h1><p class="page-subtitle">从 Green 到 Gauss，再到 Stokes：一条连续的场论直觉学习路径。</p></div><div class="heading-actions"><button class="button subtle" data-action="reset">${icon('reset')}<span>重置</span></button><button class="button subtle" data-action="share">${icon('share')}<span>分享实验</span></button></div></div>${pageGuide('fields',{tab:s.tab})}<div class="workspace-tabs" role="tablist" aria-label="学习阶段">${[['explore','eye','动手探索'],['proof','book','定义与证明'],['quiz','quiz','检查理解']].map(([key,ic,label],i)=>`<button id="tab-${key}" role="tab" data-tab="${key}" aria-selected="${s.tab===key}" aria-controls="panel-${key}" tabindex="${s.tab===key?0:-1}">${icon(ic)}<span>${label}</span><small>0${i+1}</small></button>`).join('')}<span class="tabs-note">局部 → 累积 → 抵消 → 边界</span></div>`;
}

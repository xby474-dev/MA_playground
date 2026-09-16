const GUIDE_CONTENT = {
  limits: {
    title: '先知道要看什么，再开始靠近。',
    question: '只沿几条路径趋近原点，能不能说明多元极限存在？',
    steps: [
      '先观察直线路径，记下函数值怎样变化。',
      '切换到抛物线和竖直线，比较不同的靠近方式。',
      '缩小趋近尺度，查看函数值与收敛曲线，再进入证明。',
    ],
    observe: '看不同路径是否趋向同一个结果，也要分清原点函数值和路径极限。',
    takeaway: '多元极限要求所有允许路径都趋向同一个值。',
    warning: '有限条路径只能提供证据，不能代替对所有趋近方式的证明。',
    guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/MATHEMATICS.md',
    guideLabel: '查看极限定义与证明',
  },
  differentiability: {
    title: '先画出关系，再检查每一条箭头。',
    question: '偏导存在、连续、可微和偏导连续之间，哪些方向可以推出，哪些不能反推？',
    steps: [
      '先选一个函数，预测四个性质是否成立。',
      '点击绿色定理箭头，看它为什么成立。',
      '再换成反例，点击虚线箭头，检查逆推为什么失败。',
    ],
    observe: '节点描述当前函数，箭头描述一般命题；结合曲面、截面和归一化误差判断。',
    takeaway: '偏导存在不自动推出连续或可微；定理方向和反例方向必须分开理解。',
    warning: '误差趋于零还不够，不能把一个方向的好表现当成所有方向的结论。',
    guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/RELATIONS-GUIDE.md',
    guideLabel: '查看关系实验指南',
  },
  fields: {
    title: '先找到内部累积，再听见边界回声。',
    question: 'Green、Gauss、Stokes 为什么能把区域内部的局部变化与边界积分联系起来？',
    steps: [
      '选择一个定理，先观察一个简单向量场和区域。',
      '调整方向、分块或曲面形状，查看局部贡献如何配对。',
      '对照内部局部积分与边界账本，最后进入证明。',
    ],
    observe: '看公共边界如何反向抵消，方向改变时符号如何变化，以及旋度/散度与环流/通量的配对。',
    takeaway: '局部累积经过内部抵消，最终只留下外边界的整体效应。',
    warning: '有限网格是直觉模型；它不能单独替代定理所需的光滑性、定向和区域条件。',
    guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/FIELD-GUIDE.md',
    guideLabel: '查看场实验指南',
  },
  completeness: {
    map: { title: '先看见五条路，最后问同一个终点。', question: '上确界、单调极限、区间套、子列和 Cauchy 条件，为什么可以互相推出？', steps: ['先点击一条节点或箭头，认出它在等价环中的位置。', '从一次二分开始，观察同一个逼近构造怎样换一种语言。', '切换到 ℚ，再进入证明，检查“终点属于谁”。'], observe: '看构造目标、数系 K 与箭头方向；绿色箭头是蕴含，不是把五个命题混成一句话。', takeaway: '完备性的五种表述都在保证：满足条件的逼近不会在数系中缺一个终点。', warning: '一个构造成功不等于整个数系完备；ℚ 稠密也不等于它包含所有极限。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/COMPLETENESS-GUIDE.md', guideLabel: '查看完备性实验指南' },
    explore: { title: '沿同一条二分，换五种读法。', question: '同一组逼近数据，怎样分别读成上确界、序列、区间、子列和 Cauchy 结论？', steps: ['先选一个视角和目标，观察二分如何留下候选终点。', '拖动二分层数 n，比较 ℝ 与 ℚ 中的同一构造。', '打开精确账本，再用“下一视角”继续转换语言。'], observe: '看区间端点、误差尺度和候选终点是否仍属于 K；有限层数只是构造的截面。', takeaway: '五种语言描述的是同一个“逼近并保留终点”的结构。', warning: '有限 n 的小误差不能单独证明无限极限；空心目标也不代表数轴上有一段空白。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/COMPLETENESS-GUIDE.md', guideLabel: '查看完备性实验指南' },
    proof: { title: '把一条箭头走完，才知道等价不是口号。', question: '从一个完备性命题到下一个命题，真正用到了哪些条件？', steps: ['先读“允许使用”，不要提前借用终点。', '逐步点击证明步骤，记录每一步构造了什么。', '切换另一条边，再比较哪些条件发生了变化。'], observe: '看每条箭头的前提、构造对象和最后归还的终点；特别注意阿基米德条件与 K 内极限。', takeaway: '等价关系来自一圈具体的构造与回收，而不是五个定义的相似措辞。', warning: '反向箭头不能因为图上对称就省略；“相邻差趋零”也不等于 Cauchy。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/COMPLETENESS-GUIDE.md', guideLabel: '查看完备性证明指南' },
    challenge: { title: '最后把“有终点”判断权交给你。', question: '改变数系、条件或逼近方式后，原来的结论还成立吗？', steps: ['先独立提交每道判断，不急着看解析。', '对照反馈，定位是条件、对象还是终点出了问题。', '回到实验，用一次构造重新验证你的理由。'], observe: '看题目改变的是数系、序列条件还是结论对象；理由比选项本身更重要。', takeaway: '完备性不是“越来越近”四个字，而是明确条件下终点仍在当前数系。', warning: '不要把图形直觉、有限计算或单个反例的好表现扩大成一般定理。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/COMPLETENESS-GUIDE.md', guideLabel: '查看完备性实验指南' },
  },
  taylor: {
    grow: { title: '先让曲线从一个点一层一层长出来。', question: 'Taylor 多项式怎样把一个点的导数信息变成附近的局部模型？', steps: ['先固定函数和展开点，播放从 T₀ 到 Tₙ 的生长。', '拖动观察点 h，核对函数值、近似值与余项。', '打开系数表，再进入误差实验。'], observe: '看匹配的是函数值、斜率和更高阶导数；曲线重合只是结果，不是拟合散点。', takeaway: '每增加一阶，就多匹配一个局部信息；它给出的是带阶数的局部近似。', warning: '当前点看起来很像，不等于多项式恒等于函数，也不等于任意远处都可靠。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/TAYLOR-GUIDE.md', guideLabel: '查看 Taylor 实验指南' },
    error: { title: '把“像不像”拆成两个可检验的问题。', question: '固定阶数离开展开点，和固定观察点增加阶数，分别会发生什么？', steps: ['先固定 n 移动 h，观察局部模型离开 a 后的误差。', '再固定 x 增加 n，比较各阶近似的变化。', '阅读余项界，区分图上采样与可证明的保证。'], observe: '看两张误差图的横轴不同；底部显示下限不代表误差精确为零。', takeaway: '阶数、距离与函数的收敛性质共同决定近似质量。', warning: '增加阶数不保证每一步都更好；有限采样也不能代替误差估计。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/TAYLOR-GUIDE.md', guideLabel: '查看 Taylor 误差指南' },
    boundary: { title: '边界处，近似、收敛与相等必须分开。', question: '级数在哪些点收敛，以及它是否等于原函数，为什么是两个问题？', steps: ['先选择一个场景，观察展开点、收敛半径和观察点的位置。', '切换端点或越过边界，比较误差与收敛状态。', '再进入证明，检查条件，而不是只看曲线。'], observe: '看半径、端点和函数定义域；“部分和有极限”不自动等于原函数。', takeaway: '局部 Taylor 近似、级数收敛和函数展开相等是逐层加强的结论。', warning: '越过收敛半径、端点表现良好或图线重合，都不能直接推出全域恒等。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/TAYLOR-GUIDE.md', guideLabel: '查看 Taylor 边界指南' },
    proof: { title: '动画给线索，证明负责说明为什么。', question: '系数、余项和收敛半径分别由什么数学理由保证？', steps: ['先选择一条证明路线，查看它的前提。', '逐步阅读构造、估计和结论，记录每一步的对象。', '回到实验，用参数检验证明适用的范围。'], observe: '看证明使用的是导数公式、余项估计还是比值/几何级数；不要把数值读数当作证明。', takeaway: 'Taylor 展开不是一条绘图规则，而是导数信息与余项控制共同给出的定理。', warning: '一个正例不能证明一般命题；当前函数的漂亮曲线也不能替代条件检查。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/TAYLOR-GUIDE.md', guideLabel: '查看 Taylor 证明指南' },
    challenge: { title: '把局部近似的判断迁移到新问题。', question: '面对新的函数、阶数和观察点，你能判断近似保证到哪里吗？', steps: ['先独立选择答案，再说明你依赖的条件。', '查看解析反馈，区分局部、有限阶和无限展开。', '回到生长或边界实验，验证你的判断。'], observe: '重点看展开点、阶数、余项和收敛区间，而不是只看某一个数值。', takeaway: '真正理解 Taylor 展开，是知道它保证什么，也知道它没有保证什么。', warning: '不要把“误差很小”“曲线重合”或“所有导数为零”误读成恒等式。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/TAYLOR-GUIDE.md', guideLabel: '查看 Taylor 完整指南' },
  },
};

function resolveGuideContent(type, screen) {
  const content = GUIDE_CONTENT[type];
  if (content && !Array.isArray(content.steps)) return content[screen] ?? content.map ?? content.grow;
  return content;
}

function defaultTarget(type, tab, mode, screen) {
  if (type === 'completeness') return { map: '[data-cp-action="start"]', explore: '#cp-depth', proof: '[data-cp-proof-step="0"]', challenge: '#cp-quiz' }[screen] ?? '#cp-title';
  if (type === 'taylor') return { grow: '[data-ty-action="play"]', error: '#ty-h', boundary: '[data-ty-scenario="nonmonotone"]', proof: '[data-ty-proof="coefficients"]', challenge: '#ty-quiz' }[screen] ?? '#ty-title';
  if (type === 'relations') return '[data-r-stage="0"]';
  if (tab !== 'explore') return '#tab-explore';
  if (type === 'limits') return '[data-set="path"]';
  if (type === 'differentiability' && mode === 'classic') return '[data-set="model"]';
  return '[data-r-stage="0"]';
}

export function pageGuide(type, { tab = 'explore', mode = '', screen = '', target } = {}) {
  const content = resolveGuideContent(type, screen);
  if (!content) throw new RangeError(`Unknown page guide: ${type}`);
  const guideId = `page-guide-${type}${screen ? `-${screen}` : ''}`;
  const targetSelector = target ?? defaultTarget(type, tab, mode, screen);
  return `<section class="page-guide" data-guide="${type}" data-guide-target='${targetSelector}' aria-labelledby="${guideId}-title">
    <div class="page-guide-heading"><div><span class="overline">START HERE · 本页导览</span><h2 id="${guideId}-title">${content.title}</h2><p class="page-guide-question"><strong>本页要回答的问题</strong>${content.question}</p></div><button class="text-button page-guide-collapse" type="button" data-guide-action="collapse" aria-expanded="true" aria-controls="${guideId}-body">收起导览</button></div>
    <div id="${guideId}-body" class="page-guide-body">
      <div class="page-guide-columns"><div><h3>怎么开始</h3><ol>${content.steps.map(step => `<li>${step}</li>`).join('')}</ol></div><div><h3>重点观察</h3><p>${content.observe}</p><h3>本页结论</h3><p class="page-guide-takeaway">${content.takeaway}</p></div><div><h3>常见误区</h3><p class="page-guide-warning">${content.warning}</p></div></div>
      <div class="page-guide-actions"><button class="button primary" type="button" data-guide-action="start">开始第 1 步 →</button><a class="text-button" href="${content.guide}" target="_blank" rel="noopener noreferrer">${content.guideLabel} ↗</a></div>
    </div>
    <button class="text-button page-guide-expand" type="button" data-guide-action="expand" aria-expanded="false" aria-controls="${guideId}-body" hidden>重新打开本页导览 ↓</button>
  </section>`;
}

function storage() {
  try { return window.sessionStorage; } catch { return null; }
}

export function guideStorageKey({ type, lab, mode = '', tab = 'explore', screen = '' }) {
  return `ma-playground:guide:${type ?? lab}:${mode}:${tab}:${screen}`;
}

export function setGuideOpen(guide, open) {
  const body = guide.querySelector('.page-guide-body');
  const collapse = guide.querySelector('[data-guide-action="collapse"]');
  const expand = guide.querySelector('[data-guide-action="expand"]');
  if (!body || !collapse || !expand) return;
  body.hidden = !open;
  collapse.hidden = !open;
  expand.hidden = open;
  collapse.setAttribute('aria-expanded', String(open));
  expand.setAttribute('aria-expanded', String(open));
  guide.classList.toggle('is-collapsed', !open);
}

export function initializeGuide(root, key) {
  const guide = root.querySelector('.page-guide');
  if (!guide) return;
  let saved;
  try { saved = storage()?.getItem(key); } catch { saved = null; }
  setGuideOpen(guide, saved !== 'collapsed');
}

export function persistGuideState(key, open) {
  try { storage()?.setItem(key, open ? 'open' : 'collapsed'); } catch { /* private browsing can disable sessionStorage */ }
}

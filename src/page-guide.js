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
};

function defaultTarget(type, tab, mode) {
  if (type === 'relations') return '[data-r-stage="0"]';
  if (tab !== 'explore') return '#tab-explore';
  if (type === 'limits') return '[data-set="path"]';
  if (type === 'differentiability' && mode === 'classic') return '[data-set="model"]';
  return '[data-r-stage="0"]';
}

export function pageGuide(type, { tab = 'explore', mode = '', target } = {}) {
  const content = GUIDE_CONTENT[type];
  if (!content) throw new RangeError(`Unknown page guide: ${type}`);
  const guideId = `page-guide-${type}`;
  const targetSelector = target ?? defaultTarget(type, tab, mode);
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

import { uniformPage } from './uniform-content.js';
import { mountUniformLab } from './uniform-lab.js';
import { seriesPage } from './series-content.js';
import { mountSeriesLab } from './series-lab.js';
import { taylorPage } from './taylor-content.js';
import { mountTaylorLab } from './taylor-lab.js';
import { completenessPage } from './completeness-content.js';
import { mountCompletenessLab } from './completeness-lab.js';
import { relationsPage } from './relations-content.js';
import { mountRelationsLab } from './relations-lab.js';
import { fieldHeader, fieldExplore, fieldProof, fieldQuiz } from './field-content.js';
import { mountFieldLab } from './field-lab.js';
import { defaults, parseState, serializeState } from './state.js';
import { pathPoint, pathValue, pathLimit, directionPoint, remainder, normalizedError, worstError, format, limitRows, diffRows, radius, clamp } from './math.js';
import { header, explore, proof, quiz, footer, formulas, quizzes } from './content.js';
import { planeSVG, convergenceSVG, polarSVG, pathName, palette, SurfaceView } from './plots.js';
import { icon } from './icons.js';
import { initializeGuide, guideStorageKey, persistGuideState, setGuideOpen } from './page-guide.js';

let state = parseState(location.hash || '#lab='+(document.body.dataset.initialLab ?? 'limits'));
let uniformLab = null;
let seriesLab = null;
let taylorLab = null;
let completenessLab = null;
let fieldLab = null;
let relationsLab = null;
let surface = null, plotType = '', playing = false, frame = null, lastTick = 0, toastTimer;
const answers = { limits: {}, differentiability: {} };
const $ = id => document.getElementById(id);
const main = $('main');

function syncURL(push = false) {
  const url = serializeState(state);
  if (location.hash === url) return;
  history[push ? 'pushState' : 'replaceState'](null, '', url);
}
function toast(message) {
  const el = $('toast'); el.textContent = message; el.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 4200);
}
function currentGuideKey(s) {
  return guideStorageKey({
    type: s.mode === 'relations' ? 'differentiability' : s.lab,
    lab: s.lab,
    mode: s.mode,
    tab: s.tab,
    screen: s.mode === 'relations' || s.lab === 'completeness' || s.lab === 'taylor' || s.lab === 'series' || s.lab === 'uniform' ? s.screen : '',
  });
}
function render() {
  uniformLab?.destroy(); uniformLab = null;
  seriesLab?.destroy(); seriesLab = null;
  taylorLab?.destroy(); taylorLab = null;
  completenessLab?.destroy(); completenessLab = null;
  relationsLab?.destroy(); relationsLab = null;
  fieldLab?.destroy(); fieldLab = null;
  stopAnimation();
  surface?.destroy(); surface = null; plotType = '';
  main.classList.toggle('se-mode', state.lab === 'series');
  main.classList.toggle('uf-mode', state.lab === 'uniform');
  main.classList.toggle('ty-mode', state.lab === 'taylor');
  main.classList.toggle('cp-mode', state.lab === 'completeness');
  main.classList.toggle('field-mode', state.lab === 'fields');
  main.classList.toggle('rel-mode', state.mode === 'relations');
  main.innerHTML = state.lab === 'uniform' ? uniformPage(state) + footer : state.lab === 'series' ? seriesPage(state) + footer : state.lab === 'taylor' ? taylorPage(state) + footer : state.lab === 'completeness' ? completenessPage(state) + footer : state.mode === 'relations' ? relationsPage(state) + footer : state.lab === 'fields' ? fieldHeader(state) + ({explore:fieldExplore,proof:fieldProof,quiz:fieldQuiz}[state.tab])(state) + footer : header(state) + ({ explore, proof, quiz }[state.tab])(state) + footer;
  for (const lab of ['limits', 'differentiability', 'fields', 'completeness', 'taylor', 'series', 'uniform']) {
    const nav = $(`nav-${lab}`);
    if (state.lab === lab) nav.setAttribute('aria-current', 'page'); else nav.removeAttribute('aria-current');
  }
  document.title = `${state.lab === 'fields' ? '内部的累积，边界的回声' : state.lab === 'limits' ? '所有直线，都不够' : '偏导存在，也不够'} · MA Playground`;
  initializeGuide(main, currentGuideKey(state));
  if(state.lab === 'uniform') {
    document.title = '每个点，还是所有点 · MA Playground';
    uniformLab = mountUniformLab(main, () => state, (rebuild=false) => {syncURL(rebuild); if(rebuild) render();}, toast);
    return;
  }
  if(state.lab === 'series') {
    document.title = '不是谁更强，而是谁够用 · MA Playground';
    seriesLab = mountSeriesLab(main, () => state, (rebuild=false) => {syncURL(rebuild); if(rebuild) render();}, toast);
    return;
  }
  if(state.lab === 'taylor') {
    document.title = '从一个点，长出一条曲线 · MA Playground';
    taylorLab = mountTaylorLab(main, () => state, (rebuild=false) => {syncURL(rebuild); if(rebuild) render();}, toast);
    return;
  }
  if(state.lab === 'completeness') {
    document.title = '五种定理，同一个终点 · MA Playground';
    completenessLab = mountCompletenessLab(main, () => state, (rebuild=false) => {syncURL(rebuild); if(rebuild) render();}, toast);
    return;
  }
  if(state.mode === 'relations') {
    document.title = '四个性质，一张关系图 · MA Playground';
    relationsLab = mountRelationsLab(main, () => state, (rebuild=false) => {syncURL(rebuild); if(rebuild) render();}, toast);
    return;
  }
  if(state.lab === 'fields') {
    fieldLab = mountFieldLab(main, () => state, (rebuild=false) => {syncURL(rebuild); if(rebuild) render();}, toast);
    return;
  }
  if (state.tab === 'explore') updateDynamic();
  if (state.tab === 'quiz') {
    Object.entries(answers[state.lab]).forEach(([i, value]) => {
      const radio = main.querySelector(`input[name="question-${i}"][value="${value}"]`);
      if (radio) radio.checked = true;
    });
  }
}
function setText(id, value) { const el = $(id); if (el) el.textContent = value; }
function setHTML(id, value) { const el = $(id); if (el) el.innerHTML = value; }
const cell = (label,value,highlight=false) => `<div class="data-cell${highlight?' highlight':''}"><span class="data-label">${label}</span><span class="data-value">${value}</span></div>`;
function sliderValue(id, value, description) {
  const el = $(id); if (!el) return;
  el.value = value;
  el.style.setProperty('--fill', `${100*(value-Number(el.min))/(Number(el.max)-Number(el.min))}%`);
  el.setAttribute('aria-valuetext', description);
}
function updateDynamic() {
  if (state.tab !== 'explore') return;
  document.querySelectorAll('[data-set]').forEach(button => {
    const k = button.dataset.set, v = String(state[k]);
    button.setAttribute('aria-pressed', String(button.dataset.value === v));
  });
  const t = state.sign * 10 ** -state.q, rho = 10 ** -state.q;
  sliderValue('scale', state.q, `${state.lab === 'limits' ? '参数绝对值' : '位移长度'} ${rho.toPrecision(4)}`);
  setText('scale-value', format(rho));
  $('zoom').checked = state.zoom;
  if (state.lab === 'limits') {
    sliderValue('coefficient', state.k, `系数 ${state.k}`);
    const coefficient=$('coefficient');
    coefficient.disabled = state.path === 'vertical';
    coefficient.closest('.slider-block').style.opacity = coefficient.disabled ? '.45' : '1';
    setText('coefficient-value', state.path === 'vertical' ? '不适用' : format(state.k,2));
    setText('path-equation', pathName({path:state.path,k:state.k}));
    const p=pathPoint(state.path,state.k,t), value=pathValue(state.path,state.k,t);
    setHTML('live-data',cell('x',format(p.x))+cell('y',format(p.y))+cell('F(x, y)',format(value),true));
    setText('pin-count', `${state.pins.length}/4`);
    setHTML('pin-list',state.pins.map((p,i)=>`<div class="pin-item"><span class="pin-swatch" style="--series-color:${palette[i+1]}"></span><span>${pathName(p)}</span><span class="pin-limit">→ ${format(pathLimit(p.path,p.k))}</span><button data-action="unpin" data-index="${i}" aria-label="移除比较路径 ${pathName(p)}">×</button></div>`).join(''));
    setHTML('chart-legend',`<span class="legend-item"><i class="legend-line" style="--series-color:${palette[0]}"></i>当前 · ${pathName({path:state.path,k:state.k})}</span>`+state.pins.map((p,i)=>`<span class="legend-item"><i class="legend-line dashed" style="--series-color:${palette[i+1]}"></i>${pathName(p)}</span>`).join(''));
    const isCounter=state.path==='parabola'&&state.k!==0;
    $('observation').classList.toggle('counterexample',isCounter);
    let body;
    if(isCounter) body=`这条路径的极限不为 0（约 ${format(pathLimit(state.path,state.k))}）。`;
    else body='这条路径的极限是 0，但二元极限还没有得到确认。';
    let explanation;
    if(state.path==='parabola') explanation=`非原点处，F(t, kt²) = k/(1 + k²) ≈ ${format(pathLimit(state.path,state.k))}。这个值与 t 无关。`;
    else if(state.path==='vertical') explanation='竖直线 x = 0 不属于有限斜率族 y = kx；这里 F(0, t) 恒为 0。';
    else explanation=state.k===0?'沿 x 轴，F(t, 0) 恒为 0。试试抛物线，再检查不同路径是否一致。':'对固定 k ≠ 0，F(t, kt) = kt/(t² + k²) → 0。滑块只显示有限个 t；极限结论来自这个公式。';
    setHTML('observation',`${icon('info')}<div><span class="observation-label">ANALYTIC RESULT · 单条路径的解析结论</span><h3>${body}</h3><p>${explanation}</p><p>当前位移距离 ‖(x,y)‖ ≈ ${format(radius(p.x,p.y))}；|t| = ${format(rho)}。</p></div>`);
  } else {
    sliderValue('angle',state.angle,`${state.angle} 度`);
    setText('angle-value',`${state.angle}°`);
    document.querySelectorAll('[data-action="direction"]').forEach(b=>b.classList.toggle('active',Number(b.dataset.value)===state.angle));
    setHTML('function-box',formulas[state.model]+`<span>${state.model==='counter'?'分式只用于非原点；补定义 g(0, 0) = 0。':'在整个平面上定义；f(0, 0) = 0。'}</span>`);
    const raw=remainder(state.model,rho,state.angle),ratio=normalizedError(state.model,rho,state.angle);
    setHTML('live-data',cell('位移 ρ',format(rho))+cell('误差 |R|',format(raw),state.metric==='raw')+cell('比例 |R| / ρ',format(ratio),state.metric==='ratio'));
    setHTML('worst-error',`<span class="analytic-tag">精确公式，非采样</span><strong>最坏方向的归一化误差</strong><br>sup<sub>θ</sub> |R|/ρ = ${state.model==='smooth'?'ρ':'1/2'} ≈ ${format(worstError(state.model,rho))}`);
    setHTML('chart-legend',`<span class="legend-item"><i class="legend-line" style="--series-color:${palette[0]}"></i>光滑 f · ${state.metric==='raw'?'ρ²':'ρ'}</span><span class="legend-item"><i class="legend-line dashed" style="--series-color:${palette[1]}"></i>反例 g · ${state.metric==='raw'?'ρ|sin 2θ|/2':'|sin 2θ|/2'}</span>`);
    setText('chart-title',state.metric==='raw'?'两种误差都会变小，但这还不够。':'除以位移后，谁还在趋于零？');
    $('observation').classList.toggle('counterexample',state.model==='counter');
    let lead,explanation;
    if(state.metric==='raw') {
      lead='看到 |R| → 0，只说明函数值靠近了候选平面。';
      explanation='f 的误差是 ρ²；g 的误差至多为 ρ/2。两者的绝对误差都趋于 0。切换到归一化误差，才能检验可微性的关键条件。';
    } else if(state.model==='smooth') {
      lead='光滑函数：误差比例 = ρ，在所有方向上一起趋于 0。';
      explanation='这不是“只沿当前方向成立”。解析式 |R|/ρ = ρ 与 θ 无关；取 δ = ε 即可完成可微性证明。';
    } else if(state.angle%90===0) {
      lead='这个方向看起来很好，但它不能代表所有方向。';
      explanation='沿坐标轴，g 的归一化误差为 0；沿 45° 却恒为 1/2。旋转方向，或者切换到“方向扫描”。';
    } else {
      lead=`反例函数：当前方向的误差比例不随 ρ 变化（约 ${format(ratio)}）。`;
      explanation='|R|/ρ = |sin 2θ|/2 与 ρ 无关。缩小位移不能消除这个比例。沿 45° 恒为 1/2，已经足以否定可微性。';
    }
    const p=directionPoint(rho,state.angle);
    setHTML('observation',`${icon('info')}<div><span class="observation-label">ANALYTIC RESULT · 归一化误差的解析结论</span><h3>${lead}</h3><p>${explanation}</p><p>当前位移 (x, y) = (${format(p.x)}, ${format(p.y)})；ρ &gt; 0。</p></div>`);
  }
  updatePlot();
  setHTML('convergence-plot',convergenceSVG(state));
}
function updatePlot() {
  if (state.view === 'surface') {
    if(plotType!=='surface') {
      surface?.destroy();
      setHTML('main-plot','<canvas class="surface-canvas" id="surface" tabindex="0" aria-label="三维曲面。拖动或使用方向键旋转，Home 键重置视角。数值结果和数学结论在相邻文字中提供。">三维图形只是示意。请使用下方数值与解析结论。</canvas>');
      surface=new SurfaceView($('surface'),()=>state);plotType='surface';
    } else surface?.draw();
    setText('plot-hint','拖动 / 方向键旋转 · Home 重置');
  } else {
    surface?.destroy(); surface=null;plotType=state.view;
    setHTML('main-plot',state.view==='polar'?polarSVG(state):planeSVG(state));
    setText('plot-hint',state.view==='polar'?'径向长度表示误差，不是位移':'实线：当前路径 · 虚线：比较路径');
  }
  const camera=document.querySelector('[data-action="camera-reset"]');if(camera)camera.hidden=state.view!=='surface';
  const zoom=$('zoom');zoom.disabled=state.view==='polar';zoom.closest('label').style.opacity=zoom.disabled?'.4':'1';
}
function stopAnimation() {
  playing=false;if(frame!==null)cancelAnimationFrame(frame);frame=null;lastTick=0;
  const button=document.querySelector('[data-action="play"]');
  if(button){button.innerHTML=icon('play')+`<span>${state.lab==='limits'?'自动靠近':'自动靠近原点'}</span>`;button.setAttribute('aria-pressed','false');}
}
function toggleAnimation() {
  if(playing){stopAnimation();syncURL();return;}
  if(state.q>=3.999)state.q=0;
  playing=true;lastTick=0;
  const button=document.querySelector('[data-action="play"]');button.innerHTML=icon('pause')+'<span>暂停</span>';button.setAttribute('aria-pressed','true');
  function tick(now){
    if(!playing)return;
    if(!lastTick)lastTick=now;
    const dt=now-lastTick;
    if(dt>=85){state.q=clamp(state.q+dt/4200,0,4);lastTick=now;updateDynamic();syncURL();}
    if(state.q>=4){stopAnimation();toast('已到达最小采样尺度；有限采样不是极限证明。');return;}
    frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);
}
function changeTab(tab,push=true) {
  state.tab=tab;syncURL(push);render();window.scrollTo(0,0);$(`tab-${tab}`).focus({preventScroll:true});
}
async function share() {
  syncURL();const url=location.href;
  const local=['localhost','127.0.0.1'].includes(location.hostname)||location.protocol==='file:';
  try {
    if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(url);
    toast(local?'已复制本机链接；部署后才能分享给其他设备。':'已复制链接，打开即可复现当前实验。');
  } catch {
    $('share-url').value=url;
    $('share-warning').textContent=local?'当前为本机地址。公开部署后，链接才能供其他设备访问。':'浏览器未允许自动复制，请手动复制。';
    $('share-dialog').showModal();$('share-url').focus();$('share-url').select();
  }
}
function exportCSV() {
  let rows,columns,meta;
  if(state.lab==='limits') {
    rows=limitRows(state).map(r=>({...r,...Object.fromEntries(state.pins.map((p,i)=>[`comparison_${i+1}`,pathValue(p.path,p.k,r.t)]))}));
    columns=['q','t','x','y','radius','value',...state.pins.map((_,i)=>`comparison_${i+1}`)];
    meta=`path=${state.path}; k=${state.k}; sign=${state.sign}; comparisons=${JSON.stringify(state.pins)}`;
  } else {
    rows=diffRows(state);columns=Object.keys(rows[0]);meta=`angle=${state.angle} deg; both models included; candidate L=0`;
  }
  const data=`# MA Playground v1.0 - finite samples are not a proof\n# ${meta}\n${columns.join(',')}\n`+rows.map(r=>columns.map(c=>r[c]).join(',')).join('\n')+'\n';
  const blob=new Blob([data],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`ma-${state.lab}-${Date.now()}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已导出 101 个尺度的原始数值，包含参数与采样声明。');
}

// Delegated events keep handlers stable as panels switch.
document.addEventListener('click',event=>{
  // The skip target is not a hash route: preserve every experiment parameter.
  if(event.target.closest('.skip-link')){event.preventDefault();main.focus();main.scrollIntoView({block:'start'});return;}
  const button=event.target.closest('button');
  const guideAction=event.target.closest('[data-guide-action]');
  if(guideAction){
    const guide=guideAction.closest('.page-guide');
    if(!guide)return;
    const action=guideAction.dataset.guideAction;
    if(action==='collapse'||action==='expand'){
      const open=action==='expand';setGuideOpen(guide,open);persistGuideState(currentGuideKey(state),open);return;
    }
    if(action==='start'){
      const target=main.querySelector(guide.dataset.guideTarget);
      guide.classList.add('is-started');
      window.setTimeout(()=>guide.classList.remove('is-started'),900);
      if(target){target.scrollIntoView({block:'center',behavior:'smooth'});if(typeof target.focus==='function')target.focus({preventScroll:true});}
      return;
    }
  }
  const nav=event.target.closest('.lab-nav, .brand');
  if(nav){event.preventDefault();state=parseState(nav.getAttribute('href'));syncURL(true);render();window.scrollTo(0,0);return;}
  if(!button)return;
  if(button.dataset.tab){changeTab(button.dataset.tab);return;}
  if(button.dataset.set){
    stopAnimation();const key=button.dataset.set;state[key]=key==='sign'?Number(button.dataset.value):button.dataset.value;
    if(key==='path'&&state.path==='parabola'&&state.k===0)toast('k = 0 时抛物线退化为 x 轴；改变 k 才会看到不同路径。');
    updateDynamic();syncURL();return;
  }
  const action=button.dataset.action;
  switch(action){
    case 'reset': state=defaults(state.lab);syncURL();render();toast('已恢复这个实验的初始状态。');break;
    case 'play': toggleAnimation();break;
    case 'share': share();break;
    case 'export': exportCSV();break;
    case 'pin': {
      const p={path:state.path,k:state.path==='vertical'?0:state.k};
      if(state.pins.some(x=>x.path===p.path&&x.k===p.k)){toast('这条路径已经在比较列表中。');break;}
      if(state.pins.length>=4){toast('最多比较 4 条路径，请先移除一条。');break;}
      state.pins.push(p);updateDynamic();syncURL();toast('已保留这条路径。切换路径，观察曲线如何分离。');break;
    }
    case 'unpin':state.pins.splice(Number(button.dataset.index),1);updateDynamic();syncURL();break;
    case 'direction':stopAnimation();state.angle=Number(button.dataset.value);updateDynamic();syncURL();break;
    case 'challenge':
      stopAnimation();
      if(state.lab==='limits'){state.pins=[{path:'line',k:1}];state.path='parabola';state.k=1;state.q=1;state.view='plane';}
      else {state.model='counter';state.angle=45;state.q=.8;state.metric='raw';state.view='surface';}
      updateDynamic();syncURL();toast(state.lab==='limits'?'先观察两条路径，再把 |t| 缩小。':'现在显示绝对误差；再切换“归一化”，看结论如何变化。');break;
    case 'camera-reset':surface?.reset();break;
    case 'about':$('about-dialog').showModal();break;
    case 'close-dialog':button.closest('dialog').close();break;
    case 'quiz-reset':answers[state.lab]={};render();toast('已清空本实验的作答。');break;
  }
});
document.addEventListener('input',event=>{
  // Only the original two controllers own these delegated inputs.
  if(!['limits','differentiability'].includes(state.lab)||state.mode==='relations') return;
  const el=event.target;
  if(el.matches('input[type="radio"]')){answers[state.lab][el.name.replace('question-','')]=Number(el.value);return;}
  if(!['scale','coefficient','angle'].includes(el.id))return;
  stopAnimation();
  const key={scale:'q',coefficient:'k',angle:'angle'}[el.id];state[key]=Number(el.value);updateDynamic();syncURL();
});
document.addEventListener('change',event=>{
  if(event.target.id==='zoom'){state.zoom=event.target.checked;updateDynamic();syncURL();}
});
document.addEventListener('submit',event=>{
  if(event.target.id!=='quiz-form')return;event.preventDefault();let correct=0;
  const data=new FormData(event.target);
  quizzes[state.lab].forEach((q,i)=>{
    const value=Number(data.get(`question-${i}`));answers[state.lab][i]=value;
    const isCorrect=value===q.correct;if(isCorrect)correct++;
    const feedback=$(`feedback-${i}`);feedback.hidden=false;feedback.classList.toggle('correct',isCorrect);
    feedback.innerHTML=`<strong>${isCorrect?'✓ 理解正确':'再想一层'} · 正确答案 ${String.fromCharCode(65+q.correct)}</strong>${q.reason}`;
  });
  setText('quiz-summary',`${correct} / 3 正确。解释已显示在每道题下方。`);
  toast('逐题解释已展开。注意检查自己的理由，而不只是选项。');
});
document.addEventListener('keydown',event=>{
  if(!event.target.matches('[role="tab"]'))return;
  const order=['explore','proof','quiz'],i=order.indexOf(state.tab);
  const next={ArrowRight:(i+1)%3,ArrowLeft:(i+2)%3,Home:0,End:2}[event.key];
  if(next!==undefined){event.preventDefault();changeTab(order[next]);}
});
window.addEventListener('hashchange',()=>{state=parseState(location.hash);render();});
window.addEventListener('popstate',()=>{state=parseState(location.hash);render();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAnimation();syncURL();}});
// Native dialogs supply Escape handling, focus trapping and focus restoration.
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
render();

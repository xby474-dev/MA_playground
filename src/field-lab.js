import { STAGES, cancellationLedger, selectedPair, domainLocal, domainBoundary, domainBoundaryParts, cellData, labCSV } from './field-math.js';
import { stageInfo, phaseInfo, theoremEquation, fieldQuizzes } from './field-content.js';
import { fieldScene, holeSVG } from './field-plots.js';
import { icon } from './icons.js';
const fieldAnswers={};
export function fieldNumber(value) {
  if(!Number.isFinite(value))throw new Error('Non-finite field result');
  if(value===0||Object.is(value,-0))return '0';
  if(Math.abs(value)<1e-5)return value.toExponential(2).replace('e-','e−');
  return new Intl.NumberFormat('zh-CN',{maximumFractionDigits:5}).format(value).replaceAll('-','−');
}
const htmlNumber=value=>fieldNumber(value);
const signed=v=>v<0?`(${htmlNumber(v)})`:htmlNumber(v);
const nearZero=v=>Math.abs(v)<1e-11;
/** Mount-scoped listeners/animation; destroy is called on every app navigation. */
export function mountFieldLab(root,getState,commit,notify) {
  const abort=new AbortController(),options={signal:abort.signal};
  let raf=null,playing=false,lastTime=0,startTime=0;
  const $=id=>root.querySelector(`#${id}`);
  const text=(id,value)=>{const el=$(id);if(el)el.textContent=value;};
  const html=(id,value)=>{const el=$(id);if(el)el.innerHTML=value;};
  const stop=()=>{
    playing=false;if(raf!==null)cancelAnimationFrame(raf);raf=null;
    const b=root.querySelector('[data-field-action="play"]');
    if(b){b.innerHTML=icon('play')+' 播放抵消过程';b.setAttribute('aria-pressed','false');}
  };
  function orientationNote(s) {
    if(s.stage==='stokes')return s.orientation===1?'法向朝上，边界从上方看逆时针。反向时法向与边界同步改变。':'法向朝下，边界从上方看顺时针。旋度向量本身不改变。';
    if(['flux','gauss'].includes(s.stage))return s.orientation===1?'采用外单位法向。净流入为负值；法向箭头不代表实际流速。':'采用内单位法向；内部显示 −∫ div F，与标准外向结果相反。散度本身不改变。';
    return s.orientation===1?'采用逆时针绕行。内部面积以向上定向配套。':'改成顺时针绕行；左侧显示 −∬(Qₓ−Pᵧ)，不是声称旋度本身反向。';
  }
  function update() {
    const s=getState();if(s.tab!=='explore')return;
    html('field-scene',fieldScene(s));
    if(root.clientWidth<500 && s.stage!=='unify') { const svg=$('field-scene').querySelector('svg');svg.setAttribute('viewBox','160 28 440 394');svg.style.aspectRatio='440 / 394';svg.classList.add('compact-scene'); }
    if(s.stage==='unify') {
      html('field-summary-table',['green','flux','gauss','stokes'].map(key=>`<tr><th scope="row"><button data-field-stage="${key}">${stageInfo[key].short} ↗</button></th><td>${stageInfo[key].inside}</td><td>${stageInfo[key].outside}</td><td class="field-mono">${htmlNumber(domainLocal(s,key))}</td></tr>`).join(''));
      text('field-summary-params',`a = ${s.a}，b = ${s.b}，c = ${s.c}，L = ${s.L}，h = ${s.h}；${s.orientation===1?'标准':'反向'}定向。`);
      html('field-hole-scene',holeSVG(s.hole));
      html('field-hole-explanation',s.hole?'环域避开奇点。外边界逆时针得 2π，内边界顺时针得 −2π，所以<strong>总边界环流为 0</strong>，与区域内旋度积分相等。':'不能对整个圆盘直接使用 Green：G 在原点没有定义，不满足包含区域闭包的邻域上的 C¹ 条件。<strong>这不是定理的反例。</strong>');
      const b=root.querySelector('[data-field-action="hole"]');b.textContent=s.hole?'填回原点，检查条件':'挖去原点，保留内边界';b.setAttribute('aria-pressed',String(s.hole));return;
    }
    const info=stageInfo[s.stage],ledger=cancellationLedger(s),local=domainLocal(s),boundary=domainBoundary(s),pair=selectedPair(s,ledger);
    for(const key of ['a','b','c','n','L','h','slice','viewAngle','cancel']) {
      const el=$(`field-${key}`);if(!el)continue;
      if(key==='slice')el.max=s.n-1;
      el.value=s[key];el.setAttribute('aria-valuetext',key==='cancel'?`${Math.round(s.cancel*100)}%`:String(s[key]));
      text(`field-${key}-value`,key==='cancel'?`${Math.round(s.cancel*100)}%`:s[key]);
    }
    const cell=$('field-cell');cell.max=ledger.cellCount;cell.value=s.cell+1;text('field-cell-total',`/ ${ledger.cellCount}`);
    root.querySelectorAll('[data-field-phase]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.fieldPhase)===s.phase)));
    root.querySelectorAll('[data-field-orientation]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.fieldOrientation)===s.orientation)));
    text('field-orientation-note',orientationNote(s));
    text('field-scene-title',phaseInfo[s.phase][0]);
    const localDescriptions={green:'沿小格边缘累积切向分量，再除以小格面积。区域缩向一点时，这个平均环流密度才给出局部旋度。',flux:'把穿出小格的量减去穿入的量，再除以面积。区域缩向一点时，得到二维散度；它不是沿边绕行的量。',gauss:'把穿过六个面的净流出相加，再除以体积。体元缩向一点时，得到散度；不是向量 F 的长度。',stokes:'沿小曲面片的边缘读环流。相应局部量是旋度在单位法向上的分量；曲面面积元必须随弯曲一起改变。'};
    text('field-phase-description',s.phase===0?localDescriptions[s.stage]:phaseInfo[s.phase][2]);
    $('field-cancel-control').hidden=s.phase!==2;
    const changed=s.orientation===-1&&['green','gauss','flux'].includes(s.stage);
    text('field-inside-label',(changed?'− ':'')+info.inside);text('field-outside-label',info.outside+(s.orientation===-1?' · 反向':''));
    text('field-inside-value',htmlNumber(local));text('field-outside-value',htmlNumber(boundary));
    html('field-counts',`<span><b>${ledger.cellCount}</b> 个${info.object}</span><span><b>${ledger.pairs.length}</b> 对公共${info.boundary}</span><span><b>${ledger.outer.length}</b> ${s.stage==='gauss'?'个外壳面片':s.stage==='stokes'?'段外边缘':'段外边'}</span>`);
    html('field-current-formula',theoremEquation(s.stage,s.orientation));
    text('field-numeric-note',`解析式分别计算；显示已舍入。浮点差值 ${nearZero(local-boundary)?(local===boundary?'0':'< 10⁻¹¹'):fieldNumber(local-boundary)}。分块数改变不改变真实积分。${s.stage==='stokes'?' 这里积的是旋度的通量，不是原场 F 的通量。':''}`);
    if(pair) {
      const [first,second]=pair;
      html('field-pair',`<div><span class="overline">ONE SHARED ${s.stage==='gauss'?'FACE':'EDGE'} · 公共${info.boundary}</span><strong>第 ${first.cell+1} 块与第 ${second.cell+1} 块</strong><span class="field-pair-caption">同一${info.boundary}，相反定向；两侧分别积分</span></div><div class="field-pair-sum"><span>${signed(first.value)}</span><b>+</b><span>${signed(second.value)}</span><b>=</b><strong>${nearZero(first.value+second.value)?'0':htmlNumber(first.value+second.value)}</strong><small>解析上严格相消；浮点舍入另计</small></div>`);
    }
    $('field-pair').hidden=s.phase!==2;
    const data=cellData(s),sum=data.sides.reduce((v,x)=>v+x,0),labels=s.stage==='gauss'?['x− 面','x+ 面','y− 面','y+ 面','z− 面','z+ 面']:['下边','右边','上边','左边'];
    let description=s.stage==='gauss'?'密度是中心点的 div F；每块积分由全体积解析积分得到。':s.stage==='flux'?'密度是中心点的平面散度；法向读数与环流不是同一个量。':s.stage==='green'?'密度是中心点的 Qₓ−Pᵧ；有限小格的积分不被误称为点导数。':'中心密度 = curl F · 单位法向；参数化面积因子必须一起计入。';
    const o=s.orientation===-1?'（按当前定向带符号）':'';
    html('field-local-data',`<p class="field-note">${description}${o}</p><div class="field-local-values"><div><small>中心的${s.stage==='stokes'?'单位面积':''}密度</small><strong>${htmlNumber(data.density)}</strong></div><div><small>该块内部精确积分</small><strong>${htmlNumber(data.local)}</strong></div><div><small>该块边界积分之和</small><strong>${htmlNumber(sum)}</strong></div></div><div class="field-average-note">该块积分 ÷ ${s.stage==='gauss'?'体积':s.stage==='stokes'?'参数面积':'面积'}（${htmlNumber(data.measure)}）= <strong>${htmlNumber(data.local/data.measure)}</strong>。这是平均密度；本例${s.stage==='stokes'?'拉回参数平面后':''}的密度为线性函数，才恰好等于中心点${s.stage==='stokes'?'的参数密度':'值'}。一般场不应把有限块的均值直接当成点导数。</div>${s.stage==='stokes'?`<div class="field-area-note">中心处 ‖rᵤ×rᵥ‖ ≈ ${htmlNumber(data.jacobian)}；<strong>参数密度 = ${htmlNumber(data.pullback)}</strong>。中心处的面积因子不是整块的实际面积。</div>`:''}<details class="field-proof-details"><summary>展开这一块的各${info.boundary}贡献</summary><div class="field-side-values">${data.sides.map((v,i)=>`<div><span>${labels[i]}</span><strong>${htmlNumber(v)}</strong></div>`).join('')}</div><p class="field-note">每一项均在该块的诱导定向下独立积分。它们允许为负；净积分不是绝对值之和。</p></details>`);
  }
  function changed(rebuild=false) {commit(rebuild);if(!rebuild)update();}
  function selectStage(stage) {
    if(!STAGES.includes(stage))return;
    stop();const s=getState();s.stage=stage;s.phase=0;s.cancel=0;s.cell=Math.min(s.cell,s.n**(stage==='gauss'?3:2)-1);if(stage==='gauss')s.slice=Math.floor(s.cell/(s.n*s.n));changed(true);
    root.querySelector(`[data-field-stage="${stage}"]`)?.focus({preventScroll:true});
  }
  function toggleAnimation() {
    if(playing){stop();commit(false);return;}
    const s=getState();
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){s.phase=3;s.cancel=1;changed();notify('已显示外边界；减少动态效果偏好已启用。');return;}
    s.phase=2;s.cancel=0;playing=true;startTime=0;lastTime=0;update();
    const b=root.querySelector('[data-field-action="play"]');b.innerHTML=icon('pause')+' 暂停抵消';b.setAttribute('aria-pressed','true');
    function tick(now) {
      if(!playing)return;if(!startTime)startTime=now;
      if(now-lastTime>80) {s.cancel=Math.min(1,(now-startTime)/3800);lastTime=now;update();}
      if(s.cancel>=1){stop();s.phase=3;changed();return;}
      raf=requestAnimationFrame(tick);
    }
    raf=requestAnimationFrame(tick);
  }
  function download() {
    const s=getState(),data=labCSV(s),blob=new Blob([data],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`ma-field-${s.stage}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('已导出每块的内部积分、独立边界积分与浮点差值。');
  }
  root.addEventListener('click',e=> {
    const s=getState(),target=e.target;
    const stage=target.closest('[data-field-stage]');if(stage){selectStage(stage.dataset.fieldStage);return;}
    const phase=target.closest('[data-field-phase]');if(phase){stop();s.phase=Number(phase.dataset.fieldPhase);changed();return;}
    const cell=target.closest('[data-field-cell]');if(cell){s.cell=Number(cell.dataset.fieldCell);if(s.stage==='gauss')s.slice=Math.floor(s.cell/(s.n*s.n));changed();return;}
    const preset=target.closest('[data-field-preset]');if(preset){stop();[s.a,s.b]=({rotation:[0,1],source:[1,0],mixed:[.6,1]})[preset.dataset.fieldPreset];changed();return;}
    const orientation=target.closest('[data-field-orientation]');if(orientation){stop();s.orientation=Number(orientation.dataset.fieldOrientation);changed();return;}
    const button=target.closest('[data-field-action]');if(!button)return;
    switch(button.dataset.fieldAction) {
      case 'next-stage':selectStage(STAGES[(STAGES.indexOf(s.stage)+1)%STAGES.length]);break;
      case 'play':toggleAnimation();break;
      case 'export':download();break;
      case 'hole':s.hole=!s.hole;changed();break;
      case 'quiz-reset':for(const key of Object.keys(fieldAnswers))delete fieldAnswers[key];changed(true);break;
    }
  },options);
  root.addEventListener('input',e=> {
    const s=getState(),el=e.target;
    if(el.matches('input[type="radio"][name^="field-question-"]')){fieldAnswers[el.name]=Number(el.value);return;}
    if(el.id==='field-cell'){
      if(el.value.trim()===''||!Number.isFinite(Number(el.value)))return;
      s.cell=Math.max(0,Math.min(s.n**(s.stage==='gauss'?3:2)-1,Math.round(Number(el.value))-1));
      if(s.stage==='gauss')s.slice=Math.floor(s.cell/(s.n*s.n));changed();return;
    }
    const key=el.dataset.fieldInput;
    if(!['a','b','c','L','h','n','slice','cancel','viewAngle'].includes(key))return;
    stop();s[key]=Number(el.value);
    if(key==='n') {s.cell=Math.min(s.cell,s.n**(s.stage==='gauss'?3:2)-1);s.slice=s.stage==='gauss'?Math.floor(s.cell/(s.n*s.n)):Math.min(s.slice,s.n-1);}
    if(key==='slice')s.cell=s.cell%(s.n*s.n)+s.n*s.n*s.slice;
    changed();
  },options);
  root.addEventListener('change',e=>{if(e.target.id==='field-arrows'){getState().arrows=e.target.checked;changed();}},options);
  root.addEventListener('submit',e=> {
    if(e.target.id!=='field-quiz-form')return;e.preventDefault();const data=new FormData(e.target);let correct=0;
    fieldQuizzes.forEach((q,i)=>{
      const value=Number(data.get(`field-question-${i}`));fieldAnswers[`field-question-${i}`]=value;const good=value===q.correct;if(good)correct++;
      const el=$(`field-feedback-${i}`);el.hidden=false;el.classList.toggle('correct',good);el.innerHTML=`<strong>${good?'✓ 理解正确':'再想一层'} · 正确答案 ${String.fromCharCode(65+q.correct)}</strong>${q.reason}`;
    });text('field-quiz-result',`${correct} / ${fieldQuizzes.length} · 解释已展开`);
    $('field-quiz-result').scrollIntoView({block:'nearest'});
  },options);
  window.addEventListener('resize',()=>{if(getState().tab==='explore')update();},options);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();commit(false);}},options);
  if(getState().tab==='quiz')for(const [name,value] of Object.entries(fieldAnswers)){const el=root.querySelector(`input[name="${name}"][value="${value}"]`);if(el)el.checked=true;}
  update();
  return {destroy(){stop();abort.abort();}};
}

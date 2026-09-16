import { taylorDefaults, applyTaylorScenario } from './taylor-state.js';
import { tf, tValue, tGrowth, tCoefficients, tCoefficient, tDerivative, tJet, tCurvature, tError, tBound, tToleranceRadius, tConvergence, tNum, tCSV } from './taylor-math.js';
import { tMainSVG, tErrorSVG, tOrdersSVG, tSupportSVG, tGeometry } from './taylor-plots.js';
import { tyEscape, tyProofs, tyQuestions } from './taylor-content.js';
const quizMemory={answers:{},graded:false};
const eq=x=>`<div class="ty-equation">${tyEscape(x)}</div>`;
const clamp=(x,l,r)=>Math.min(r,Math.max(l,x));
export function mountTaylorLab(root,getState,changed,toast){
 const ac=new AbortController(),opts={signal:ac.signal};let playing=false,frame=null,last=0,paint=0,drag=null;
 const $=id=>root.querySelector('#'+id),text=(id,v)=>{if($(id))$(id).textContent=v;},html=(id,v)=>{if($(id))$(id).innerHTML=v;};
 function slider(id,value,label){const el=$(id);if(!el)return;el.value=value;el.style.setProperty('--fill',`${100*(value-Number(el.min))/(Number(el.max)-Number(el.min)||1)}%`);el.setAttribute('aria-valuetext',label);}
 function stop(){playing=false;if(frame!==null)cancelAnimationFrame(frame);frame=null;last=0;paint=0;const b=root.querySelector('[data-ty-action="play"]');if(b){b.setAttribute('aria-pressed','false');b.textContent=getState().p>0&&getState().p<getState().n?'▶ 继续生长':'▶ 从 0 逐层生长';}}
 function rebuild(focus=true){stop();changed(true);if(focus){root.querySelector('#ty-title')?.focus({preventScroll:true});window.scrollTo(0,0);}}
 function grade(){let score=0;for(const q of tyQuestions){const value=quizMemory.answers['ty-'+q.id],correct=Number(value)===q.correct&&value!==undefined;if(correct)score++;const el=$('ty-feedback-'+q.id);el.hidden=false;el.classList.toggle('correct',correct);el.textContent=(correct?'✓ 判断正确。':'再检查一步。正确答案 '+String.fromCharCode(65+q.correct)+'。')+q.reason;}text('ty-quiz-score',`${score} / ${tyQuestions.length} 正确。请检查理由，而不仅是选项。`);}
 function update(){
  const s=getState(),g=tGrowth(s.p),compact=innerWidth<700;
  if(s.screen==='proof'){const p=tyProofs[s.proof],step=p.steps[s.step];html('ty-proof-current',`<span class="eyebrow">STEP 0${s.step+1} / 04</span><h3>${step[0]}</h3><p>${tyEscape(step[1])}</p>${eq(step[2])}`);root.querySelectorAll('[data-ty-step]').forEach(b=>b.setAttribute('aria-current',Number(b.dataset.tyStep)===s.step?'step':'false'));root.querySelector('[data-ty-action="proof-prev"]').disabled=s.step===0;root.querySelector('[data-ty-action="proof-next"]').disabled=s.step===3;return;}
  if(s.screen==='challenge'){for(const [name,value] of Object.entries(quizMemory.answers)){const radio=root.querySelector(`input[name="${name}"][value="${value}"]`);if(radio)radio.checked=true;}if(quizMemory.graded)grade();return;}
  for(const [id,value,label] of [['ty-a',s.a,`展开点 ${s.a}`],['ty-n',s.n,`目标 ${s.n} 阶`],['ty-h',s.h,`相对位移 ${s.h}，观察点 ${s.a+s.h}`],['ty-span',s.span,`窗口半宽 ${s.span}`],['ty-epsilon',s.epsilon,`容许误差 10 的负 ${s.epsilon} 次方`],['ty-progress',s.p,`生长 ${tNum(s.p)}，已完成 ${g.m} 阶`]]){if($(id)){if(id==='ty-progress')$(id).max=s.n;if(id==='ty-h'){$(id).min=-s.span;$(id).max=s.span;}slider(id,value,label);text(id+'-value',id==='ty-epsilon'?`10⁻${s.epsilon}`:tNum(value));}}
  $('ty-a').disabled=s.fn==='flat';text('ty-probe-position',`a=${tNum(s.a)}  +  h=${tNum(s.h)}  →  x=${tNum(s.a+s.h)}`);
  html('ty-main-plot',tMainSVG(s,compact,drag?.viewport));
  text('ty-curve-name',g.complete?`T${g.m}`:`Q · ${Math.round(g.lambda*100)}%`);
  const play=root.querySelector('[data-ty-action="play"]');play.disabled=s.n===0;if(!playing)play.textContent=s.p>0&&s.p<s.n?'▶ 继续生长':'▶ 从 0 逐层生长';
  text('ty-animation-status',g.complete?`当前 T${g.m} · 目标 T${s.n}`:`第 ${g.k} 项加入 ${Math.round(g.lambda*100)}% · 过渡曲线 Q`);
  root.querySelector('[data-ty-action="back"]').disabled=s.p===0;root.querySelector('[data-ty-action="next"]').disabled=s.p>=s.n;
  html('ty-layer-rail',Array.from({length:s.n+1},(_,k)=>`<button data-ty-layer="${k}" class="${k<=g.m?'complete ':''}${k===g.k?'current':''}" aria-label="第 ${k} 阶，${k===0?'函数值':k===1?'斜率':k===2?'二阶弯曲':'高阶信息'}" aria-pressed="${s.p===k}"><small>${k===0?'VALUE':k===1?'SLOPE':k===2?'BEND':'ORDER'}</small><strong>${k} 阶</strong><span>${k===0?'函数值':k===1?'斜率':k===2?'二阶弯曲':`${k} 阶导数`}</span></button>`).join(''));
  const x=s.a+s.h,e=tError(s.fn,s.a,s.p,x),curve=g.complete?`T${g.m}(x)`:'Q(x)';
  html('ty-live',[[`f(x) · 原函数`,e.valid?tNum(e.y):'未定义'],[curve,tNum(e.poly)],[g.complete?`R${g.m} = f − T${g.m}`:'f − Q',e.valid?tNum(e.error):'不适用'],['绝对误差',e.valid?(e.nearRoundoff?'接近浮点分辨率':tNum(e.absolute)):'不适用']].map(([k,v])=>`<div><small>${k}</small><strong>${v}</strong></div>`).join(''));
  let lead,body;
  if(!e.valid){lead='原函数在观察点无定义，不把缺口补成 0。';body='有限多项式在这个点仍能取值，但没有 f(x) 可供比较，也不能把误差记为零。';}
  else if(!g.complete){lead=`现在是 T${g.m} + ${tNum(g.lambda,3)} × 第 ${g.k} 项。`;body=`前 ${g.m+1} 层局部信息仍保持匹配。过渡曲线一般还不是 T${g.k}；它的误差不直接使用 T${g.k} 的余项界。${tCoefficient(s.fn,s.a,g.k)===0?'这一项恰好为零，过渡曲线不会改变。':''}`;}
  else if(s.fn==='flat'){lead='每一阶都是 0，但原函数并不恒为 0。';body=x===0?'在展开点，函数值精确相同。把观察点移开，再增加阶数。':'对任何固定 x≠0，余项始终等于 exp(−1/x²)>0。与此同时，固定 n 让 x→0 时，这个余项又比 |x|ⁿ 更小。';}
  else if(g.k>0&&tCoefficient(s.fn,s.a,g.k)===0){lead=`第 ${g.k} 项恰好为零，所以 T${g.k}=T${g.k-1}。`;body='这不是动画失效：本例这一阶的导数本来已经匹配。“升阶”不意味着一定加入非零项。';}
  else{lead=g.complete&&g.k===0?'先放下一条水平线，只匹配 f(a)。':`已经匹配 a 处的 0 到 ${g.m} 阶导数。`;body='这保证展开点附近的局部信息一致，不保证每个远处的观察点都更准确。移动 h，再对照误差。';}
  if(e.nearRoundoff)body+=' 当前误差小到接近浮点运算分辨率；这个读数不能证明函数与多项式相等。';
  html('ty-observation',`<span class="eyebrow">${g.complete?'INTERPRET THE RESULT':'TRANSITION, NOT A TAYLOR POLYNOMIAL'}</span><strong>${lead}</strong><p>${body}</p>`);
  if(s.screen==='grow'){
   const k=g.k,c=tCoefficient(s.fn,s.a,k),term=c*s.h**k,lambda=g.complete?1:g.lambda;
   html('ty-current-term',eq(k===0?'T₀(x)=f(a)':`${g.complete?'T'+k:'Q'}(x)=T${k-1}(x)+${g.complete?'':tNum(g.lambda)+' × '}[ f⁽${k}⁾(a) / ${k}! ](x−a)^${k}`)+`<p>${k===0?'把函数值复制到整个水平线。':k===1?'新项在 a 的值为零，只修正斜率。':k===2?'保留函数值和斜率，再修正二阶弯曲。':'保留所有低阶信息，再修正这一阶的导数。'}</p>${c===0?'<span class="ty-zero-note">本项系数为 0 · 不需要额外修正</span>':''}`);
   html('ty-term-contribution',`<small>在观察点 x=${tNum(x)}，这一项贡献了多少？</small><div class="ty-term-numbers"><div><span>解析导数</span><strong>${tNum(tDerivative(s.fn,s.a,k))}</strong></div><i>÷ ${k}!</i><div><span>系数 c${k}</span><strong>${tNum(c)}</strong></div><i>× h${k?'^'+k:''}</i><div><span>完整项</span><strong>${tNum(term)}</strong></div></div><div class="ty-term-meter"><i style="width:${lambda*100}%"></i></div><p>${g.complete?'完整加入':'只加入 '+Math.round(lambda*100)+'%'} · 当前贡献 ${tNum(lambda*term)}${k===0?'（常数项）':''}</p>`);
   const jet=tJet(s.fn,s.a,s.p,Math.min(14,Math.max(4,g.k+2)));
   html('ty-jet-table',`<table><caption>展开点 a=${tNum(s.a)} 的解析导数对照；数值仅作显示。</caption><thead><tr><th>局部信息</th><th>f⁽ʲ⁾(a)</th><th>${g.complete?'T'+g.m:'Q'}⁽ʲ⁾(a)</th><th>为什么相同 / 不同？</th></tr></thead><tbody>${jet.map(r=>`<tr class="${r.guaranteed?'ty-guaranteed':r.pending?'ty-pending':''}"><td>${r.j===0?'0 · 函数值':r.j===1?'1 · 斜率':r.j===2?'2 · 二阶弯曲':r.j+' · 高阶局部信息'}</td><td>${tNum(r.original)}</td><td>${tNum(r.approximation)}</td><td>${r.guaranteed?'✓ 由构造保证':r.pending?(r.equal?'零项，本来已相等':'◐ 这一层正在修正'):r.equal?'本例恰好相等，不是已加到此阶':'尚未要求匹配'}</td></tr>`).join('')}</tbody></table>`);
   const curvature=tCurvature(s.fn,s.a,s.p);html('ty-curvature',`<strong>二阶导数 ≠ 曲率本身。</strong><span>κ=|f″|/(1+f′²)³ᐟ²；在 a 处：原函数 κ≈${tNum(curvature.original)}，当前曲线 κ≈${tNum(curvature.polynomial)}。${g.m>=2?'一、二阶已同时匹配，因此曲率也匹配。':'匹配到二阶后，一、二阶信息一起保证曲率一致。'}</span>`);
   const cs=tCoefficients(s.fn,s.a,s.n);html('ty-polynomial-text',`T${s.n}(a+h) ≈ ${cs.map((v,j)=>`(${tNum(v,5)})${j?'h^'+j:''}`).join(' + ')}`);
   html('ty-coefficients',`<table><thead><tr><th>k</th><th>f⁽ᵏ⁾(a)</th><th>k!</th><th>cₖ=f⁽ᵏ⁾(a)/k!</th></tr></thead><tbody>${cs.map((v,j)=>`<tr><td>${j}</td><td>${tNum(tDerivative(s.fn,s.a,j))}</td><td>${j}!</td><td>${tNum(v,6)}</td></tr>`).join('')}</tbody></table>`);
  }else{
   html('ty-error-plot',tErrorSVG(s,compact));html('ty-order-plot',tOrdersSVG(s,compact));
   if(!g.complete){html('ty-bound','<p>正在显示过渡曲线 Q。完整 Tₖ 的余项界不能直接套在 Q 上；点击整数层数，或等待这一项加入完毕。</p>');html('ty-tolerance','<p>完成当前项后，再检查整段误差的解析充分界。</p>');}
   else{
    const bound=tBound(s.fn,s.a,g.m,x);
    html('ty-bound',bound.valid?eq(bound.formula)+`<p>${bound.kind==='lagrange'?`M≈${tNum(bound.M)}，所得上界约为 <strong>${tNum(bound.bound)}</strong>。`:`本例精确余项的数值约为 ${tNum(bound.bound)}。`}${bound.reason}</p><p class="ty-small">显示的是公式的浮点估值，不是区间算术认证。界偏大，不等于实际误差大。</p>`:`<strong class="ty-warning-text">这里不能调用这个区间上的余项界。</strong><p>${bound.reason}</p>`);
    const certificate=tToleranceRadius(s.fn,s.a,g.m,10**(-s.epsilon),s.span);
    html('ty-tolerance',certificate?`<span class="eyebrow">FOR AN ENTIRE NEIGHBORHOOD</span><h3>不只管住几个采样点。</h3>${eq(`|x−a| ≤ ${tNum(certificate.d,8)}`)}<p>在这个二进半径的<strong>整段区间</strong>内，解析充分上界的估值约为 ${tNum(certificate.bound)}，小于 ε=10⁻${s.epsilon}。</p><p class="ty-small">半径从 2 的整数次幂中保守选择，不是最大可用半径，也不是收敛半径。公式推导在证明页。</p>`:'<p>当前显示尺度内未选到足够小的候选半径。可降低阶数观察困难，再检查解析条件。</p>');
   }
  }
  if(s.screen==='boundary'){
   const cv=tConvergence(s.fn,s.a,x);html('ty-support',tSupportSVG(s));
   html('ty-convergence',`<span class="ty-domain-badge ${cv.equal?'':'warn'}">${s.fn==='flat'?'Taylor 级数半径 ∞ · 仅原点与 f 相等':cv.R===Infinity?'收敛半径 ∞':`收敛半径 R=${tNum(cv.R)} · |x−a|=${tNum(Math.abs(s.h))}`}</span><h3>${cv.title}</h3><p>${cv.explanation}</p>${s.fn==='exp'&&s.a===0&&s.h===-2?eq('|e⁻²−T₀(−2)|=1−e⁻² < 1+e⁻²=|e⁻²−T₁(−2)|'):''}${s.fn==='reciprocal'?eq('Rₙ(x)=[(x−a)/(1−a)]ⁿ⁺¹/(1−x)，x≠1；此恒等式不要求级数收敛。'):''}<p class="ty-small">区间结论来自解析证明。绿色区间说的是 n→∞ 后相等；有限阶可能仍有明显误差。</p>`);
  }
 }
 function tick(now){if(!playing)return;if(!last){last=now;paint=now;}const dt=now-last;last=now;const s=getState(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){if(now-paint>=950){s.p=Math.min(s.n,Math.floor(s.p)+1);paint=now;update();changed(false);}}
  else{s.p=Math.min(s.n,s.p+dt/1200);if(now-paint>=75||s.p>=s.n){paint=now;update();changed(false);}}
  if(s.p>=s.n){s.p=s.n;stop();update();changed(false);toast(`已完成 T${s.n}。匹配局部信息，不等于在所有 x 处都准确。`);return;}frame=requestAnimationFrame(tick);
 }
 function setOrder(n){stop();const s=getState();s.n=clamp(Math.round(n),0,12);s.p=s.n;update();changed(false);}
 root.addEventListener('click',event=>{
  const b=event.target.closest('button,[data-ty-order]');if(!b)return;const s=getState();
  if(b.dataset.tyScreen){s.screen=b.dataset.tyScreen;rebuild();return;}
  if(b.dataset.tyProof){s.proof=b.dataset.tyProof;s.screen='proof';s.step=0;rebuild();return;}
  if(b.dataset.tyScenario){applyTaylorScenario(s,b.dataset.tyScenario);rebuild();return;}
  if(b.dataset.tyStep!==undefined){s.step=Number(b.dataset.tyStep);update();changed(false);return;}
  if(b.dataset.tyLayer!==undefined){stop();s.p=Number(b.dataset.tyLayer);update();changed(false);return;}
  if(b.dataset.tyOrder!==undefined){setOrder(Number(b.dataset.tyOrder));return;}
  switch(b.dataset.tyAction){
   case 'reset':Object.assign(s,taylorDefaults());quizMemory.answers={};quizMemory.graded=false;rebuild();toast('已恢复 Taylor 实验与判断题。');break;
   case 'play':if(playing){stop();changed(false);}else if(s.n>0){if(s.p>=s.n)s.p=0;playing=true;last=0;paint=0;b.textContent='Ⅱ 暂停生长';b.setAttribute('aria-pressed','true');update();changed(false);frame=requestAnimationFrame(tick);}break;
   case 'back':stop();s.p=Math.max(0,Math.ceil(s.p)-1);update();changed(false);break;
   case 'next':stop();s.p=Math.min(s.n,Math.floor(s.p)+1);update();changed(false);break;
   case 'proof-prev':case 'proof-next':s.step=clamp(s.step+(b.dataset.tyAction==='proof-next'?1:-1),0,3);update();changed(false);break;
   case 'export':{const blob=new Blob([tCSV(s)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`ma-taylor-${s.fn}-a${s.a}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已导出完整 T₀ 到 T₁₂；不把动画过渡曲线当作完整阶数。');break;}
   case 'quiz-reset':quizMemory.answers={};quizMemory.graded=false;rebuild(false);break;
  }
 },opts);
 root.addEventListener('input',e=>{
  const key={'ty-a':'a','ty-n':'n','ty-h':'h','ty-span':'span','ty-epsilon':'epsilon','ty-progress':'p'}[e.target.id];if(!key)return;stop();const s=getState();s[key]=Number(e.target.value);if(key==='n')s.p=s.n;if(key==='span')s.h=clamp(s.h,-s.span,s.span);update();changed(false);
 },opts);
 root.addEventListener('change',e=>{const s=getState();if(e.target.id==='ty-function'){stop();s.fn=e.target.value;s.a=clamp(s.a,...tf(s.fn).range);rebuild(false);$('ty-function')?.focus({preventScroll:true});}else if(e.target.id==='ty-ghost'){s.ghost=e.target.checked;update();changed(false);}else if(e.target.matches('#ty-quiz input')){quizMemory.answers[e.target.name]=e.target.value;quizMemory.graded=false;root.querySelectorAll('.ty-feedback').forEach(el=>el.hidden=true);text('ty-quiz-score','');}},opts);
 root.addEventListener('submit',e=>{if(e.target.id!=='ty-quiz')return;e.preventDefault();quizMemory.answers=Object.fromEntries(new FormData(e.target));quizMemory.graded=true;grade();},opts);
 root.addEventListener('keydown',e=>{
  if(e.target.matches('[data-ty-order]')&&['Enter',' '].includes(e.key)){e.preventDefault();setOrder(Number(e.target.dataset.tyOrder));return;}
  if(!['ty-a-handle','ty-x-handle'].includes(e.target.id)||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  e.preventDefault();stop();const s=getState(),id=e.target.id,key=id==='ty-a-handle'?'a':'h',range=key==='a'?tf(s.fn).range:[-s.span,s.span];if(s.fn==='flat'&&key==='a')return;s[key]=e.key==='Home'?0:e.key==='End'?range[1]:clamp(s[key]+(e.key==='ArrowRight'?1:-1)*(e.shiftKey?.1:.01),...range);update();changed(false);$(id)?.focus({preventScroll:true});
 },opts);
 root.addEventListener('pointerdown',e=>{const handle=e.target.closest('#ty-a-handle,#ty-x-handle');if(!handle)return;const s=getState();if(handle.id==='ty-a-handle'&&s.fn==='flat')return;e.preventDefault();stop();const svg=handle.closest('svg'),g=tGeometry(s,innerWidth<700),rect=svg.getBoundingClientRect();drag={kind:handle.id==='ty-a-handle'?'a':'h',viewport:{lo:g.lo,hi:g.hi},g,rect,id:e.pointerId};root.setPointerCapture?.(e.pointerId);},opts);
 root.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const s=getState(),{g,rect}=drag,px=(e.clientX-rect.left)/rect.width*g.W,x=g.lo+(px-g.r.l)/(g.r.r-g.r.l)*(g.hi-g.lo);s[drag.kind]=drag.kind==='a'?clamp(Number(x.toFixed(3)),...tf(s.fn).range):clamp(Number((x-s.a).toFixed(3)),-s.span,s.span);update();changed(false);},opts);
 function endDrag(){if(drag){drag=null;update();changed(false);}}
 root.addEventListener('pointerup',endDrag,opts);root.addEventListener('pointercancel',endDrag,opts);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();changed(false);}},opts);window.addEventListener('resize',()=>{drag=null;update();},opts);
 update();return {destroy(){stop();drag=null;ac.abort();}};
}

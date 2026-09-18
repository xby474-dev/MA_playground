import { lmMaps, lmOuters, lmF, lmJ, lmNorm, lmScale, lmMV, lmRotation, lmUnit, lmDot, lmSub, lmAdd, lmLocal, lmChain, lmBasis, lmMVT, lmNumber, lmVector, lmDet, lmCSV } from './linear-math.js';
import { linearDefaults, lmSteps, lmSetLength, lmChooseColumn, lmLimitH } from './linear-state.js';
import { lmProofs, lmQuestions, lmEscape } from './linear-content.js';
import { lmInputSVG, lmOutputSVG, lmErrorSVG, lmChainSVG, lmCurveSVG, lmCompassSVG, lmShadowSVG } from './linear-plots.js';
import { icon } from './icons.js';
const draft={};let scored=false;
const near=(a,b)=>Math.abs(a-b)<1e-8;
function metric(label,value,note=''){return `<div><small>${lmEscape(label)}</small><strong>${lmEscape(value)}</strong>${note?`<span>${lmEscape(note)}</span>`:''}</div>`;}
function smallMatrix(A,name){return `<div class="lm-small-matrix"><span>${lmEscape(name)}</span><div>${A.map(row=>row.map(n=>`<b>${lmNumber(n,3)}</b>`).join('')).join('')}</div><small>2 × 2</small></div>`;}
export function mountLinearLab(root,getState,changed,toast){
 const abort=new AbortController(),signal=abort.signal;let raf=null,playing=false,start=0,last=0,initialQ=0,flow=0,drag=null,destroyed=false;
 const $=id=>root.querySelector('#'+id),text=(id,t)=>{const e=$(id);if(e)e.textContent=t;},html=(id,v)=>{const e=$(id);if(!e)return;const active=document.activeElement,focus=active&&e.contains(active)?active.id:null;e.innerHTML=v;if(focus)$(focus)?.focus({preventScroll:true});};
 function slider(id,v,label){const e=$(id);if(!e)return;e.value=v;e.style.setProperty('--fill',`${100*(Number(e.value)-Number(e.min))/(Number(e.max)-Number(e.min))}%`);e.setAttribute('aria-valuetext',label);text(id+'-value',label);}
 function statePoints(){const s=getState();return {s,p:[s.px,s.py],h:[s.hx,s.hy],y:[s.yx,s.yy]};}
 function stop(sync=false){playing=false;if(raf!==null)cancelAnimationFrame(raf);raf=null;last=0;const b=root.querySelector('[data-lm-action="play"]');if(b){b.setAttribute('aria-pressed','false');b.innerHTML=icon('play')+' '+(getState().step==='projection'?'沿线段走':getState().step==='chain'?'播放两次传递':'自动缩小位移');}if(sync)changed();}
 function navigate(screen,step){stop();const s=getState();if(screen)s.screen=screen;if(step){s.step=step;s.proofStep=0;}changed(true);}
 function matrix(){const {s,p,h}=statePoints(),B=lmBasis(s.map,p,h,s.step==='columns'?s.basis:0),A=B.matrix,physical=lmMV(B.A,h),r0=lmNorm(h),expected=s.column?lmMV(B.B,s.column===1?[1,0]:[0,1]):[0,0],col=s.column&&r0>0&&lmNorm(lmSub(lmScale(h,1/r0),expected))<1e-6?s.column:0;
  html('lm-matrix',`<div class="lm-matrix-label">${s.step==='columns'&&s.basis!==0?'[DF(p)] 的新输入基表示 = JF(p)B':'标准基：JF(p) = [ ∂₁F　∂₂F ]'}</div><div class="lm-click-matrix"><div class="lm-row-labels"><span>输出 1</span><span>输出 2</span></div><div class="lm-brackets">${[0,1].map(j=>`<button id="lm-col-${j+1}" data-lm-column="${j+1}" aria-pressed="${col===j+1}" aria-label="选择第 ${j+1} 列，对应输入方向 ${j+1}"><b>${lmNumber(A[0][j])}</b><b>${lmNumber(A[1][j])}</b><small>第 ${j+1} 列 ↗</small></button>`).join('')}</div><span class="lm-matrix-size">2 个输出<br>×<br>2 个输入</span></div>`);
  const r=lmNorm(h),d=r?lmScale(h,1/r):[0,0],unitCoords=lmMV([[B.B[0][0],B.B[1][0]],[B.B[0][1],B.B[1][1]]],d),baseName=s.step==='columns'&&s.basis!==0?'b':'e';let read;
  if(col){const column=[A[0][col-1],A[1][col-1]],truth=r?lmScale(lmLocal(s.map,p,h).truth,1/r):null;read=`<strong>只沿 ${baseName}${col} 方向走：h = ρ${baseName}${col}</strong><div class="lm-equation">DF(p)${baseName}${col} = ${lmVector(column)}<br>JF(p)h = ρ × ${lmVector(column)}</div><p>真实单位差商：${truth?lmVector(truth):'ρ=0，未定义'}。继续缩小 ρ，比较它与这一列。</p>`;}
  else read=`<strong>任意输入方向 = 两列的加权组合</strong><div class="lm-equation">JF(p)h = ${lmNumber(B.coords[0],3)} × 第 1 列 + ${lmNumber(B.coords[1],3)} × 第 2 列<br>= ${lmVector(physical)}</div><p>点选一列，检查“只动一个输入变量”；自由拖动端点，回到组合方向。</p>`;
  html('lm-column-read',read);html('lm-basis-read',`<p>同一个物理 h = ${lmVector(h)}<br>新坐标 h_new = ${lmVector(B.coords)}<br>(JF·B)h_new = ${lmVector(B.physical)}<br>JF·h = ${lmVector(physical)}</p><p>旋转基时保留物理 h；需要沿新基走时，再点一列。</p>`);
  text('lm-matrix-title',s.step==='columns'&&s.basis!==0?'基变了，矩阵变了，物理输出没变。':'先看输入方向，再看这一列输出到哪里。');
 }
 function localUpdate(){const {s,p,h}=statePoints(),L=lmLocal(s.map,p,h);
  html('lm-input',lmInputSVG(s));html('lm-output',lmOutputSVG(s));text('lm-scale-tag',L.rho===0?'h=0：归一化关闭':s.normalized?`输出显示 × ${lmNumber(1/L.rho,2)}`:'显示原始变化');
  html('lm-live',metric('真实变化 ΔF',lmVector(L.truth))+metric('线性预测 JF(p)h',lmVector(L.pred))+metric('余项长度 ‖R‖',lmNumber(L.error))+metric('归一化 ‖R‖ / ρ',lmNumber(L.ratio)));
  const singular=Math.abs(lmDet(L.A))<1e-10;html('lm-interpretation',`<span class="eyebrow">THE DEFINITION, NOT A VISUAL GUESS</span><h3>${L.rho===0?'零位移不参与比值极限。':s.map==='affine'?'这台机器本来就是线性的（外加平移）。':'缩小的不只是误差，更是“误差相对位移的比例”。'}</h3><p>F(p+h) = F(p) + JF(p)h + R。${s.map==='affine'?'平移在两次函数值相减时消去，本例 R 恒为零。':'两根箭头接近只是观察；下方的上界对所有小方向同时成立，才完成可微性论证。'}${singular?' 当前 Jacobian 奇异，但这个多项式映射仍然可微；可微与可逆不是同一件事。':''}</p>`);
  html('lm-bound',`<span class="lm-tag">解析公式 · 不是有限采样</span><div class="lm-equation">${lmEscape(lmMaps[s.map].remainder)}<br>sup<sub>‖h‖=ρ</sub> ‖R‖/ρ ≤ ${lmEscape(lmMaps[s.map].bound)}${L.rho?' ≈ '+lmNumber(L.bound):''}</div><p>固定 p，让 ρ→0，这个上界也趋于 0。这里显示的是一个已证明上界，不是声称算出了精确上确界。ρ=0 时比值不定义。</p>`);
  html('lm-error-plot',lmErrorSVG(s));matrix();
 }
 function pipeline(){const s=getState();html('lm-pipeline',`<div class="lm-machine ${flow<1?'active':''}"><small>输入位移</small><strong>h</strong></div><span class="lm-flow-arrow">→</span><div class="lm-machine ${flow>=1&&flow<2?'active':''}"><small>在 p 工作</small><strong>A = JF(p)</strong><span>先作用右边</span></div><span class="lm-flow-arrow">→</span><div class="lm-machine ${flow>=2?'active':''}"><small>在 F(p) 工作</small><strong>B = JG(F(p))</strong><span>再作用左边</span></div><div class="lm-pipeline-summary${s.merged?' merged':''}">${s.merged?'合并： h → (BA)h':'分开： h → Ah → B(Ah)'}<span>两种写法，同一个线性输出</span></div>`);text('lm-chain-phase',playing?(flow<1?'先看输入 h':flow<2?'第 1 步：作用 A':'第 2 步：作用 B'):'h → Ah → BAh');
  root.querySelectorAll('.lm-three-planes>.lm-plane').forEach((p,i)=>p.classList.toggle('lm-flow-active',Math.min(2,Math.floor(flow))===i&&playing));
  for(let i=0;i<3;i++){const dot=$('lm-flow-dot-'+i);if(!dot)continue;const t=Math.max(0,Math.min(1,flow-i)),d=dot.dataset;dot.setAttribute('cx',Number(d.ox)+(Number(d.tx)-Number(d.ox))*t);dot.setAttribute('cy',Number(d.oy)+(Number(d.ty)-Number(d.oy))*t);dot.setAttribute('opacity',flow>=i&&flow>0?'1':'0');}
 }
 function chainUpdate(){const {s,p,h}=statePoints(),K=lmChain(s.map,s.outer,p,h);
  html('lm-chain-in',lmChainSVG(s,0));html('lm-chain-mid',lmChainSVG(s,1));html('lm-chain-out',lmChainSVG(s,2));pipeline();
  text('lm-outer-formula',lmOuters[s.outer].formula);
  html('lm-live',metric('中间预测 Ah',lmVector(K.pred))+metric('分两步 B(Ah)',lmVector(K.two))+metric('合成一步 (BA)h',lmVector(K.one))+metric('真实复合余项 / ρ',lmNumber(K.ratio)));
  html('lm-chain-matrices',`<div class="lm-card-head"><div><span class="eyebrow">RIGHT FIRST · LEFT SECOND</span><h2>取值点，也跟着机器向前走。</h2></div></div><div class="lm-product-row">${smallMatrix(K.B,'B = JG(F(p))')}<span>×</span>${smallMatrix(K.A,'A = JF(p)')}<span>=</span>${smallMatrix(K.product,'J(G∘F)(p) = BA')}</div><p class="lm-small">p = ${lmVector(p)}；第二台机器的工作点 F(p) = ${lmVector(K.at)}。矩阵乘法用 (2×2)(2×2) 演示；一般尺寸是 (k×m)(m×n)=k×n。</p>`);
  html('lm-interpretation',`<span class="eyebrow">EXACT ALGEBRA ≠ EXACT NONLINEAR CHANGE</span><h3>两步与一步相同，说的是线性预测。</h3><p>真实变化 G(F(p+h))−G(F(p)) = ${lmVector(K.truth)}；线性预测 = ${lmVector(K.one)}。缩小位移，检验复合余项除以 ρ 后的变化。${s.wrong?`错误次序 ABh = ${lmVector(K.wrong)}；顺序错误的差 = ${lmNumber(lmNorm(lmSub(K.wrong,K.one)))}。仅本例都是 2×2 才能反着相乘，通常连尺寸也不允许。`:''}</p>`);
  html('lm-error-plot',lmErrorSVG(s));html('lm-bound',`<span class="lm-tag">沿用第一台机器的余项界</span><div class="lm-equation">R<sub>G∘F</sub> = B R<sub>F</sub> + R<sub>G</sub>(ΔF)<br>‖R<sub>G∘F</sub>‖ / ρ ≤ ${lmNumber(K.bound)}</div><p>虚线用矩阵 Frobenius 范数和两个多项式余项的全方向上界计算。证明页会解释 k=ΔF=O(‖h‖)，以及为什么第二个小余项仍是 o(‖h‖)。界可能较宽，不能由“界大”断言实际误差大。</p>`);
 }
 function projectionUpdate(){const {s,p,y}=statePoints(),M=lmMVT(s.map,p,y,s.angle,s.lambda);
  html('lm-input',lmInputSVG(s));html('lm-curve',lmCurveSVG(s));html('lm-compass',lmCompassSVG(s));html('lm-shadow',lmShadowSVG(s));
  html('lm-live',metric('总位移的投影 a·ΔF',lmNumber(M.chord))+metric('当前投影速度 a·JF(z)(y−p)',lmNumber(M.slope))+metric('两者之差（浮点读数）',lmNumber(M.residual))+metric('当前输入点 z',lmVector(M.z)));
  const roots=M.distinct?(M.all?'<p>投影是一条直线：每个内部点都是中值点。</p><button class="button" data-lm-root="0.5">选 ξ=1/2</button>':`<span>当前方向的候选 ξ</span>${M.roots.map(r=>`<button class="button${near(r,s.lambda)?' active':''}" data-lm-root="${r}">ξ ≈ ${lmNumber(r,5)}</button>`).join('')}${M.roots.length?'':'<p>当前系数的浮点求根退化；这不否定存在定理。</p>'}`):'<p>p=y：等式退化为 0=0，先把两点分开。</p>';
  html('lm-roots',roots);const snap=root.querySelector('[data-lm-action="snap"]');if(snap)snap.disabled=!M.distinct;
  html('lm-projection-read',`<div class="lm-equation">a = ${lmVector(M.a)}；φ′(λ) = a · JF(p+λ(y−p))(y−p)</div><p>${!M.distinct?'此时未使用 p≠y 的教材命题。':Math.abs(M.residual)<1e-8?'当前切线与割线的斜率在显示精度内相等；候选来自多项式方程，存在性由中值定理保证。':'拖动 λ 比较斜率，再点击绿色候选点，让切线与割线平行。'} 参数区间是 [0,1]；位移的长度已经在 y−p 里。</p>`);
  html('lm-interpretation',`<span class="eyebrow">FIX a FIRST, THEN FIND ξ</span><h3>向量先变成实数，普通中值定理才接得上。</h3><div class="lm-equation">a·[F(y)−F(p)] = a·JF(zₐ)(y−p)，zₐ=p+ξ(y−p)</div><p>本页把 a 限制为单位方向以便拖动。任意非零 a 只多一个倍数，零向量的等式平凡成立。曲线与数值求根是例子的展示；一般定理只需要 F 可微、[p,y]⊂U，不要求导数连续。</p>`);
  const isCounter=s.map==='cubic'&&near(s.px,-1)&&near(s.py,0)&&near(s.yx,1)&&near(s.yy,0);
  html('lm-counter-proof',isCounter?`<div class="lm-counter-grid"><div><small>只看第一个输出</small><strong>a = e₁： t = 0</strong><p>0 = 4t ⇒ t=0；对应 ξ=1/2。</p></div><div><small>只看第二个输出</small><strong>a = e₂： t = ±1/√3</strong><p>2 = 6t²；对应 ξ=(1±1/√3)/2。</p></div></div><p class="lm-warning">这里 t 是原输入的第一坐标，t=−1+2ξ。两个解集不相交，所以不存在共同向量中值点。转动 a，观察各自的 ξ 如何改变；不是中值定理失效，而是“先投影”不能省略。</p>`:`<p class="lm-small">点击按钮固定 F(t,0)=(t²,t³)，p=(−1,0)、y=(1,0)。它会给出无共同点的精确反证；不要把当前数值候选没有重合，当成一般性证明。二次或仿射正例可以有共同点。</p>`);
 }
 function proofUpdate(){const s=getState(),P=lmProofs[s.step],x=P.steps[s.proofStep];html('lm-proof-current',`<span class="lm-tag">STEP ${s.proofStep+1} / 4</span><h3>${x[0]}</h3><p>${x[1]}</p><div class="lm-equation">${lmEscape(x[2])}</div>`);root.querySelectorAll('[data-lm-proof-step]').forEach(b=>{if(Number(b.dataset.lmProofStep)===s.proofStep)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});const back=root.querySelector('[data-lm-action="proof-back"]'),next=root.querySelector('[data-lm-action="proof-next"]');back.disabled=s.proofStep===0;next.disabled=s.proofStep===3;text('lm-proof-live',`当前映射：${lmMaps[s.map].formula}\np = ${lmVector([s.px,s.py])}\nF(p) = ${lmVector(lmF(s.map,[s.px,s.py]))}`);}
 function quizUpdate(){for(const q of lmQuestions){const value=draft[q.id];if(value!==undefined){const el=root.querySelector(`input[name="lm-question-${q.id}"][value="${value}"]`);if(el)el.checked=true;}if(scored){const el=$('lm-feedback-'+q.id),ok=value===q.correct;el.hidden=false;el.classList.toggle('correct',ok);el.innerHTML=`<strong>${ok?'✓ 判断正确':'再核对理由'} · 正确答案 ${String.fromCharCode(65+q.correct)}</strong><p>${lmEscape(q.why)}</p>`;}}if(scored)text('lm-quiz-score',`${lmQuestions.filter(q=>draft[q.id]===q.correct).length} / ${lmQuestions.length} 正确。请检查解释，而不只记住选项。`);}
 function update(){if(destroyed)return;const {s,p,h}=statePoints();text('lm-function-formula',lmMaps[s.map].formula);text('lm-function-note',lmMaps[s.map].note);if(s.screen==='proof'){proofUpdate();return;}if(s.screen==='challenge'){quizUpdate();return;}
  const rho=lmNorm(h);slider('lm-scale',rho?-Math.log10(rho):4,rho?lmNumber(rho):'0（比值未定义）');slider('lm-hangle',((Math.atan2(h[1],h[0])*180/Math.PI)+360)%360,`${lmNumber(((Math.atan2(h[1],h[0])*180/Math.PI)+360)%360,1)}°`);
  for(const k of ['px','py','yx','yy'])slider('lm-'+k,s[k],lmNumber(s[k],3));slider('lm-angle',s.angle,`${lmNumber(s.angle,1)}°`);slider('lm-lambda',s.lambda,lmNumber(s.lambda,5));slider('lm-basis',s.basis,`${lmNumber(s.basis,1)}°`);text('lm-hread',`p = ${lmVector(p)}\nh = ${lmVector(h)}`);
  if(s.step==='projection')projectionUpdate();else if(s.step==='chain')chainUpdate();else localUpdate();
 }
 function play(){if(playing){stop(true);return;}const s=getState();if(s.step==='projection'&&s.px===s.yx&&s.py===s.yy){toast('请先把 p 与 y 分开。');return;}if(s.step!=='projection'&&s.step!=='chain'&&lmNorm([s.hx,s.hy])<=.00011)lmSetLength(s,.8);if(s.step==='projection'&&s.lambda>=.999)s.lambda=0;
  playing=true;start=0;last=0;initialQ=-Math.log10(lmNorm([s.hx,s.hy])||.8);flow=0;const b=root.querySelector('[data-lm-action="play"]');b.innerHTML=icon('pause')+' 暂停';b.setAttribute('aria-pressed','true');const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tick(now){if(!playing||destroyed)return;if(!start)start=now;if(!last)last=now;const dt=now-last;if(dt>=(reduce?600:40)){last=now;const st=getState();if(st.step==='chain'){flow=Math.min(3,(now-start)/850);pipeline();if(flow>=3){stop(true);pipeline();toast('先 A 后 B：B(Ah) 与 (BA)h 是同一个线性输出。');return;}}
    else if(st.step==='projection'){st.lambda=Math.min(1,st.lambda+dt/7500);update();changed();if(st.lambda>=1){stop(true);return;}}
    else {const q=Math.min(4,initialQ+(now-start)/2600);lmSetLength(st,10**-q);update();changed();if(q>=4){stop(true);toast('观察结束；全方向的极限证明在下方与证明页。');return;}}}
    raf=requestAnimationFrame(tick);
  }raf=requestAnimationFrame(tick);
 }
 root.addEventListener('click',e=>{const s=getState(),step=e.target.closest('[data-lm-step]'),screen=e.target.closest('[data-lm-screen]'),col=e.target.closest('[data-lm-column]'),point=e.target.closest('[data-lm-root]'),proof=e.target.closest('[data-lm-proof-step]'),angle=e.target.closest('[data-lm-angle]'),action=e.target.closest('[data-lm-action]');
  if(step){navigate(s.screen==='challenge'?'explore':s.screen,step.dataset.lmStep);return;}if(screen){navigate(screen.dataset.lmScreen);return;}if(col){stop();lmChooseColumn(s,Number(col.dataset.lmColumn));if(s.step!=='columns')navigate('explore','columns');else{update();changed();}return;}
  if(point){stop();s.lambda=Number(point.dataset.lmRoot);update();changed();return;}if(proof){s.proofStep=Number(proof.dataset.lmProofStep);update();changed();return;}if(angle){stop();s.angle=Number(angle.dataset.lmAngle);const M=lmMVT(s.map,[s.px,s.py],[s.yx,s.yy],s.angle);s.lambda=M.all ? .5 : (M.roots[0]??.5);update();changed();return;}
  if(!action)return;const a=action.dataset.lmAction;if(a==='play'){play();return;}stop();switch(a){
   case 'reset':Object.assign(s,linearDefaults());for(const k in draft)delete draft[k];scored=false;changed(true);toast('已恢复第八个实验的起点。');return;
   case 'half':lmSetLength(s,Math.max(1e-4,lmNorm([s.hx,s.hy])/2));break;
   case 'zero':s.hx=0;s.hy=0;s.column=0;break;
   case 'restore-h':s.hx=.62;s.hy=.38;s.column=0;break;
   case 'merge':s.merged=!s.merged;action.setAttribute('aria-pressed',String(s.merged));action.textContent=s.merged?'分开看两步':'合并两步';break;
   case 'snap':{const M=lmMVT(s.map,[s.px,s.py],[s.yx,s.yy],s.angle);s.lambda=M.all ? .5 : (M.roots[0]??s.lambda);break;}
   case 'counter':Object.assign(s,{map:'cubic',px:-1,py:0,yx:1,yy:0,angle:0,lambda:.5,step:'projection',screen:'explore'});changed(true);return;
   case 'next-step':{const i=lmSteps.indexOf(s.step);navigate(i===3?'challenge':'explore',i===3?s.step:lmSteps[i+1]);return;}
   case 'proof-back':s.proofStep=Math.max(0,s.proofStep-1);break;
   case 'proof-next':s.proofStep=Math.min(3,s.proofStep+1);break;
   case 'clear-quiz':for(const k in draft)delete draft[k];scored=false;changed(true);return;
   case 'export':{const blob=new Blob(['\ufeff'+lmCSV(s)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ma-linear-map-data.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('已导出稳定多项式公式计算的数值与解析界。');return;}
  }update();changed();
 },{signal});
 root.addEventListener('input',e=>{const el=e.target,s=getState();if(el.name?.startsWith('lm-question-')){draft[el.name.replace('lm-question-','')]=Number(el.value);scored=false;return;}if(!el.id?.startsWith('lm-'))return;stop();const key=el.id.slice(3),v=Number(el.value);
  if(key==='scale'){lmSetLength(s,10**-v);}else if(key==='hangle'){const r=lmNorm([s.hx,s.hy])||.5;[s.hx,s.hy]=lmScale(lmUnit(v),r);s.column=0;}else if(['px','py','yx','yy','lambda','angle'].includes(key)){s[key]=v;}else if(key==='basis'){s.basis=v;s.column=0;}else if(key==='normalized'){s.normalized=el.checked;}else if(key==='wrong'){s.wrong=el.checked;}else return;update();changed();
 },{signal});
 root.addEventListener('change',e=>{const s=getState();if(e.target.id==='lm-function'){stop();s.map=e.target.value;update();changed();}if(e.target.id==='lm-outer'){stop();s.outer=e.target.value;update();changed();}},{signal});
 root.addEventListener('submit',e=>{if(e.target.id!=='lm-quiz')return;e.preventDefault();const data=new FormData(e.target);for(const q of lmQuestions)draft[q.id]=Number(data.get('lm-question-'+q.id));scored=true;quizUpdate();toast('理由已逐题展开。');},{signal});
 root.addEventListener('pointerdown',e=>{const target=e.target.closest('[data-lm-handle]');if(!target)return;stop();const svg=target.closest('svg'),m=svg.getScreenCTM()?.inverse();if(!m)return;drag={key:target.dataset.lmHandle,m:{a:m.a,b:m.b,c:m.c,d:m.d,e:m.e,f:m.f},cx:Number(svg.dataset.lmCx),cy:Number(svg.dataset.lmCy),unit:Number(svg.dataset.lmUnit),pointer:e.pointerId};root.setPointerCapture(e.pointerId);e.preventDefault();},{signal});
 function applyPoint(key,point){const s=getState(),clamp=x=>Math.round(Math.max(-1.5,Math.min(1.5,x))*100)/100;if(key==='p'){s.px=clamp(point[0]);s.py=clamp(point[1]);}if(key==='y'){s.yx=clamp(point[0]);s.yy=clamp(point[1]);}if(key==='h'){[s.hx,s.hy]=lmLimitH(lmSub(point,[s.px,s.py]));s.column=0;}if(key==='a'&&lmNorm(point)>.01)s.angle=((Math.atan2(point[1],point[0])*180/Math.PI)+360)%360;}
 root.addEventListener('pointermove',e=>{if(!drag)return;const m=drag.m,px=m.a*e.clientX+m.c*e.clientY+m.e,py=m.b*e.clientX+m.d*e.clientY+m.f;applyPoint(drag.key,[(px-drag.cx)/drag.unit,(drag.cy-py)/drag.unit]);update();changed();},{signal});
 const endDrag=()=>{if(drag){try{root.releasePointerCapture(drag.pointer);}catch{}drag=null;changed();}};root.addEventListener('pointerup',endDrag,{signal});root.addEventListener('pointercancel',endDrag,{signal});
 root.addEventListener('keydown',e=>{const point=e.target.closest('[data-lm-root]');if(point&&['Enter',' '].includes(e.key)){e.preventDefault();point.dispatchEvent(new MouseEvent('click',{bubbles:true}));return;}const handle=e.target.closest('[data-lm-handle]');if(!handle||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();stop();const key=handle.dataset.lmHandle,s=getState(),id=handle.id,amount=e.shiftKey ? .1 : .025;let pos=key==='p'?[s.px,s.py]:key==='y'?[s.yx,s.yy]:key==='h'?[s.px+s.hx,s.py+s.hy]:lmUnit(s.angle);
  if(key==='a'){s.angle=e.key==='Home'?0:(s.angle+(['ArrowRight','ArrowUp'].includes(e.key)?5:-5)+360)%360;}else if(e.key==='Home'){if(key==='p'){s.px=.6;s.py=.2;}if(key==='y'){s.yx=1.25;s.yy=.65;}if(key==='h'){s.hx=.62;s.hy=.38;s.column=0;}}else{pos=lmAdd(pos,[e.key==='ArrowRight'?amount:e.key==='ArrowLeft'?-amount:0,e.key==='ArrowUp'?amount:e.key==='ArrowDown'?-amount:0]);applyPoint(key,pos);}update();changed();$(id)?.focus({preventScroll:true});
 },{signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop(true);},{signal});
 update();return {destroy(){destroyed=true;stop();drag=null;abort.abort();}};
}

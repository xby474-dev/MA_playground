import { completenessDefaults } from './completeness-state.js';
import { completenessNodes, completenessEdges, cpNode, cpEdge, cpTarget, exactBrackets, rtext, rnumber, rcompare, parseRational, upperBoundWitness, cauchyCertificate, implicationPath, domainVerdict, completenessCSV } from './completeness-math.js';
import { cpDefinitions, cpProofs, cpQuestions, cpEscape } from './completeness-content.js';
import { completenessGraph, completenessPlot, cpMiniSVG } from './completeness-plots.js';
const quizMemory={answers:{},graded:false};
const approx=q=>{const x=rnumber(q);return x!==0&&Math.abs(x)<.00001?x.toExponential(5):x.toFixed(9).replace(/0+$/,'').replace(/\.$/,'');};
export function mountCompletenessLab(root,getState,changed,toast){
 const abort=new AbortController(),opts={signal:abort.signal};let frame=null,playing=false,last=0;
 const $=id=>root.querySelector('#'+id),html=(id,v)=>{if($(id))$(id).innerHTML=v;},text=(id,v)=>{if($(id))$(id).textContent=v;};
 const focus=()=>{$('cp-title')?.focus({preventScroll:true});window.scrollTo(0,0);};
 function stop(){playing=false;if(frame!==null)cancelAnimationFrame(frame);frame=null;last=0;for(const b of root.querySelectorAll('[data-cp-action="play"]')){b.textContent='▷ 逐次二分';b.setAttribute('aria-pressed','false');}}
 function rebuild(){stop();changed(true);focus();}
 function node(id){if(!completenessNodes.some(n=>n.id===id))return;const s=getState();s.node=id;s.screen='explore';s.edge=completenessEdges.find(e=>e.from===id).id;rebuild();}
 function edge(id){if(!completenessEdges.some(e=>e.id===id))return;const s=getState();s.edge=id;s.screen='proof';s.proofStep=0;rebuild();}
 function setSlider(id,value,label){const el=$(id);if(el){el.value=value;el.style.setProperty('--fill',`${100*(value-Number(el.min))/(Number(el.max)-Number(el.min))}%`);el.setAttribute('aria-valuetext',label);}}
 function inspectUpper(){const s=getState(),q=parseRational(s.candidate);if(!q)return;const res=upperBoundWitness(q,s.target);let title,explanation;
  if(res.kind==='not-upper'){title='还不是上界';explanation=`找到更大的集合元素 r=${rtext(res.witness)}：r>q，且 0≤r、r²&lt;d。${res.h?'这里用 h=min{1,(d−q²)/[2(2q+1)]}，令 r=q+h。':'这里的 r=0 已经足够。'}`;}
  else if(res.kind==='not-least'){title='是上界，但不是最小的';explanation=`更小的上界 r=${rtext(res.witness)}。精确恒等式：r=(q+d/q)/2，r²−d=(q²−d)²/(4q²)>0。`;}
  else{title='本例的最小上界';explanation=`q=${rtext(q)}，q²=d。它是 A 的上确界；但严格不等式 x²&lt;d 使 q 不属于 A。一个正例不改变 ℚ 不完备的结论。`;}
  html('cp-upper-feedback',`<strong>${title}</strong><p>${explanation}</p><small>分数与符号由精确有理数运算给出。</small>`);
 }
 function comparison(s){const t=cpTarget(s.target),v=domainVerdict(s.domain,s.target),r={sup:`A 的上确界是 ${t.label}，属于 ℝ，但不属于 A。`,mono:`aₙ 单调有界，且 aₙ→${t.label}∈ℝ。`,nested:`全部闭区间的交集为 {${t.label}}。`,bw:`偶数项趋于 ${t.label}，奇数项趋于 −${t.label}；整列不收敛。`,cauchy:`aₙ 满足 Cauchy 条件，并有极限 ${t.label}∈ℝ。`}[s.node];
 const q=t.rational?{sup:'A 的上确界 3/2 也属于 ℚ。',mono:'aₙ 从 n=1 起恒为 3/2，在 ℚ 内收敛。',nested:'在 ℚ 中的交集同样为 {3/2}。',bw:'偶数、奇数子列分别在 ℚ 内收敛到 ±3/2；整列仍不收敛。',cauchy:'此 Cauchy 数列在 ℚ 内也有极限 3/2。'}[s.node]:{sup:'非空且有上界，但在 ℚ 中不存在最小上界。',mono:'仍然单调有界，却不收敛到任何有理数。',nested:'任意有限交集含无限多个有理数，无限交集在 ℚ 内为空。',bw:'这条有界序列没有任何在 ℚ 内收敛的子列。',cauchy:'仍满足相同的 Cauchy 条件，但没有属于 ℚ 的极限。'}[s.node];
 return `<div class="cp-domain-grid"><section class="${s.domain==='R'?'active':''}"><span class="cp-domain-symbol">ℝ</span><strong>本例有域内终点</strong><p>${r}</p><small>数系层面：五个普遍命题都成立。</small></section><section class="${s.domain==='Q'?'active ':''}${t.rational?'':'missing'}"><span class="cp-domain-symbol">ℚ</span><strong>${t.rational?'本例也成功':'本例缺少所需终点'}</strong><p>${q}</p><small>数系层面：五个普遍命题仍不成立。${t.rational?'一个正例不能证明“对所有”。':'这个反例足以否定普遍断言。'}</small></section></div>`;
 }
 function interpretation(s,row){const t=cpTarget(s.target);if(s.node==='sup')return `<strong>逼近一条界线，不是在寻找集合的“最后一个点”。</strong><p>aₙ²≤d&lt;bₙ²；bₙ 是上界。${row.hit?'当前 aₙ²=d，所以 aₙ 自己已经是上确界，却不是 A 的元素。':'当前 aₙ²&lt;d，所以 aₙ∈A，还不是上界。'} 用左侧候选检查器，看看怎样击破错误候选。</p>`;
 if(s.node==='mono')return `<strong>单调性看得见，极限的存在不能靠有限折线决定。</strong><p>对每个 n，1≤aₙ≤aₙ₊₁≤2。${s.domain==='Q'&&!t.rational?'这些条件在 ℚ 中仍成立；缺的是域内终点，而不是单调性或上界。':'数列可能重复，不需要每次严格增加。'} 两端宽度精确为 2⁻ⁿ。</p>`;
 if(s.node==='nested')return `<strong>∀n∃qₙ∈Iₙ，不等于 ∃q∀n(q∈Iₙ)。</strong><p>当前宽度 ${rtext(row.width)}>0，每个有限交集都非空。无限交集在 ${s.domain==='R'?'ℝ': 'ℚ'} 中${s.domain==='R'||t.rational?'是单点 { '+t.label+' }':'为空'}，这是下方解析论证的结论，不是检测到图形“缩成一点”。</p>`;
 if(s.node==='bw')return `<strong>${s.parity==='all'?'先看全列为什么不收敛，再保留一条子列。':'保留下标 '+(s.parity==='even'?'0,2,4,…':'1,3,5,…')+'，没有把数字重新排序。'}</strong><p>在 ℝ 中，两条子列分别趋于 ±${t.label}。${s.domain==='Q'&&!t.rational?'若任一子列有有理极限 q，其平方必须趋于 d，要求 q²=d，矛盾。':'原序列始终在两边跳，所以它不是 Cauchy；“有子列收敛”不能代替全列收敛。'} 对任意序列的“无限多项二分”在箭头证明中给出。</p>`;
 const c=cauchyCertificate(s.target,s.n,s.epsilon,s.m,s.k);
 return `<strong class="${c.certified?'cp-certificate-good':'cp-certificate-wait'}">${c.certified?'✓ 解析尾部证书已满足本次 ε':'此通用证书暂未达到本次 ε'}</strong><p>∀m,j≥N=${s.n}，|aₘ−aⱼ|≤B=${rtext(c.bound)}。当前 B ${c.certified?'&lt;':'≥'} ε=${rtext(c.epsilon)}。${c.certified?'这个上界管住所有尾部项，不只屏幕上的两项。':'不代表数列不是 Cauchy；只是当前 N 的这个上界还不够小。可取 N='+c.suggestedN+'。'}</p><p>所选两项的精确差为 <span class="cp-fraction">${rtext(c.delta)}</span> ≈ ${approx(c.delta)}。</p>`;
 }
 function grade(){let score=0;for(const q of cpQuestions){const correct=Number(quizMemory.answers['cp-'+q.id])===q.correct;if(correct)score++;const box=$('cp-feedback-'+q.id);if(box){box.hidden=false;box.classList.toggle('correct',correct);box.innerHTML=`<strong>${correct?'✓ 判断正确':'需要再检查'} · 正确答案 ${String.fromCharCode(65+q.correct)}</strong><p>${q.reason}</p>`;}}text('cp-quiz-score',`${score} / ${cpQuestions.length} 正确 · 逐题理由已展开`);}
 function update(){
  const s=getState(),compact=window.innerWidth<690;for(const el of root.querySelectorAll('[data-cp-domain]'))el.setAttribute('aria-pressed',String(el.dataset.cpDomain===s.domain));text('cp-context-n',s.n);
  if(s.screen==='map'){
   html('cp-graph',completenessGraph(s));html('cp-map-mini',cpMiniSVG(s));const t=cpTarget(s.target);
   html('cp-map-outcome',`<strong>${s.domain==='R'?'ℝ：普遍保证终点存在':'ℚ：可以逼近，却未必有域内终点'}</strong><p>${t.rational?'目标 3/2 在两个数系中都可用；这只是一个正例。':'目标 '+t.label+' 在 ℝ 中存在，在 ℚ 中缺失；运算的每一步仍是有理数。'}</p>`);
   const route=implicationPath(s.from,s.to);html('cp-route-description',route.length?`<strong>${route.length} 条箭头</strong><p>${[cpNode(s.from).short,...route.map(id=>cpNode(cpEdge(id).to).short)].join(' → ')}</p>`:'<p>起点就是终点，无需额外蕴含。选择另一节点试试。</p>');root.querySelector('[data-cp-action="route"]').disabled=!route.length;return;
  }
  if(s.screen==='proof'){
   const e=cpEdge(s.edge),p=cpProofs[e.id],st=p.steps[s.proofStep];
   html('cp-proof-current',`<span class="cp-step-number">${String(s.proofStep+1).padStart(2,'0')}</span><h3>${st[0]}</h3><p>${cpEscape(st[1])}</p><div class="cp-equation">${cpEscape(st[2])}</div>`);
   root.querySelectorAll('[data-cp-proof-step]').forEach(b=>b.setAttribute('aria-current',Number(b.dataset.cpProofStep)===s.proofStep?'step':'false'));
   root.querySelector('[data-cp-action="proof-prev"]').disabled=s.proofStep===0;root.querySelector('[data-cp-action="proof-next"]').disabled=s.proofStep===3;
   html('cp-proof-visual',completenessPlot({...s,node:e.to},true));return;
  }
  if(s.screen==='challenge'){for(const [name,value] of Object.entries(quizMemory.answers)){const el=root.querySelector(`input[name="${name}"][value="${value}"]`);if(el)el.checked=true;}if(quizMemory.graded)grade();return;}
  const rows=exactBrackets(s.target,s.n),row=rows[s.n];
  text('cp-depth-mobile-value',s.n);setSlider('cp-depth-mobile',s.n,`第 ${s.n} 次二分，宽度 ${rtext(row.width)}`);
  text('cp-depth-value',s.n);setSlider('cp-depth',s.n,`第 ${s.n} 次二分，区间宽度 ${rtext(row.width)}`);
  root.querySelectorAll('[data-cp-action="prev"]').forEach(b=>b.disabled=s.n===0);root.querySelectorAll('[data-cp-action="next"]').forEach(b=>b.disabled=s.n===32);
  text('cp-plot-title',{sup:'最小上界，不是“最后一个有理数”。',mono:'同一对端点，读成两条单调数列。',nested:'留住每一层，追问无限交集。',bw:'从有界的来回跳动里，挑出一条路。',cauchy:'先不问极限在哪，只比较尾部彼此。'}[s.node]);
  html('cp-primary-plot',completenessPlot(s,compact));
  html('cp-live',[[`a${s.n} · 左端点`,row.a],[`b${s.n} · 右端点`,row.b],['区间宽度 · 精确',row.width]].map(([label,value])=>`<div><small>${label}</small><strong class="cp-fraction">${rtext(value)}</strong><span>≈ ${approx(value)}</span></div>`).join(''));
  html('cp-interpretation',interpretation(s,row));html('cp-domain-comparison',comparison(s));
  html('cp-ledger',`<table><caption>有理端点与二次残差；数据是有限前缀，不是极限存在性的证明。</caption><thead><tr><th>n</th><th>aₙ</th><th>bₙ</th><th>bₙ−aₙ</th><th>d−aₙ²</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.n}</td><td>${rtext(r.a)}</td><td>${rtext(r.b)}</td><td>${rtext(r.width)}</td><td>${rtext(r.residual)}</td></tr>`).join('')}</tbody></table>`);
  if(s.node==='sup')inspectUpper();
  if(s.node==='cauchy'){text('cp-epsilon-value',`e=${s.epsilon}`);text('cp-m-value',s.m);text('cp-k-value',s.k);setSlider('cp-epsilon',s.epsilon,`epsilon 为 2 的负 ${s.epsilon} 次方`);setSlider('cp-m',s.m,`m=${s.n+s.m}`);setSlider('cp-k',s.k,`j=${s.n+s.k}`);}
  root.querySelectorAll('[data-cp-parity]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cpParity===s.parity)));
 }
 function tick(now){if(!playing)return;if(!last)last=now;const delay=matchMedia('(prefers-reduced-motion: reduce)').matches?1100:750;if(now-last>=delay){getState().n=Math.min(32,getState().n+1);last=now;update();changed(false);}if(getState().n>=32){stop();toast('已展示 32 次有限二分；无限过程的结论请核对解析证明。');return;}frame=requestAnimationFrame(tick);}
 root.addEventListener('click',event=>{
  const target=event.target,nd=target.closest('[data-cp-node]'),ed=target.closest('[data-cp-edge]');if(nd){node(nd.dataset.cpNode);return;}if(ed){edge(ed.dataset.cpEdge);return;}
  const b=target.closest('button');if(!b)return;const s=getState();
  if(b.dataset.cpDomain){stop();s.domain=b.dataset.cpDomain;changed(true);root.querySelector(`[data-cp-domain="${s.domain}"]`)?.focus({preventScroll:true});return;}
  if(b.dataset.cpStage!==undefined){const stage=Number(b.dataset.cpStage);if(stage===0)s.screen='map';else if(stage===1||stage===2){s.screen='explore';s.domain=stage===1?'R':'Q';}else if(stage===3){s.screen='proof';s.proofStep=0;s.edge=completenessEdges.find(e=>e.from===s.node).id;}else s.screen='challenge';rebuild();return;}
  if(b.dataset.cpParity){stop();s.parity=b.dataset.cpParity;update();changed(false);return;}
  if(b.dataset.cpProofStep!==undefined){s.proofStep=Number(b.dataset.cpProofStep);update();changed(false);return;}
  switch(b.dataset.cpAction){
   case 'reset':Object.assign(s,completenessDefaults());quizMemory.answers={};quizMemory.graded=false;rebuild();toast('已恢复完备性实验的初始状态。');break;
   case 'map':s.screen='map';rebuild();break;
   case 'start':s.screen='explore';rebuild();break;
   case 'route':{const p=implicationPath(s.from,s.to);if(p.length)edge(p[0]);break;}
   case 'prev':case 'next':stop();s.n=Math.min(32,Math.max(0,s.n+(b.dataset.cpAction==='next'?1:-1)));update();changed(false);break;
   case 'play':if(playing)stop();else{if(s.n>=32)s.n=0;playing=true;last=0;root.querySelectorAll('[data-cp-action="play"]').forEach(x=>{x.textContent='Ⅱ 暂停二分';x.setAttribute('aria-pressed','true');});frame=requestAnimationFrame(tick);}break;
   case 'next-lens':node(completenessNodes[(completenessNodes.findIndex(n=>n.id===s.node)+1)%5].id);break;
   case 'outgoing-proof':edge(completenessEdges.find(e=>e.from===s.node).id);break;
   case 'next-edge':edge(completenessEdges[(completenessEdges.findIndex(e=>e.id===s.edge)+1)%5].id);break;
   case 'proof-explore':node(cpEdge(s.edge).to);break;
   case 'proof-prev':case 'proof-next':s.proofStep=Math.max(0,Math.min(3,s.proofStep+(b.dataset.cpAction==='proof-next'?1:-1)));update();changed(false);break;
   case 'certify':stop();s.n=s.epsilon+1;update();changed(false);toast('这个 N 给出的界对所有晚项同时成立。');break;
   case 'quiz-reset':quizMemory.answers={};quizMemory.graded=false;rebuild();break;
   case 'export':{const data=completenessCSV(s),url=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`ma-completeness-${s.target}-n${s.n}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已导出精确分数及元数据；有限构造记录不是无限过程的证明。');break;}
  }
 },opts);
 root.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('g[data-cp-node],g[data-cp-edge]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}},opts);
 root.addEventListener('input',e=>{const key={'cp-depth':'n','cp-depth-mobile':'n','cp-epsilon':'epsilon','cp-m':'m','cp-k':'k'}[e.target.id];if(!key)return;stop();getState()[key]=Number(e.target.value);update();changed(false);},opts);
 root.addEventListener('change',e=>{
  const s=getState(),id=e.target.id;
  if(id==='cp-target'){stop();s.target=e.target.value;rebuild();return;}
  if(id==='cp-from'||id==='cp-to'){s[id==='cp-from'?'from':'to']=e.target.value;update();changed(false);return;}
  if(id==='cp-zoom'||id==='cp-reference'){stop();s[id==='cp-zoom'?'zoom':'reference']=e.target.checked;update();changed(false);return;}
  if(e.target.matches('#cp-quiz input[type="radio"]')){quizMemory.answers[e.target.name]=e.target.value;quizMemory.graded=false;root.querySelectorAll('.cp-feedback').forEach(b=>b.hidden=true);text('cp-quiz-score','');}
 },opts);
 root.addEventListener('submit',e=>{
  if(e.target.id==='cp-upper-form'){e.preventDefault();const input=$('cp-candidate'),value=input.value.trim();if(!parseRational(value)){text('cp-upper-feedback','请输入有效有理数，例如 7/5、1.4 或 3/2；分母不能为 0。');input.setAttribute('aria-invalid','true');return;}input.removeAttribute('aria-invalid');getState().candidate=value;update();changed(false);}
  if(e.target.id==='cp-quiz'){e.preventDefault();quizMemory.answers=Object.fromEntries(new FormData(e.target));quizMemory.graded=true;grade();}
 },opts);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();},opts);window.addEventListener('resize',update,opts);
 update();return {destroy(){stop();abort.abort();}};
}

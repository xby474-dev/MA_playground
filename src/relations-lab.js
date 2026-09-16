import { models, properties, getModel, getRelation, sample, uniformBound, sequencePair, slopeQuotients, relationRows, planeLabel } from './relations-math.js';
import { relationsDefaults } from './relations-state.js';
import { relationGraph, errorSVG, sectionSVG, derivativeSVG, RelationSurface } from './relations-plots.js';
import { statusStrip, relationResult, modelProofs, challengeReasons } from './relations-content.js';
import { format } from './math.js';
// Session-only drafts: never persist, upload, or put assessment answers into URLs.
const drafts={};
export function mountRelationsLab(root,getState,changed,toast){
 const abort=new AbortController(),options={signal:abort.signal};let surface=null,playing=false,frame=null,last=0;
 const $=id=>root.querySelector('#'+id);
 const text=(id,v)=>{const el=$(id);if(el)el.textContent=v;};
 const html=(id,v)=>{const el=$(id);if(el)el.innerHTML=v;};
 function focusHeading(){const el=$('rel-page-title');el?.focus({preventScroll:true});el?.scrollIntoView({block:'start',behavior:'instant'});}
 function remember(){const f=$('rel-predictions');if(!f)return;const s=getState();const id=s.screen==='challenge'?s.challenge:s.fn;drafts[id]={...drafts[id],...Object.fromEntries(new FormData(f))};}
 function restore(){const s=getState(),d=drafts[s.screen==='challenge'?s.challenge:s.fn]??{};for(const [name,value] of Object.entries(d)){const el=root.querySelector(`input[name="${name}"][value="${value}"]`);if(el)el.checked=true;}}
 function stop(){playing=false;if(frame!==null)cancelAnimationFrame(frame);frame=null;last=0;const b=root.querySelector('[data-r-action="play"]');if(b){b.textContent='▷ 自动趋近';b.setAttribute('aria-pressed','false');}}
 function rebuild(){stop();changed(true);}
 function openEdge(id,stage){remember();const e=getRelation(id),s=getState();Object.assign(s,{edge:e.id,screen:'case',fn:e.example,stage:stage??(e.kind==='theorem'?1:3),reveal:false,view:e.id==='d-s'?'derivative':['p-c','c-p'].includes(e.id)?'section':'surface',angle:['d-p','d-s','c-p'].includes(e.id)?0:45,metric:['p-c','c-p'].includes(e.id)?'value':'ratio'});rebuild();focusHeading();}
 function chooseFunction(id){if(!models[id])return;remember();const s=getState();s.fn=id;s.reveal=false;if(s.stage===2&&id===getRelation(s.edge).example)s.stage=3;rebuild();}
 function goStage(n){remember();const s=getState();if(n===0){s.screen='map';s.stage=0;rebuild();focusHeading();}else if(n===1){openEdge('s-d',1);}else if(n===2){Object.assign(s,{screen:'case',edge:'d-s',fn:'bowl',stage:2,reveal:true,view:'derivative',angle:0,metric:'ratio'});rebuild();focusHeading();}else if(n===3){openEdge('d-s',3);}else {s.screen='challenge';s.stage=4;rebuild();focusHeading();}}
 function update(){
  const s=getState();
  if(s.screen==='map'){html('rel-map-graph',relationGraph(s));return;}
  if(s.screen!=='case')return;
  const rho=10**-s.q,v=sample(s.fn,rho,s.angle,s.sign),m=getModel(s.fn);
  text('rel-angle-output',`${s.angle}°`);text('rel-scale-output',format(rho));text('rel-n-output',s.sequence);
  for(const [id,key] of [['rel-scale','q'],['rel-angle','angle'],['rel-sequence','sequence']]){const el=$(id);if(el){el.value=s[key];el.style.setProperty('--fill',`${100*(s[key]-Number(el.min))/(Number(el.max)-Number(el.min))}%`);el.setAttribute('aria-valuetext',id==='rel-scale'?`位移距离 ${rho.toPrecision(5)}`:String(s[key]));}}
  for(const [attr,key] of [['rAngle','angle'],['rSign','sign'],['rView','view'],['rMetric','metric']])root.querySelectorAll(`[data-${attr.replace(/[A-Z]/g,x=>'-'+x.toLowerCase())}]`).forEach(el=>el.setAttribute('aria-pressed',String(String(s[key])===el.dataset[attr])));
  const cell=(title,n,highlight=false)=>`<div${highlight?' class="rel-highlight"':''}><small>${title}</small><strong>${n===null?'未定义':format(n)}</strong></div>`;
  html('rel-live-data',cell('f(x, y)',v.f)+cell(m.gradient?'L(x, y)':'由偏导生成的 L',v.L)+cell(m.gradient?'绝对误差 |R|':'高度 |f|',v.raw??Math.abs(v.f))+cell(m.gradient?'归一化 |R| / ρ':'相对高度 |f| / ρ',v.ratio??v.reference,true));
  html('rel-status-strip',statusStrip(s));html('rel-relation-result',relationResult(s));
  const seq=['oscillation','radial','ratio'].includes(s.fn);
  const controls=$('rel-derivative-controls');controls.hidden=s.view!=='derivative';
  $('rel-sequence').disabled=!seq;
  if(seq){const p=sequencePair(s.fn,s.sequence);text('rel-sequence-note',s.fn==='ratio'?`(0, ±1/n) 处偏导精确为 ±n。n=${s.sequence} 时分别为 ${s.sequence} 和 −${s.sequence}；原点偏导为 0。`:`xₙ=1/(2πn)≈${format(p.a.x)}，x′ₙ=1/((2n+1)π)≈${format(p.b.x)}。这两列上 fₓ 分别精确为 −1、+1；原点 fₓ=0。`);}else{
   const q=slopeQuotients(s.fn,rho);text('rel-sequence-note',`直接检查坐标轴双侧差商：x 正侧 ${format(q.xPlus)} / 负侧 ${format(q.xMinus)}；y 正侧 ${format(q.yPlus)} / 负侧 ${format(q.yMinus)}。这些是有限尺度读数；存在性见定义与解析证明。`);
  }
  if(s.view==='surface'){
   if(!surface){html('rel-plot','<canvas id="rel-surface" tabindex="0" aria-label="当前函数的三维曲面。拖动或方向键转动，Home 重置；截面、平面和数值见相邻文字。">图形不可用时仍可查看解析值和证明。</canvas>');surface=new RelationSurface($('rel-surface'),getState);}else surface.draw();
  }else{surface?.destroy();surface=null;html('rel-plot',s.view==='section'?sectionSVG(s):derivativeSVG(s));}
  root.querySelector('[data-r-action="camera"]').hidden=s.view!=='surface';
  const note=s.view==='surface'?`拖动 / 方向键旋转，Home 重置。${planeLabel(s.fn)}。高度独立缩放，不能从屏幕上的角度读出真实导数。`:s.view==='section'?`(x,y)=t(cosθ,sinθ)，正负侧都要检查。${s.fn==='ratio'?'原点是实点，路径缺口是空心点；不能跨缺口连线。':s.fn==='absolute'?'切到 x 轴后切换正负侧：右差商 +1，左差商 −1。':'虚线表示候选 L（若存在），不是自动宣告可微。'}`:seq?'展示解析序列，而非用稀疏折线掩盖高频振荡。序列上的恒等式对每个 n 都成立。':'这里画的是邻近点的偏导值，不是原函数；要与原点偏导比较，而不是只看它们是否有界。';
  text('rel-plot-note',note);text('rel-plane-label',planeLabel(s.fn));
  html('rel-error-plot',errorSVG(s));text('rel-chart-title',s.fn==='absolute'?'没有偏导生成的 L：比较相对高度':s.metric==='value'?'函数值是否靠近原点值？':s.metric==='raw'?'绝对误差变小，够了吗？':'把误差除以位移，再看一次。');
  const bound=uniformBound(s.fn,rho);
  const hint=m.properties.D?'统一上界随 ρ 趋于 0，覆盖所有方向。':s.fn==='absolute'?'原点偏导不存在，不能将 L=0 称为导数。':s.fn==='ratio'?'沿 45° 函数值恒为 1/2，连连续性都不满足。':'沿固定的非轴方向已有非零误差比例，因此不能可微。';
  html('rel-bound',`<span class="analytic-tag">解析公式 · 非方向采样</span><strong>${m.boundLabel} ≈ ${format(bound)}</strong><p class="rel-muted">${hint} ${s.fn==='wave'||s.fn==='oscillation'||s.fn==='radial'?'此处标的是上界，不是声称取到了最大值。':''}</p>`);
 }
 function tick(t){if(!playing)return;const s=getState();if(last)s.q=Math.min(4,s.q+(t-last)/1000*.5);last=t;update();changed(false);if(s.q>=4){stop();return;}frame=requestAnimationFrame(tick);}
 root.addEventListener('click',e=>{
  const edge=e.target.closest('[data-r-edge]');if(edge){openEdge(edge.dataset.rEdge);return;}
  const prop=e.target.closest('[data-r-property]');if(prop){const p=properties.find(x=>x.id===prop.dataset.rProperty);const el=$('rel-concept');if(el){el.innerHTML=`<span class="eyebrow">${p.symbol} · ${p.short}</span><h3>${p.name}</h3><p>${p.definition}</p>`;}else toast(p.definition);return;}
  const button=e.target.closest('button');if(!button)return;
  if(button.dataset.rStage!==undefined){goStage(Number(button.dataset.rStage));return;}
  if(button.dataset.rModel){chooseFunction(button.dataset.rModel);return;}
  const s=getState();
  if(button.dataset.rChallenge){remember();s.challenge=button.dataset.rChallenge;rebuild();return;}
  for(const [attr,key] of [['rAngle','angle'],['rSign','sign'],['rView','view'],['rMetric','metric']])if(button.dataset[attr]!==undefined){stop();s[key]=['angle','sign'].includes(key)?Number(button.dataset[attr]):button.dataset[attr];update();changed(false);return;}
  switch(button.dataset.rAction){
   case 'map':remember();s.screen='map';s.stage=0;rebuild();focusHeading();break;
   case 'reset':Object.assign(s,relationsDefaults());for(const key of Object.keys(drafts))delete drafts[key];rebuild();focusHeading();break;
   case 'proof':$('rel-proof').open=true;$('rel-proof').scrollIntoView({block:'start',behavior:'instant'});$('rel-proof').querySelector('summary').focus({preventScroll:true});break;
   case 'play':if(playing)stop();else{if(s.q>=4)s.q=0;playing=true;last=0;button.textContent='Ⅱ 暂停趋近';button.setAttribute('aria-pressed','true');frame=requestAnimationFrame(tick);}break;
   case 'camera':surface?.reset();break;
   case 'challenge-explore':remember();s.fn=s.challenge;s.screen='case';s.stage=4;s.edge=s.challenge==='rational'?'s-d':s.challenge==='radial'?'d-s':'p-d';s.reveal=false;s.angle=45;s.metric='ratio';s.view='surface';rebuild();focusHeading();break;
   case 'export':{const rows=relationRows(s),cols=Object.keys(rows[0]),csv=`# MA Playground v1.2 - finite samples are not a proof\n# fn=${s.fn}; angle=${s.angle}; sign=${s.sign}; null=undefined; bound_kind=${getModel(s.fn).boundKind}\n`+cols.join(',')+'\n'+rows.map(r=>cols.map(k=>r[k]===null?'':r[k]).join(',')).join('\n')+'\n';const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`ma-relations-${s.fn}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已导出101个尺度的数值；空单元格表示未定义，不会用0替代。');break;}
  }
 },options);
 root.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('g[data-r-edge],g[data-r-property]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}},options);
 root.addEventListener('change',e=>{if(e.target.id==='rel-function'){chooseFunction(e.target.value);return;}if(['rel-zoom','rel-plane'].includes(e.target.id)){stop();getState()[e.target.id==='rel-zoom'?'zoom':'plane']=e.target.checked;update();changed(false);}if(e.target.type==='radio')remember();},options);
 root.addEventListener('input',e=>{const keys={'rel-scale':'q','rel-angle':'angle','rel-sequence':'sequence'},k=keys[e.target.id];if(!k)return;stop();getState()[k]=Number(e.target.value);update();changed(false);},options);
 root.addEventListener('submit',e=>{
  if(e.target.id!=='rel-predictions')return;e.preventDefault();remember();const s=getState(),challenge=s.screen==='challenge',id=challenge?s.challenge:s.fn,d=drafts[id],p=models[id].properties;
  let count=0,answered=0;for(const prop of properties){const a=d[`rel-${prop.id}`];if(a!==undefined){answered++;if((a==='yes')===p[prop.id])count++;}}
  if(challenge){const reason=challengeReasons(id),right=Number(d.reason)===reason.correct;
    html('rel-challenge-answer',`<div class="rel-score">${count} / 4 <small>性质正确</small></div>${statusStrip({...s,fn:id,reveal:true})}<table><thead><tr><th>性质</th><th>你的判断</th><th>解析结论</th></tr></thead><tbody>${properties.map(a=>`<tr><td>${a.name}</td><td>${d['rel-'+a.id]==='yes'?'成立':'不成立'}</td><td>${p[a.id]?'✓ 成立':'× 不成立'}</td></tr>`).join('')}</tbody></table><p><strong>${right?'✓ 理由也正确':'再检查理由'}</strong>：${reason.options[reason.correct]}</p><div class="rel-result-proof"><h3>把结论接回定义</h3><p>${modelProofs[id]}</p></div>`);
    text('rel-prediction-result',`${count} / 4 个性质正确；理由${right?'正确':'需要修正'}。`);
  }else{s.reveal=true;update();changed(false);text('rel-prediction-result',answered?`已判断 ${answered} 项，其中 ${count} 项正确。节点现已显示解析结论。`:'解析结论已显示。下一次先试着判断，再核对理由。');}
 },options);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();},options);
 restore();update();
 return {destroy(){stop();surface?.destroy();abort.abort();}};
}

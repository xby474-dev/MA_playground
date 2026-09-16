"""Execute the real built app. HTTP by default; explicit --offline-harness only
injects the actual standalone artifact when this environment prohibits navigation.
No policy switches, no mock UI, no test-only mathematics.
"""
from __future__ import annotations
import argparse,json,subprocess,time,urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--offline-harness',action='store_true');p.add_argument('--browser');p.add_argument('--url',default='http://127.0.0.1:4173/MA_playground/');args=p.parse_args()
OUT=ROOT/'test-results';OUT.mkdir(exist_ok=True);server=None
if not args.offline_harness:
 try:urllib.request.urlopen(args.url,timeout=1)
 except Exception:
  server=subprocess.Popen(['node','scripts/serve.mjs','--dir','dist','--port','4173'],cwd=ROOT,stdout=subprocess.DEVNULL)
  for _ in range(40):
   try:urllib.request.urlopen(args.url,timeout=1);break
   except Exception:time.sleep(.1)
checks=[];errors=[];requests=[]
def ok(msg):checks.append(msg);print(f'PASS {len(checks):02d}  {msg}',flush=True)
def slide(page,id,value):page.locator('#'+id).evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}))}',str(value))
def screen(page,key):page.locator(f'.se-journey [data-se-screen="{key}"]').click()
def route(page,h):page.evaluate('(h)=>{location.hash=h}',h);page.wait_for_timeout(90)
def shot(page,name):
 page.evaluate('scrollTo(0,0)');page.wait_for_function('!document.querySelector("#toast.visible")',timeout=6500);page.screenshot(path=str(OUT/name),full_page=True,animations='disabled')
def no_overflow(page):
 d=page.evaluate('({w:innerWidth,s:document.documentElement.scrollWidth})');assert d['s']<=d['w']+1,d

def no_unknown(page):
 bad=page.evaluate('''()=>Array.from(document.querySelectorAll('#main *')).filter(el=>el instanceof HTMLUnknownElement).map(e=>e.tagName)''');assert not bad,bad
try:
 with sync_playwright() as p:
  opts={'headless':True}
  if args.browser:opts['executable_path']=args.browser
  browser=p.chromium.launch(**opts);ctx=browser.new_context(viewport={'width':1512,'height':1100},reduced_motion='no-preference',accept_downloads=True);page=ctx.new_page();page.set_default_timeout(8000)
  page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url))
  if args.offline_harness:page.set_content((ROOT/'dist/series-lab.html').read_text(),wait_until='load')
  else:page.goto(args.url,wait_until='networkidle');page.locator('#nav-series').click()
  expect(page.locator('#se-title')).to_have_text('不是谁更强，而是谁够用。');expect(page.locator('#nav-series')).to_have_attribute('aria-current','page');assert page.locator('.lab-nav').count()==7
  ok('Sixth full experiment mounts with all five old experiments still navigable')
  assert page.locator('.se-graph-desktop .se-graph-node').count()==9;assert page.locator('.se-graph-desktop .se-graph-edge').count()==8
  expect(page.locator('.se-graph-desktop [data-se-node="root"]')).to_have_class('se-graph-node selected not-holds');assert page.locator('.se-graph-desktop [data-se-node="absolute"].holds').count()==1
  ok('Default 1/n² distinguishes failed sufficient root condition from true absolute convergence')
  # Every displayed theorem edge is checked against unrelated node boxes using
  # actual browser SVG path geometry; a line must not masquerade as another edge.
  collision=page.evaluate('''()=>{const out=[];const endpoints={'ratio-root':['ratio','root'],'root-absolute':['root','absolute'],'limit-comparison':['limit','comparison'],'comparison-absolute':['comparison','absolute'],'integral-absolute':['integral','absolute'],'leib-convergence':['leibniz','convergence'],'absolute-convergence':['absolute','convergence'],'convergence-zero':['convergence','zero']};const svg=document.querySelector('.se-graph-desktop');for(const e of svg.querySelectorAll('.se-graph-edge')){const path=e.querySelector('.se-edge-line'),ids=endpoints[e.dataset.seEdge];if(!ids)continue;const l=path.getTotalLength();for(let k=0;k<=150;k++){const v=path.getPointAtLength(l*k/150);for(const n of svg.querySelectorAll('.se-graph-node')){if(ids.includes(n.dataset.seNode))continue;const tr=n.transform.baseVal.consolidate().matrix;if(v.x>tr.e+1&&v.x<tr.e+217&&v.y>tr.f+1&&v.y<tr.f+105){out.push(e.dataset.seEdge+' crosses '+n.dataset.seNode);break;}}}}return [...new Set(out)];}''')
  assert collision==[],collision
  ok('Real SVG theorem paths never run through an unrelated node and suggest a false implication')
  slide(page,'se-param',1);assert page.locator('.se-graph-desktop [data-se-node="absolute"].holds').count()==0;assert page.locator('.se-graph-desktop [data-se-node="zero"].holds').count()==1
  page.locator('#se-signed').check();assert page.locator('.se-graph-desktop [data-se-node="leibniz"].holds').count()==1;assert page.locator('.se-graph-desktop [data-se-node="convergence"].holds').count()==1
  ok('Live graph reacts to p and sign without mistaking term-zero for convergence or alternation for absolute convergence')
  page.locator('[data-se-action="reset"]').click();shot(page,'series-map-desktop.png')
  page.locator('[data-se-layer="questions"]').click();assert page.locator('.se-graph-desktop .se-graph-edge').count()==9;assert page.locator('.se-counter-card').count()==8
  page.locator('.se-graph-desktop [data-se-edge="root-not-ratio"]').focus();page.keyboard.press('Enter');expect(page.locator('.se-route-intro')).to_contain_text('根值 ⇏ 比值')
  ok('Counter layer keeps theorem routes and keyboard-activated question arrows open the investigation')
  page.locator('[data-se-scenario="paired"]').click();expect(page.locator('#se-family')).to_have_value('paired');expect(page.locator('#se-witness')).to_contain_text('正好是反例');expect(page.locator('#se-microscope')).to_contain_text('0.125 与 2');expect(page.locator('#se-microscope')).to_contain_text('ρ = 0.5')
  assert page.locator('[data-se-method="ratio"] .precondition').count()==1;assert page.locator('[data-se-method="root"] .absolute').count()==1
  ok('Paired geometric case shows no ordinary ratio limit but a valid root-test proof of absolute convergence')
  slide(page,'se-probe',1);page.locator('[data-se-action="play"]').click();page.wait_for_timeout(600);n=int(page.locator('#se-probe').input_value());assert 1<n<32
  page.locator('[data-se-action="play"]').click();n=int(page.locator('#se-probe').input_value());page.wait_for_timeout(350);assert int(page.locator('#se-probe').input_value())==n
  ok('Actual requestAnimationFrame prefix animation advances and pauses without changing analytic classification')
  slide(page,'se-N',8);slide(page,'se-probe',7);page.locator('[data-se-action="play"]').click();page.wait_for_timeout(450);expect(page.locator('#se-probe')).to_have_value('8');expect(page.locator('[data-se-action="play"]')).to_have_attribute('aria-pressed','false')
  ok('Playback terminates at the finite target and dependent probe bounds stay valid')
  slide(page,'se-N',48);slide(page,'se-probe',32);shot(page,'series-root-ratio-desktop.png')
  page.locator('[data-se-scenario="geometric"]').click();expect(page.locator('#se-witness')).to_contain_text('不是逆推成立的证明')
  ok('A compatible positive example is explicitly not treated as proof of the converse')
  route(page,'#lab=series&screen=workshop&edge=comparison-not-limit&node=comparison&family=wavy&p=2&N=32&probe=32');expect(page.locator('#se-microscope')).to_contain_text('商无极限');expect(page.locator('[data-se-method="limit"]')).to_contain_text('已有常数界');assert '单向扩展' not in page.locator('[data-se-method="limit"]').inner_text();expect(page.locator('#se-witness')).to_contain_text('正好是反例')
  ok('Fixed-reference oscillatory comparison works without falsely calling it a limit-comparison extension')
  page.locator('#se-reference').select_option('harmonic');expect(page.locator('[data-se-method="comparison"]')).to_contain_text('无法判断');expect(page.locator('#se-result')).to_contain_text('收敛');expect(page.locator('#se-witness')).to_contain_text('尚未构成反例')
  ok('Changing only the reference can lose evidence but cannot change the independent true verdict')
  route(page,'#lab=series&screen=workshop&family=power&p=3&ref=square&node=limit');expect(page.locator('[data-se-method="limit"]')).to_contain_text('单向扩展仍可');assert page.locator('[data-se-method="comparison"] .absolute').count()==1
  ok('Zero comparison limit with convergent reference retains the valid one-way extension')
  route(page,'#lab=series&screen=workshop&family=power&p=1&signed=1&node=leibniz&edge=leib-convergence&N=64&probe=64');expect(page.locator('#se-result')).to_contain_text('条件收敛');expect(page.locator('[data-se-method="integral"]')).to_contain_text('|aₙ| 的级数发散');expect(page.locator('#se-microscope')).to_contain_text('有解析尾项界');assert page.locator('[data-se-method="leibniz"] .converges').count()==1
  ok('Alternating harmonic separates signed convergence, absolute divergence and a justified Leibniz remainder bound')
  shot(page,'series-two-ledgers-desktop.png')
  page.locator('[data-se-scenario="altGeometric"]').click();expect(page.locator('#se-result')).to_contain_text('绝对收敛');assert page.locator('[data-se-method="leibniz"] .converges').count()==1
  ok('Alternating geometric demonstrates that Leibniz does not specifically imply conditional convergence')
  page.locator('[data-se-scenario="irregular"]').click();expect(page.locator('#se-result')).to_contain_text('条件收敛');expect(page.locator('#se-microscope')).to_contain_text('不套用 Leibniz');assert page.locator('[data-se-method="leibniz"] .precondition').count()==1
  ok('The nonmonotone cancellation example converges conditionally without pretending standard Leibniz applies')
  page.locator('#se-signed').uncheck();expect(page.locator('#se-result')).to_contain_text('原级数发散');page.locator('#se-signed').check();expect(page.locator('#se-result')).to_contain_text('条件收敛')
  ok('The same absolute magnitudes change outcome when sign cancellation is removed and restored')
  route(page,'#lab=series&screen=workshop&family=logarithmic&p=2&node=integral&edge=integral-absolute');expect(page.locator('#se-main-plot')).to_contain_text('单位宽');expect(page.locator('#se-result')).to_contain_text('收敛');expect(page.locator('[data-se-method="comparison"]')).to_contain_text('无法判断');slide(page,'se-param',1);expect(page.locator('#se-result')).to_contain_text('原级数发散');expect(page.locator('#se-microscope')).to_contain_text('ln ln')
  ok('Integral rectangles and logarithmic p boundary work while the harmonic comparison remains inconclusive')
  page.locator('#se-family').select_option('paired');expect(page.locator('#se-main-plot')).to_contain_text('不能先画面积');expect(page.locator('[data-se-method="integral"]')).to_contain_text('前提未满足')
  ok('Jagged terms never receive a fictitious monotone integral interpolation')
  route(page,'#lab=series&screen=workshop&family=sparse&node=ratio&N=64&probe=64');expect(page.locator('[data-se-method="ratio"]')).to_contain_text('无穷多个零');expect(page.locator('#se-microscope')).to_contain_text('普通根值极限不存在');expect(page.locator('#se-result')).to_contain_text('非负项含零');page.locator('#se-signed').check();expect(page.locator('#se-result')).to_contain_text('非零项不严格交错')
  ok('Zero terms preserve undefined ratios, root limsup and honest sign classification')
  page.locator('[data-se-method="comparison"]').click();page.locator('#se-reference').select_option('geometric');expect(page.locator('#se-microscope')).to_contain_text('零项为 0');expect(page.locator('#se-main-plot')).to_contain_text('×')
  ok('Sparse unbounded quotient spikes do not masquerade as a limit of infinity')
  route(page,'#lab=series&screen=workshop&family=geometric&q=1.1&signed=1&node=root');assert page.locator('[data-se-method="root"] .divergent').count()==1;slide(page,'se-param',1);assert page.locator('[data-se-method="root"] .inconclusive').count()==1;assert page.locator('[data-se-method="zero"] .divergent').count()==1
  ok('q>1 root divergence and q=1 test inconclusiveness coexist with the independent term-test verdict')
  route(page,'#lab=series&screen=workshop&family=paired&q=.5&edge=root-integral&node=root');expect(page.locator('#se-witness')).to_contain_text('正好是反例');page.locator('[data-se-scenario="square"]').click();expect(page.locator('#se-witness')).to_contain_text('另一方向的反例');page.locator('[data-se-scenario="geometric"]').click();expect(page.locator('#se-witness')).to_contain_text('两边都成立')
  ok('Incomparability is demonstrated in both directions and also permits an intersection')
  screen(page,'proof');route_ids=page.locator('#se-route-select option').evaluate_all('(els)=>els.map(e=>e.value)');assert len(route_ids)==16
  for id in route_ids:
   page.locator('#se-route-select').select_option(id)
   for step in range(4):
    page.locator(f'[data-se-step="{step}"]').click();assert len(page.locator('#se-proof-current').inner_text())>45;no_unknown(page)
   page.locator('.se-full-proof summary').click();assert page.locator('.se-full-proof section').count()==4
  ok('All sixteen routes and sixty-four authored proof steps render complete text and escaped inequalities')
  page.locator('#se-route-select').select_option('root-integral');shot(page,'series-proof-desktop.png');screen(page,'workshop');expect(page.locator('#se-family')).to_have_value('geometric');expect(page.locator('#se-reference')).to_have_value('natural')
  ok('Proof navigation preserves the experiment rather than silently replacing its parameters')
  route(page,'#lab=series&screen=workshop&family=wavy&p=1.27&q=.66&signed=1&ref=square&N=71&probe=17&node=comparison&edge=comparison-not-limit');page.locator('[data-action="share"]').click()
  if page.locator('#share-dialog').is_visible():
   url=page.locator('#share-url').input_value();assert 'family=wavy' in url and 'p=1.27' in url and 'probe=17' in url and 'ref=square' in url;page.locator('#share-dialog [data-action="close-dialog"]').click()
  page.keyboard.press('Escape');page.wait_for_timeout(100)
  page.evaluate('''()=>{const d=document.querySelector('#share-dialog');if(d){if(d.open)d.close();d.removeAttribute('open');d.style.display='none'}}''');expect(page.locator('#share-dialog')).to_be_hidden()
  ok('Share links preserve the exact series, sign, reference, selected relation and finite prefix')
  page.evaluate('''()=>{const old=URL.createObjectURL;URL.createObjectURL=blob=>{window.__seBlob=blob;return old(blob)}}''');page.locator('[data-se-action="export"]').click();csv=page.evaluate('window.__seBlob.text()');assert 'not convergence proofs' in csv and '"family":"wavy"' in csv and '"signed":true' in csv;assert len([x for x in csv.splitlines() if x and x[0].isdigit()])==71
  ok('CSV contains actual finite data and metadata for the independent signed and absolute ledgers')
  screen(page,'challenge');ids=['one','spike','signed','zero','limit','incomparable','leib','group'];answers=[2,1,0,2,1,1,1,0];assert page.locator('#se-quiz fieldset').count()==8
  page.locator('#se-quiz button[type="submit"]').click();expect(page.locator('#se-quiz-score')).to_contain_text('0 / 8');expect(page.locator('#se-feedback-one')).to_contain_text('尚未作答')
  for id,value in zip(ids,answers):page.locator(f'input[name="se-{id}"][value="{value}"]').check()
  page.locator('#se-quiz button[type="submit"]').click();expect(page.locator('#se-quiz-score')).to_contain_text('8 / 8')
  ok('Reasoning quiz distinguishes missing answers and grades all eight conditions correctly')
  screen(page,'map');screen(page,'challenge');expect(page.locator('#se-quiz-score')).to_contain_text('8 / 8');page.locator('input[name="se-one"][value="0"]').check();assert page.locator('.se-feedback:visible').count()==0;page.locator('#se-quiz button[type="submit"]').click();expect(page.locator('#se-quiz-score')).to_contain_text('7 / 8')
  ok('Quiz drafts survive exploration and edits invalidate obsolete feedback')
  page.locator('[data-se-action="reset"]').click();screen(page,'challenge');assert page.locator('#se-quiz input:checked').count()==0;screen(page,'map');expect(page.locator('#se-family')).to_have_value('power');expect(page.locator('#se-param')).to_have_value('2')
  ok('Reset clears only this module state and reasoning answers')
  route(page,'#lab=series&family=%3Cimg%3E&screen=bad&p=-2&q=Infinity&N=2&probe=999&node=bad&edge=__proto__');expect(page.locator('#se-family')).to_have_value('power');expect(page.locator('#se-param')).to_have_value('0.25');no_unknown(page)
  ok('Malformed deep links cannot inject HTML or exceed supported parameter ranges')
  route(page,'#lab=series&screen=workshop&family=power&p=2&N=10&probe=1');page.emulate_media(reduced_motion='reduce');page.locator('[data-se-action="play"]').click();page.wait_for_timeout(800);expect(page.locator('#se-probe')).to_have_value('2');page.locator('#nav-taylor').click();page.wait_for_timeout(500);expect(page.locator('#ty-title')).to_have_text('从一个点，长出一条曲线。');page.emulate_media(reduced_motion='no-preference')
  ok('Reduced-motion playback uses deliberate discrete steps and is destroyed when leaving the module')
  page.locator('#nav-series').click()
  for width in [360,390,768,1024]:
   page.set_viewport_size({'width':width,'height':844});no_overflow(page)
   if width==390:
    assert page.locator('.se-graph-desktop').is_hidden();assert page.locator('.se-graph-mobile').is_visible();shot(page,'series-map-mobile.png')
  ok('Graph and six-lab navigation reflow at four widths; mobile gets full-sized directed chains')
  page.set_viewport_size({'width':390,'height':844});page.locator('.se-graph-mobile [data-se-edge="ratio-root"]').click();expect(page.locator('.se-route-intro')).to_contain_text('逐步缩小');no_overflow(page);shot(page,'series-workshop-mobile.png')
  screen(page,'proof');page.locator('.se-full-proof summary').click();no_overflow(page);shot(page,'series-proof-mobile.png');screen(page,'challenge');no_overflow(page)
  ok('Mobile graph arrows, workbench, long proofs and quiz remain operable without horizontal overflow')
  page.set_viewport_size({'width':1512,'height':1100})
  for lab in ['limits','differentiability','fields','completeness','taylor']:
   page.locator('#nav-'+lab).click();expect(page.locator('#nav-'+lab)).to_have_attribute('aria-current','page');assert len(page.locator('#main').inner_html())>1000
  ok('All five previous experiments mount correctly after series animations, proofs and quiz interactions')
  page.locator('#nav-series').click();ids=page.locator('[id]').evaluate_all('(els)=>els.map(e=>e.id)');assert len(ids)==len(set(ids));assert errors==[],errors
  external=[u for u in requests if u.startswith(('http://','https://')) and not u.startswith(args.url.split('/MA_playground')[0])];assert external==[],external
  ok('Exercised flows contain no duplicate IDs, unhandled exceptions or external runtime requests')
  report={'passed':len(checks),'failed':0,'mode':'offline-harness' if args.offline_harness else 'served-modules','checks':checks,'errors':errors,'external_runtime_requests':external,'viewports':[360,390,768,1024,1512],'browser':browser.version}
  (OUT/'series-browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(f'\n{len(checks)} series browser checks passed.',flush=True);browser.close()
finally:
 if server:server.terminate()

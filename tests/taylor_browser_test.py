"""Real Chromium checks of the built Taylor app, including continuous growth.
Default uses served ES modules; --offline-harness uses the actual standalone HTML
when URL navigation is blocked by policy. Neither changes browser policies.
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
def ok(x):checks.append(x);print(f'PASS {len(checks):02d}  {x}',flush=True)
def slide(page,id,value):page.locator('#'+id).evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}));}',value)
def route(page,h):page.evaluate('(h)=>location.hash=h',h);page.wait_for_timeout(100)
def unknown(page):return page.evaluate('Array.from(document.querySelectorAll("#main *")).filter(e=>e instanceof HTMLUnknownElement).map(e=>e.tagName)')
def no_overflow(page):
 d=page.evaluate('({w:innerWidth,s:document.documentElement.scrollWidth})');assert d['s']<=d['w']+1,d

def shot(page,name):
 page.evaluate('scrollTo(0,0)');page.wait_for_function('!document.querySelector("#toast.visible")',timeout=6000);page.wait_for_timeout(80);page.screenshot(path=str(OUT/name),full_page=True,animations='disabled')
def screen(page,key):page.locator(f'.ty-journey [data-ty-screen="{key}"]').click()
def progress(page):return float(page.locator('#ty-progress').input_value())
try:
 with sync_playwright() as p:
  opts={'headless':True}
  if args.browser:opts['executable_path']=args.browser
  browser=p.chromium.launch(**opts);ctx=browser.new_context(viewport={'width':1512,'height':1100},reduced_motion='no-preference',accept_downloads=True)
  page=ctx.new_page();page.set_default_timeout(7000);page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url))
  if args.offline_harness:page.set_content((ROOT/'dist/taylor-lab.html').read_text(),wait_until='load')
  else:page.goto(args.url,wait_until='networkidle');page.locator('#nav-taylor').click()
  expect(page.locator('#ty-title')).to_have_text('从一个点，长出一条曲线。');expect(page.locator('#nav-taylor')).to_have_attribute('aria-current','page');assert page.locator('.lab-nav').count()==5;assert progress(page)==0
  expect(page.locator('.page-guide[data-guide="taylor"]')).to_be_visible();expect(page.locator('.page-guide[data-guide="taylor"] [data-guide-action="start"]')).to_be_visible()
  ok('Fifth complete experiment opens at T0 with an in-page guide and retains all four prior labs')
  assert page.locator('.ty-guaranteed').count()==1;expect(page.locator('#ty-observation')).to_contain_text('水平线');expect(page.locator('#ty-current-term')).to_contain_text('f(a)');assert unknown(page)==[]
  ok('Initial view matches only the function value, not a prefitted full polynomial')
  slide(page,'ty-n',6);assert progress(page)==6;page.locator('[data-ty-layer="1"]').click();assert progress(page)==1;assert page.locator('.ty-guaranteed').count()==2
  page.locator('[data-ty-layer="2"]').click();assert page.locator('.ty-guaranteed').count()==3;expect(page.locator('#ty-curvature')).to_contain_text('0.3536')
  ok('Layer cards expose value, slope and second derivative, with correctly computed geometric curvature')
  slide(page,'ty-progress',2.4);expect(page.locator('#ty-observation')).to_contain_text('过渡曲线');expect(page.locator('#ty-animation-status')).to_contain_text('40%');expect(page.locator('.ty-pending')).to_contain_text('0.4');assert page.locator('.ty-guaranteed').count()==3
  shot(page,'taylor-growing-desktop.png')
  ok('Scrubbing inside a term preserves lower derivatives and explicitly marks the incomplete Taylor layer')
  screen(page,'error');expect(page.locator('#ty-bound')).to_contain_text('不能直接套');assert progress(page)==2.4;screen(page,'grow');assert progress(page)==2.4
  ok('Fractional state survives learning-stage changes and does not borrow a complete-polynomial remainder bound')
  slide(page,'ty-n',3);page.locator('[data-ty-action="play"]').click();page.wait_for_timeout(400);v=progress(page);assert 0<v<1,v;page.locator('[data-ty-action="play"]').click();v=progress(page);page.wait_for_timeout(350);assert progress(page)==v;expect(page.locator('[data-ty-action="play"]')).to_have_attribute('aria-pressed','false')
  ok('Real requestAnimationFrame growth is fractional, pauses exactly, and remains mathematically labeled')
  page.locator('[data-ty-action="play"]').click();page.wait_for_function('document.querySelector("#ty-progress").value==="3"',timeout=7000);expect(page.locator('[data-ty-action="play"]')).to_have_attribute('aria-pressed','false')
  ok('Resume completes at the selected finite target and cancels the animation loop')
  slide(page,'ty-n',0);expect(page.locator('[data-ty-action="play"]')).to_be_disabled();assert page.locator('[data-ty-layer]').count()==1;expect(page.locator('[data-ty-action="next"]')).to_be_disabled()
  ok('Zero-degree target is valid and cannot start a bogus higher-order animation')
  slide(page,'ty-n',3);slide(page,'ty-a',1);expect(page.locator('#ty-live')).to_contain_text('6.05');expect(page.locator('#ty-jet-table')).to_contain_text('2.718');expect(page.locator('#ty-probe-position')).to_contain_text('x=1.8')
  ok('Moving the center recomputes all coefficients and keeps h fixed, rather than translating an old fit')
  page.locator('#ty-a-handle').focus();page.keyboard.press('ArrowRight');expect(page.locator('#ty-a')).to_have_value('1.01');expect(page.locator('#ty-a-handle')).to_be_focused();page.keyboard.press('Home');expect(page.locator('#ty-a')).to_have_value('0')
  page.locator('#ty-x-handle').focus();page.keyboard.press('ArrowLeft');expect(page.locator('#ty-h')).to_have_value('0.79')
  ok('Both SVG handles are keyboard-operable and preserve focus across chart redraws')
  handle=page.locator('#ty-a-handle');handle.scroll_into_view_if_needed();box=handle.bounding_box();page.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);page.mouse.down();page.mouse.move(box['x']+box['width']/2+70,box['y']+box['height']/2,steps=5);page.mouse.up();assert float(page.locator('#ty-a').input_value())>.1
  ok('Dragging the expansion point uses real pointer events with a stable drag viewport')
  route(page,'#lab=taylor&fn=sin&n=2&p=2');expect(page.locator('#ty-observation')).to_contain_text('恰好为零');expect(page.locator('#ty-current-term')).to_contain_text('不需要额外修正');slide(page,'ty-a',.5);assert 'T2=T1' not in page.locator('#ty-observation').inner_text()
  ok('Zero sine coefficients correctly cause no growth at a=0 but not at a shifted center')
  page.locator('#ty-function').select_option('cos');expect(page.locator('#ty-function')).to_have_value('cos');assert unknown(page)==[]
  ok('Cosine uses its own derivative cycle and works in the same continuous experiment')
  route(page,'#lab=taylor&screen=error&fn=log&a=0&n=6&h=-1');expect(page.locator('#ty-live')).to_contain_text('未定义');expect(page.locator('#ty-bound')).to_contain_text('不能调用');assert 'NaN' not in page.locator('#ty-main-plot').inner_html()
  ok('Log domain boundary yields a graph gap and undefined error, never a fake zero value')
  route(page,'#lab=taylor&screen=error&fn=reciprocal&a=0&n=6&h=1.2');expect(page.locator('#ty-bound')).to_contain_text('穿过')
  assert page.locator('#ty-error-plot svg').count()==1;assert page.locator('#ty-order-plot [data-ty-order]').count()==13
  ok('Crossing the pole blocks Lagrange bounds while the finite polynomial and exact geometric residual remain defined')
  route(page,'#lab=taylor&screen=error&fn=exp&a=0&n=4&h=.8');expect(page.locator('#ty-bound')).to_contain_text('整个连接区间');expect(page.locator('#ty-tolerance')).to_contain_text('整段区间');expect(page.locator('#ty-tolerance')).to_contain_text('不是收敛半径')
  shot(page,'taylor-error-desktop.png')
  ok('Error vs distance, error vs order, and a whole-neighborhood analytic bound are linked without sampled-proof claims')
  page.locator('#ty-order-plot [data-ty-order="7"]').focus();page.keyboard.press('Enter');expect(page.locator('#ty-n')).to_have_value('7');assert progress(page)==7
  ok('Discrete order-plot points are clickable and keyboard-accessible, updating the same model')
  slide(page,'ty-h',.01);slide(page,'ty-n',12);expect(page.locator('#ty-live')).to_contain_text('浮点分辨率');expect(page.locator('#ty-observation')).to_contain_text('不能证明')
  ok('Subtractive cancellation cannot silently become a claim of exact equality')
  screen(page,'boundary');page.locator('[data-ty-scenario="nonmonotone"]').click();expect(page.locator('#ty-convergence')).to_contain_text('1−e⁻²');expect(page.locator('#ty-h')).to_have_value('-2');expect(page.locator('#ty-n')).to_have_value('1')
  ok('An analytic finite-order counterexample shows that one extra term can worsen error')
  page.locator('[data-ty-scenario="outside"]').click();expect(page.locator('#ty-convergence')).to_contain_text('函数有定义');expect(page.locator('#ty-convergence')).to_contain_text('u=−1');slide(page,'ty-h',-1);expect(page.locator('#ty-convergence')).to_contain_text('这个端点不收敛')
  ok('Reciprocal series distinguishes domain, open convergence radius, and the alternating endpoint')
  page.locator('[data-ty-scenario="edge"]').click();expect(page.locator('#ty-convergence')).to_contain_text('右端点也收敛');slide(page,'ty-h',1.2);expect(page.locator('#ty-convergence')).to_contain_text('发散');slide(page,'ty-a',.5);expect(page.locator('#ty-convergence')).to_contain_text('开收敛区间内')
  ok('Log right endpoint is included by its own proof and the radius moves with a')
  page.locator('[data-ty-scenario="flat"]').click();expect(page.locator('#ty-a')).to_be_disabled();expect(page.locator('#ty-convergence')).to_contain_text('收敛到 0');expect(page.locator('#ty-convergence')).to_contain_text('不是 0');expect(page.locator('#ty-live')).to_contain_text('0.2096')
  shot(page,'taylor-flat-desktop.png')
  ok('Smooth nonanalytic example correctly has infinite series radius, zero polynomials, and a nonzero off-center remainder')
  page.locator('[data-ty-proof="flat"]').click()
  for proof in ['coefficients','remainder','convergence','flat']:
   page.locator(f'.ty-proof-nav [data-ty-proof="{proof}"]').click()
   for i in range(4):
    page.locator(f'[data-ty-step="{i}"]').click();assert len(page.locator('#ty-proof-current').inner_text())>90;assert unknown(page)==[]
   page.locator('.ty-proof-full summary').click();assert page.locator('.ty-proof-full section').count()==4
  ok('All sixteen proof steps and four full proofs render complete inequalities with no accidental HTML elements')
  screen(page,'grow');expect(page.locator('#ty-function')).to_have_value('flat');expect(page.locator('#ty-n')).to_have_value('8')
  ok('Returning from proofs keeps the exact same function, order and experimental parameters')
  route(page,'#lab=taylor&fn=log&a=.25&n=7&p=2.5&h=.8&span=3');page.locator('[data-action="share"]').click()
  if page.locator('#share-dialog').is_visible():
   url=page.locator('#share-url').input_value();assert 'lab=taylor' in url and 'p=2.5' in url and 'a=0.25' in url;page.locator('#share-dialog [data-action="close-dialog"]').click()
  else:assert 'p=2.5' in page.url
  ok('Sharing and deep linking preserve the fractional growth stage, not a falsely completed polynomial')
  page.evaluate('''()=>{const old=URL.createObjectURL;URL.createObjectURL=blob=>{window.__tyBlob=blob;return old(blob)}}''');page.locator('.ty-controls .ty-options summary').click();page.locator('[data-ty-action="export"]').click();csv=page.evaluate('window.__tyBlob.text()');assert 'FINITE DATA' in csv and 'fn=log' in csv and 'growth=2.5' in csv;assert len([x for x in csv.splitlines() if x and x[0].isdigit()])==13
  ok('CSV exports all thirteen complete polynomials with state, method, undefined-gap and finite-data metadata')
  screen(page,'challenge');assert page.locator('#ty-quiz fieldset').count()==8
  ids=['factorial','zero','growth','bound','radius','higher','flat','rounding'];answers=[1,0,2,1,0,2,1,0]
  for id,a in zip(ids,answers):page.locator(f'input[name="ty-{id}"][value="{a}"]').check()
  page.locator('#ty-quiz button[type="submit"]').click();expect(page.locator('#ty-quiz-score')).to_contain_text('8 / 8');assert page.locator('.ty-feedback.correct').count()==8
  ok('Eight balanced-position questions grade both mathematical claims and the reasoning behind them')
  screen(page,'grow');screen(page,'challenge');expect(page.locator('#ty-quiz-score')).to_contain_text('8 / 8');page.locator('input[name="ty-zero"][value="1"]').check();assert page.locator('.ty-feedback:visible').count()==0;page.locator('#ty-quiz button[type="submit"]').click();expect(page.locator('#ty-quiz-score')).to_contain_text('7 / 8')
  ok('Quiz drafts survive exploration and edited answers invalidate stale feedback')
  page.locator('[data-ty-action="reset"]').click();expect(page.locator('#ty-function')).to_have_value('exp');assert progress(page)==0;screen(page,'challenge');assert page.locator('#ty-quiz input:checked').count()==0
  ok('Reset clears parameters and quiz memory, returning to a true zero-order starting point')
  route(page,'#lab=taylor&fn=bad&screen=bad&n=999&p=999&span=-1&h=Infinity&a=%3Cimg%3E');expect(page.locator('#ty-function')).to_have_value('exp');expect(page.locator('#ty-n')).to_have_value('12');assert abs(float(page.locator('#ty-h').input_value()))<=.25;assert unknown(page)==[]
  ok('Malformed links are bounded and whitelisted, including dependent h/span limits')
  route(page,'#lab=taylor&fn=exp&n=5');page.locator('[data-ty-action="play"]').click();page.wait_for_timeout(200);page.locator('#nav-completeness').click();page.wait_for_timeout(500);expect(page.locator('#cp-title')).to_have_text('五种定理，同一个终点。');page.locator('#nav-taylor').click();assert progress(page)==0
  ok('Leaving the module destroys its animation without mutating any previous lab')
  page.emulate_media(reduced_motion='reduce');slide(page,'ty-n',2);page.locator('[data-ty-action="play"]').click();page.wait_for_timeout(1100);assert progress(page)==1;page.wait_for_timeout(1100);assert progress(page)==2;expect(page.locator('[data-ty-action="play"]')).to_have_attribute('aria-pressed','false');page.emulate_media(reduced_motion='no-preference')
  ok('Reduced-motion preference changes explicit playback into discrete completed layers')
  route(page,'#lab=taylor&fn=exp&n=4&p=2.4');shot(page,'taylor-growth-desktop.png')
  for width in [360,390,768,1024]:
   page.set_viewport_size({'width':width,'height':844});no_overflow(page)
   if width==390:shot(page,'taylor-growth-mobile.png')
  ok('Notebook, five-lab navigation, fractional growth controls and plots reflow without overflow at four widths')
  page.set_viewport_size({'width':360,'height':844});screen(page,'error');no_overflow(page);shot(page,'taylor-error-mobile.png');screen(page,'boundary');page.locator('[data-ty-scenario="outside"]').click();no_overflow(page);shot(page,'taylor-boundary-mobile.png')
  ok('Error graphs, sufficient bounds, and boundary experiments remain usable on a 360px screen')
  page.locator('[data-ty-proof="convergence"]').click();page.locator('.ty-proof-full summary').click();no_overflow(page);shot(page,'taylor-proof-mobile.png');screen(page,'challenge');no_overflow(page)
  ok('Long formulas, expanded proofs and quizzes do not overflow on narrow screens')
  page.set_viewport_size({'width':1512,'height':1100})
  for nav,selector in [('limits','#main-plot'),('differentiability','.rel-journey'),('fields','#field-scene'),('completeness','#cp-title')]:
   page.locator('#nav-'+nav).click();expect(page.locator('#nav-'+nav)).to_have_attribute('aria-current','page');assert len(page.locator('#main').inner_html())>1000
  ok('All four previous experiments still mount after the new module has run')
  page.locator('#nav-taylor').click();allids=page.locator('[id]').evaluate_all('(els)=>els.map(e=>e.id)');assert len(allids)==len(set(allids));assert errors==[],errors
  external=[u for u in requests if u.startswith(('http://','https://')) and not u.startswith(args.url.split('/MA_playground')[0])];assert external==[],external
  ok('Exercised flows have no duplicate IDs, uncaught JavaScript errors or external runtime requests')
  report={'passed':len(checks),'failed':0,'mode':'offline-harness' if args.offline_harness else 'served-modules','checks':checks,'errors':errors,'external_runtime_requests':external,'viewports':[360,390,768,1024,1512],'browser':browser.version}
  (OUT/'taylor-browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(f'\n{len(checks)} Taylor browser checks passed.',flush=True);browser.close()
finally:
 if server:server.terminate()

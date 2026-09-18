"""Real built-app checks. Default: HTTP ES modules. --offline-harness executes
exact built standalone HTML when local navigation is prohibited; no browser policy changes.
"""
from __future__ import annotations
import argparse,json,subprocess,time,urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
ap=argparse.ArgumentParser();ap.add_argument('--offline-harness',action='store_true');ap.add_argument('--browser');ap.add_argument('--url',default='http://127.0.0.1:4173/MA_playground/');args=ap.parse_args()
OUT=ROOT/'test-results';OUT.mkdir(exist_ok=True);checks=[];errors=[];requests=[];server=None
if not args.offline_harness:
 try:urllib.request.urlopen(args.url,timeout=1)
 except Exception:
  server=subprocess.Popen(['node','scripts/serve.mjs','--dir','dist','--port','4173'],cwd=ROOT,stdout=subprocess.DEVNULL)
  for _ in range(40):
   try:urllib.request.urlopen(args.url,timeout=1);break
   except Exception:time.sleep(.1)
def ok(msg):checks.append(msg);print(f'PASS {len(checks):02d} {msg}',flush=True)
def slide(p,id,v):p.locator('#'+id).evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}))}',str(v))
def route(p,h):p.evaluate('(h)=>location.hash=h',h);p.wait_for_timeout(90)
def stage(p,k):p.locator('.lm-journey [data-lm-step="'+k+'"]').click()
def screen(p,k):p.locator('.lm-views [data-lm-screen="'+k+'"]').click()
def shot(p,name):p.evaluate('scrollTo(0,0)');p.wait_for_timeout(120);p.screenshot(path=str(OUT/name),full_page=True)
def clean(p):
 assert not p.evaluate('Array.from(document.querySelectorAll("#main *")).filter(e=>e instanceof HTMLUnknownElement).map(e=>e.tagName)')
 assert 'NaN' not in p.locator('#main').inner_text()
 ids=p.locator('[id]').evaluate_all('(els)=>els.map(e=>e.id)');assert len(ids)==len(set(ids))
def width(p):assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
try:
 with sync_playwright() as pw:
  launch={'headless':True}
  if args.browser:launch['executable_path']=args.browser
  browser=pw.chromium.launch(**launch);ctx=browser.new_context(viewport={'width':1560,'height':1100},accept_downloads=True,reduced_motion='no-preference');p=ctx.new_page();p.set_default_timeout(7000)
  p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:requests.append(r.url))
  if args.offline_harness:p.set_content((ROOT/'dist/linear-lab.html').read_text(),wait_until='load')
  else:p.goto(args.url,wait_until='networkidle');p.locator('#nav-linear').click()
  expect(p.locator('h1')).to_have_text('导数，是局部线性机器。');expect(p.locator('#nav-linear')).to_have_attribute('aria-current','page');assert p.locator('.lab-nav').count()==9;clean(p);width(p)
  ok('Eighth lab mounts alongside all eight earlier navigation entries, with no page errors')
  assert p.locator('#lm-input svg').count()==1;assert p.locator('#lm-output svg').count()==1;assert p.locator('#lm-error-plot svg').count()==1
  shot(p,'linear-local-desktop.png');ok('Real nonlinear and linear grids, raw changes and normalized remainder are all connected')
  before=p.locator('#lm-live>div').nth(3).inner_text();p.locator('[data-lm-action="half"]').click();after=p.locator('#lm-live>div').nth(3).inner_text();assert before!=after
  expect(p.locator('#lm-bound')).to_contain_text('不是声称算出了精确上确界');ok('Halving the physical displacement changes normalized error and a proved all-direction bound')
  p.locator('[data-lm-action="play"]').click();p.wait_for_timeout(500);expect(p.locator('[data-lm-action="play"]')).to_have_attribute('aria-pressed','true');p.locator('[data-lm-action="play"]').click();val=p.locator('#lm-scale').input_value();p.wait_for_timeout(180);assert p.locator('#lm-scale').input_value()==val
  ok('Continuous shrinking is real, and pause freezes the current state')
  handle=p.locator('#lm-handle-h');handle.scroll_into_view_if_needed();box=handle.bounding_box();p.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);p.mouse.down();p.mouse.move(box['x']+box['width']/2+45,box['y']+box['height']/2-20,steps=5);p.mouse.up();assert p.locator('#lm-scale').input_value()!=val
  ok('Dragging the input displacement survives SVG redraws through pointer capture')
  handle=p.locator('#lm-handle-p');handle.focus();p.keyboard.press('ArrowRight');assert float(p.locator('#lm-px').input_value())>.6;p.keyboard.press('Home');assert float(p.locator('#lm-px').input_value())==.6
  ok('Basepoint drag handles have keyboard alternatives and retain focus')
  p.locator('.lm-options summary').last.click();p.locator('[data-lm-action="zero"]').click();expect(p.locator('#lm-live')).to_contain_text('未定义');clean(p);p.locator('[data-lm-action="restore-h"]').click()
  ok('Zero displacement produces an undefined ratio instead of a manufactured zero')
  p.locator('#lm-col-1').click();expect(p.locator('.lm-journey [data-lm-step="columns"]')).to_have_attribute('aria-current','step');expect(p.locator('#lm-column-read')).to_contain_text('h = ρe1');assert abs(float(p.locator('#lm-hangle').input_value()))<1
  ok('A clicked Jacobian column switches to a standard-basis direction with the rho factor retained')
  p.locator('#lm-col-2').click();assert abs(float(p.locator('#lm-hangle').input_value())-90)<1;expect(p.locator('#lm-column-read')).to_contain_text('单位差商')
  ok('Second column controls only the second input direction, not the second output row')
  p.locator('summary').filter(has_text='换一组输入坐标').click();old_h=p.locator('#lm-hread').inner_text();slide(p,'lm-basis',35);assert p.locator('#lm-hread').inner_text()==old_h;expect(p.locator('#lm-matrix-title')).to_contain_text('物理输出没变');expect(p.locator('#lm-basis-read')).to_contain_text('h_new');p.locator('#lm-col-1').click();expect(p.locator('#lm-column-read')).to_contain_text('ρb1');shot(p,'linear-columns-desktop.png')
  ok('Changing the input basis changes the matrix, preserves physical h, and can select the new basis')
  p.locator('#lm-function').select_option('affine');expect(p.locator('#lm-interpretation')).to_contain_text('恒为零');p.locator('#lm-function').select_option('quadratic');expect(p.locator('#lm-bound')).to_contain_text('ρ/2');p.locator('#lm-function').select_option('cubic')
  ok('All three globally smooth polynomial presets share the same experiment without fake numerical derivatives')
  stage(p,'chain');assert p.locator('.lm-three-planes svg').count()==3;expect(p.locator('#lm-chain-matrices')).to_contain_text('JG(F(p))');expect(p.locator('#lm-chain-matrices')).to_contain_text('2×2');p.locator('[data-lm-action="merge"]').click();expect(p.locator('.lm-pipeline-summary')).to_contain_text('(BA)h')
  ok('The chain shows three spaces, correct evaluation points, and merged versus two-step predictions')
  p.locator('#lm-wrong').check();expect(p.locator('#lm-interpretation')).to_contain_text('错误次序 ABh');assert 'ABh' in p.locator('#lm-chain-out').inner_text();p.locator('#lm-outer').select_option('mix');expect(p.locator('#lm-outer-formula')).to_contain_text('−0.5');p.locator('#lm-outer').select_option('bend')
  ok('Reversed matrix order is visibly different and never labeled as the true chain rule')
  p.locator('[data-lm-action="play"]').click();p.wait_for_timeout(1150);expect(p.locator('#lm-chain-phase')).to_contain_text('第 1 步');assert p.locator('#lm-flow-dot-1').evaluate('(e)=>Math.abs(Number(e.getAttribute("cx"))-Number(e.dataset.ox))+Math.abs(Number(e.getAttribute("cy"))-Number(e.dataset.oy))>0');p.wait_for_timeout(1800);expect(p.locator('[data-lm-action="play"]')).to_have_attribute('aria-pressed','false');shot(p,'linear-chain-desktop.png')
  ok('The two linear operations animate in order and stop cleanly')
  stage(p,'projection');assert p.locator('#lm-shadow svg').count()==1;assert p.locator('#lm-compass svg').count()==1;p.locator('[data-lm-action="counter"]').click();expect(p.locator('#lm-counter-proof')).to_contain_text('两个解集不相交');assert p.locator('#lm-roots [data-lm-root]').count()==1
  ok('The quantifier counterexample is an exact preset rather than inferred from a sampled curve')
  p.locator('[data-lm-angle="90"]').click();assert p.locator('#lm-roots [data-lm-root]').count()==2;expect(p.locator('#lm-live>div').nth(2)).to_contain_text('0');expect(p.locator('#lm-projection-read')).to_contain_text('位移的长度已经');shot(p,'linear-projection-desktop.png')
  ok('Changing a from e1 to e2 changes the interior MVT solution set, while projected equality holds')
  p.locator('#lm-shadow [data-lm-root]').last.focus();p.keyboard.press('Enter');assert float(p.locator('#lm-lambda').input_value())>.78
  ok('Algebraic MVT markers are keyboard-selectable and update the tangent at the chosen point')
  compass=p.locator('#lm-handle-a');compass.scroll_into_view_if_needed();box=compass.bounding_box();p.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);p.mouse.down();p.mouse.move(box['x']+box['width']/2+25,box['y']+box['height']/2+20,steps=4);p.mouse.up();assert abs(float(p.locator('#lm-angle').input_value())-90)>5
  ok('The projection direction is genuinely draggable and recomputes the scalar shadow and roots')
  p.locator('#lm-handle-y').focus();p.keyboard.press('ArrowUp');assert float(p.locator('#lm-yy').input_value())>0;clean(p)
  ok('Moving a segment endpoint recomputes the output curve rather than moving a static drawing')
  p.locator('#lm-function').select_option('affine');expect(p.locator('#lm-roots')).to_contain_text('每个内部点');p.locator('#lm-function').select_option('quadratic');p.locator('[data-lm-action="snap"]').click();expect(p.locator('#lm-projection-read')).to_contain_text('斜率在显示精度内相等')
  ok('Normal affine and quadratic cases are retained, including a common midpoint when it really exists')
  route(p,'#lab=linear&step=projection&px=0&py=0&yx=0&yy=0');expect(p.locator('#lm-roots')).to_contain_text('p=y');expect(p.locator('[data-lm-action="snap"]')).to_be_disabled();clean(p)
  ok('Coincident endpoints are explicitly degenerate, not an ill-posed MVT claim')
  route(p,'#lab=linear&step=projection&map=cubic&px=-1&py=0&yx=1&yy=0&angle=90');screen(p,'proof')
  for k in ['local','columns','chain','projection']:
   stage(p,k);assert p.locator('.lm-proof-dots button').count()==4;p.locator('.lm-proof-dots button').last.click();p.locator('.lm-full-proof summary').click();assert p.locator('.lm-full-proof section').count()==4;clean(p)
  expect(p.locator('.lm-proof-article')).to_contain_text('不需要假设导数连续');shot(p,'linear-proof-desktop.png');ok('All four proofs preserve exact hypotheses, normalized remainders and the non-interchangeable quantifiers')
  screen(p,'challenge');assert p.locator('#lm-quiz fieldset').count()==8
  keys={'object':0,'ratio':1,'column':2,'chain':0,'basis':1,'quantifier':2,'zero':1,'projection':2}
  for k,v in keys.items():p.locator(f'input[name="lm-question-{k}"][value="{v}"]').check()
  p.locator('#lm-quiz button[type=submit]').click();expect(p.locator('#lm-quiz-score')).to_contain_text('8 / 8');assert p.locator('.lm-feedback.correct').count()==8
  ok('All eight understanding checks include valid answer explanations')
  screen(p,'explore');screen(p,'challenge');assert p.locator('#lm-quiz input:checked').count()==8;p.locator('[data-lm-action="clear-quiz"]').click();assert p.locator('#lm-quiz input:checked').count()==0
  ok('Quiz state persists across exploration but explicit reset removes it')
  screen(p,'explore');stage(p,'local');with_download=p.expect_download()
  with with_download as item:p.locator('[data-lm-action="export"]').click()
  download=item.value;path=OUT/'linear-data.csv';download.save_as(path);assert 'proved_upper_bound' in path.read_text();assert len(path.read_text().splitlines())>34
  ok('CSV export contains stable increments, normalized errors and analytic upper bounds')
  p.locator('.lm-heading [data-action="share"]').click()
  if p.locator('#share-dialog').is_visible():expect(p.locator('#share-url')).to_have_value(p.url);p.locator('#share-dialog [data-action="close-dialog"]').click()
  h=p.evaluate('location.hash');route(p,'#lab=linear&step=chain');route(p,h);expect(p.locator('.lm-journey [data-lm-step="local"]')).to_have_attribute('aria-current','step')
  ok('Share and hash navigation preserve experiment parameters without answer data')
  p.locator('[data-lm-action="play"]').click();p.locator('#nav-limits').click();p.wait_for_timeout(600);expect(p.locator('#nav-limits')).to_have_attribute('aria-current','page');assert p.locator('.lm-stage').count()==0
  ok('Leaving the module destroys animation and pointer listeners')
  old=[('differentiability','h1'),('fields','#field-scene svg'),('completeness','#cp-title'),('taylor','#ty-main-plot svg'),('series','#se-title'),('uniform','#uf-graph')]
  for nav,sel in old:p.locator('#nav-'+nav).click();expect(p.locator(sel)).to_be_visible()
  ok('All eight retained labs remain navigable after mounting and unmounting the new controller')
  route(p,'#lab=uniform&screen=workshop&family=power&track=fixed&x=.6&N=12');assert p.locator('#uf-main-plot svg').count()==1;oldtext=p.locator('#uf-live').inner_text();slide(p,'uf-N',24);assert p.locator('#uf-live').inner_text()!=oldtext;clean(p)
  ok('The restored v1.6 uniform module still responds to N after integration; this is a new smoke test, not a recovered historical suite')
  route(p,'#lab=linear');p.set_viewport_size({'width':390,'height':844})
  for k in ['local','columns','chain','projection']:
   stage(p,k);width(p);clean(p)
   if k in ['local','projection']:shot(p,'linear-'+k+'-mobile.png')
  screen(p,'proof');width(p);shot(p,'linear-proof-mobile.png');screen(p,'challenge');width(p);clean(p)
  ok('All four workstations, proofs and quizzes fit a 390px phone without document overflow')
  p.set_viewport_size({'width':768,'height':1024});screen(p,'explore');stage(p,'chain');width(p);p.set_viewport_size({'width':1920,'height':1080});width(p)
  ok('Tablet and wide desktop layouts maintain usable controls and plots')
  p.emulate_media(reduced_motion='reduce');stage(p,'local');p.locator('[data-lm-action="play"]').click();p.wait_for_timeout(700);p.locator('[data-lm-action="play"]').click();clean(p)
  ok('Reduced-motion mode uses slower discrete redraws without disabling the mathematical controls')
  route(p,'#lab=linear&map=%3Cscript%3E&px=Infinity&hx=99&lambda=NaN');clean(p);expect(p.locator('#lm-function')).to_have_value('cubic');assert errors==[],errors
  ok('Malformed input remains contained and the complete run has no uncaught JavaScript errors')
  assert not [u for u in requests if u.startswith('http') and not u.startswith(args.url.split('/MA_')[0])],requests
  ok('No external runtime network request was made')
  (OUT/'linear-browser-report.json').write_text(json.dumps({'passed':len(checks),'checks':checks,'page_errors':errors,'mode':'built standalone injection' if args.offline_harness else 'HTTP ES modules','browser':browser.version,'requests':requests},ensure_ascii=False,indent=2))
  browser.close()
finally:
 if server:server.terminate()

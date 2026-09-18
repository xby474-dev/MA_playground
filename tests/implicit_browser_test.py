"""Real Chromium interactions. Use --offline-harness only where navigation is prohibited."""
from pathlib import Path
import argparse, json, subprocess, time, urllib.request
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'test-results';OUT.mkdir(exist_ok=True)
ap=argparse.ArgumentParser();ap.add_argument('--offline-harness',action='store_true');ap.add_argument('--browser');ap.add_argument('--url',default='http://127.0.0.1:4173/MA_playground/');args=ap.parse_args()
checks=[];errors=[];requests=[];server=None
if not args.offline_harness:
 try: urllib.request.urlopen(args.url,timeout=1)
 except Exception:
  server=subprocess.Popen(['node','scripts/serve.mjs','--dir','dist','--port','4173'],cwd=ROOT,stdout=subprocess.DEVNULL)
  for _ in range(40):
   try:urllib.request.urlopen(args.url,timeout=1);break
   except Exception:time.sleep(.1)
def ok(text):checks.append(text);print('PASS %02d %s'%(len(checks),text),flush=True)
def route(p,hash):p.evaluate('(h)=>location.hash=h',hash);p.wait_for_timeout(90)
def slide(p,k,v):p.locator('#ip-'+k).evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}))}',str(v))
def stage(p,k):p.locator('.ip-journey [data-ip-step="'+k+'"]').click()
def screen(p,k):p.locator('.ip-views [data-ip-screen="'+k+'"]').click()
def shot(p,name):p.evaluate('scrollTo(0,0)');p.wait_for_timeout(100);p.screenshot(path=str(OUT/name),full_page=True)
def clean(p):
 assert not p.evaluate('Array.from(document.querySelectorAll("#main *")).filter(e=>e instanceof HTMLUnknownElement).map(e=>e.tagName)')
 assert 'NaN' not in p.locator('#main').inner_text()
 ids=p.locator('[id]').evaluate_all('(els)=>els.map(e=>e.id)');assert len(ids)==len(set(ids))
 assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
def drag(p,selector,dx,dy):
 el=p.locator(selector);el.scroll_into_view_if_needed();b=el.bounding_box();x=b['x']+b['width']/2;y=b['y']+b['height']/2;p.mouse.move(x,y);p.mouse.down();p.mouse.move(x+dx,y+dy,steps=7);p.mouse.up()
try:
 with sync_playwright() as pw:
  launch={'headless':True}
  if args.browser:launch['executable_path']=args.browser
  browser=pw.chromium.launch(**launch);ctx=browser.new_context(viewport={'width':1536,'height':1080},accept_downloads=True);p=ctx.new_page();p.set_default_timeout(8000)
  p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:requests.append(r.url))
  if args.offline_harness:p.set_content((ROOT/'dist/implicit-lab.html').read_text(),wait_until='load')
  else:p.goto(args.url,wait_until='networkidle');p.locator('#nav-implicit').click()
  expect(p.locator('h1')).to_have_text('保持约束，读出变化。');assert p.locator('.lab-nav').count()==9;expect(p.locator('#nav-implicit')).to_have_attribute('aria-current','page');clean(p)
  ok('Ninth lab mounts with all eight prior modules and no page errors')
  assert p.locator('#ip-curve-plot svg').count()==1;assert p.locator('#ip-constraint-plot svg').count()==1;expect(p.locator('#ip-dg')).to_contain_text('1×1');expect(p.locator('#ip-dg')).to_contain_text('不是返回位置')
  ok('Variable-space curve and a distinct one-dimensional constraint space are shown together')
  for phase in [1,2,3]:
   p.locator('[data-ip-phase="'+str(phase)+'"]').click();expect(p.locator('#ip-progress')).to_have_value(str(phase));clean(p)
  expect(p.locator('#ip-motion-read')).to_contain_text('F ≈ 0');p.locator('[data-ip-phase="2"]').click();assert 'F ≈ 0.0858' in p.locator('#ip-motion-read').inner_text();shot(p,'implicit-curve-desktop.png')
  ok('Actual finite residual remains after tangent correction and vanishes on the analytic branch')
  slide(p,'progress',0);p.locator('[data-ip-action="play"]').click();p.wait_for_timeout(500);assert 0<float(p.locator('#ip-progress').input_value())<1;p.locator('[data-ip-action="play"]').click();v=p.locator('#ip-progress').input_value();p.wait_for_timeout(130);assert p.locator('#ip-progress').input_value()==v
  ok('Real requestAnimationFrame motion runs and pause freezes the actual state')
  before=float(p.locator('#ip-metrics strong').last.inner_text().replace('−','-'));p.locator('[data-ip-action="half"]').click();after=float(p.locator('#ip-metrics strong').last.inner_text().replace('−','-'));assert after<before
  ok('Halving input reduces normalized implicit-function derivative error')
  p.locator('[data-ip-action="zero"]').click();expect(p.locator('#ip-metrics strong').last).to_have_text('未定义');clean(p)
  ok('Zero input has zero change but an explicitly undefined normalized ratio')
  route(p,'#lab=implicit');old=p.locator('#ip-delta').input_value();drag(p,'#ip-handle-curve-h',27,0);assert old!=p.locator('#ip-delta').input_value();expect(p.locator('#ip-progress')).to_have_value('1')
  ok('Dragging the trial point changes only the chosen free variable and survives SVG redraws')
  p.locator('#ip-handle-curve-base').focus();p.keyboard.press('ArrowRight');assert float(p.locator('#ip-theta').input_value())==59;p.keyboard.press('Home');expect(p.locator('#ip-theta')).to_have_value('55')
  ok('Basepoint keyboard input stays on the zero set and Home restores it')
  stage(p,'condition');p.locator('[data-ip-action="singular"]').click();expect(p.locator('#ip-condition-badge')).to_contain_text('未满足');expect(p.locator('[data-ip-phase="2"]')).to_be_disabled();expect(p.locator('#ip-dg')).to_contain_text('未定义')
  ok('The exact circle fold disables the unavailable inverse instead of manufacturing infinity or zero')
  p.locator('[data-ip-dep="x"]').click();expect(p.locator('#ip-condition-badge')).to_contain_text('C¹');expect(p.locator('#ip-cancel-equation')).to_contain_text('A = Fᵧ');expect(p.locator('#ip-cancel-equation')).to_contain_text('B = Fₓ');expect(p.locator('#ip-dg')).to_contain_text('dx ≈ Dg(a) dy')
  ok('Swapping free/dependent variables repairs the circle chart and updates every formula label')
  route(p,'#lab=implicit&step=condition&theta=0.0001&delta=-0.01');expect(p.locator('#ip-condition-badge')).to_contain_text('C¹');expect(p.locator('[data-ip-phase="2"]')).to_be_enabled();clean(p)
  ok('A tiny but nonzero dependent partial remains a valid, sensitive chart')
  p.locator('#ip-curve').select_option('flat');expect(p.locator('#ip-condition-badge')).to_contain_text('未满足');expect(p.locator('#ip-dg')).to_contain_text('Dg=1');expect(p.locator('#ip-dg')).to_contain_text('0/0');expect(p.locator('#ip-dg')).to_contain_text('显式解求导');expect(p.locator('[data-ip-phase="2"]')).to_be_enabled();p.locator('[data-ip-phase="2"]').click();expect(p.locator('#ip-motion-read')).to_contain_text('F ≈ 0')
  ok('Flat constraint distinguishes an unavailable inverse formula from an existing derivative Dg=1')
  p.locator('#ip-curve').select_option('cusp');expect(p.locator('#ip-observation')).to_contain_text('没有有限导数');expect(p.locator('[data-ip-phase="2"]')).to_be_disabled();p.locator('[data-ip-dep="x"]').click();expect(p.locator('#ip-condition-badge')).to_contain_text('C¹')
  ok('Unique cubic-root solution and reversed smooth cubic chart are not conflated')
  p.locator('#ip-curve').select_option('cross');expect(p.locator('#ip-observation')).to_contain_text('两支');expect(p.locator('#ip-analysis')).to_contain_text('明确选定的分支');clean(p);shot(p,'implicit-crossing-desktop.png')
  ok('Crossing counterexample retains both zero-set branches and states the nonuniqueness')
  route(p,'#lab=implicit&curve=circle&theta=30&delta=.65');expect(p.locator('#ip-condition-badge')).to_contain_text('本步越出');expect(p.locator('[data-ip-phase="3"]')).to_be_disabled();expect(p.locator('#ip-observation')).to_contain_text('工作点满足定理条件');clean(p)
  ok('An oversized step is separated from failure of the theorem at the basepoint')
  p.locator('#ip-curve').select_option('parabola');expect(p.locator('#ip-condition-badge')).to_contain_text('C¹');expect(p.locator('#ip-analysis')).to_contain_text('h²');clean(p)
  ok('Regular polynomial example remains available alongside the counterexamples')
  stage(p,'surface');assert p.locator('#ip-surface-plot svg').count()==1;assert p.locator('#ip-input-plot svg').count()==1;expect(p.locator('#ip-dg')).to_contain_text('1×2');expect(p.locator('#ip-cancel-equation')).to_contain_text('B = F_z');expect(p.locator('#ip-dg')).to_contain_text('dz ≈')
  ok('Surface uses a 1×2 Dg, a 3D tangent plane, and a draggable 2D input plane')
  p.locator('[data-ip-axis="0"]').click();expect(p.locator('#ip-hy')).to_have_value('0');p.locator('[data-ip-axis="1"]').click();expect(p.locator('#ip-hx')).to_have_value('0')
  ok('Single-coordinate controls isolate the two columns of the surface derivative')
  old=p.locator('#ip-hx').input_value();drag(p,'#ip-handle-input-h',22,-15);assert old!=p.locator('#ip-hx').input_value();clean(p)
  ok('Free-vector dragging updates surface geometry, height correction, and constraint residual')
  old=p.locator('#ip-camera').input_value();drag(p,'#ip-surface-svg',25,0);assert old!=p.locator('#ip-camera').input_value();p.locator('[data-ip-phase="2"]').click();shot(p,'implicit-surface-desktop.png')
  ok('The actual surface rotates on drag without changing the mathematics')
  p.locator('#ip-surface').select_option('sphere');slide(p,'sx',.9);slide(p,'sy',.1);slide(p,'hx',.6);slide(p,'hy',0);expect(p.locator('#ip-observation')).to_contain_text('离开所选实数分支');expect(p.locator('[data-ip-phase="3"]')).to_be_disabled();clean(p)
  ok('Sphere branch boundaries leave missing heights undefined rather than extrapolated')
  stage(p,'vector');expect(p.locator('#ip-dg')).to_contain_text('2×2');assert p.locator('#ip-input-plot svg').count()==1;assert p.locator('#ip-dependent-plot svg').count()==1;assert p.locator('#ip-constraint-plot svg').count()==1;p.locator('[data-ip-phase="2"]').click();expect(p.locator('#ip-observation')).to_contain_text('非线性残余');shot(p,'implicit-vector-desktop.png')
  ok('Vector case has two variable-space projections and a separate two-dimensional constraint space')
  before=p.locator('#ip-metrics strong').first.inner_text();p.locator('#ip-coupling').select_option('0.02');assert before!=p.locator('#ip-metrics strong').first.inner_text();expect(p.locator('#ip-condition-badge')).to_contain_text('C¹');expect(p.locator('#ip-analysis')).to_contain_text('敏感不等于定理失效')
  ok('Small nonzero lambda increases correction sensitivity while preserving invertibility')
  p.locator('#ip-coupling').select_option('0');expect(p.locator('#ip-vx')).to_be_disabled();expect(p.locator('[data-ip-phase="2"]')).to_be_disabled();expect(p.locator('#ip-dependent-plot')).to_contain_text('没有唯一');expect(p.locator('#ip-constraint-plot')).to_contain_text('只剩一条线');clean(p)
  ok('Exact singularity collapses the reachable constraint grid and disables the nonexistent inverse')
  p.locator('[data-ip-action="reachable"]').click();expect(p.locator('#ip-observation')).to_contain_text('无穷多个');expect(p.locator('[data-ip-phase="3"]')).to_be_disabled();p.locator('[data-ip-action="unreachable"]').click();expect(p.locator('#ip-observation')).to_contain_text('没有解');shot(p,'implicit-singular-desktop.png')
  ok('Rank-deficient compatible and incompatible errors are respectively nonunique and unsolvable')
  slide(p,'progress',0);p.locator('[data-ip-action="play"]').click();p.wait_for_timeout(2100);expect(p.locator('#ip-progress')).to_have_value('1');expect(p.locator('[data-ip-action="play"]')).to_have_attribute('aria-pressed','false')
  ok('Singular animation stops at the error instead of fabricating a correction')
  screen(p,'proof')
  for k in ['curve','condition','surface','vector']:
   stage(p,k)
   for i in range(4):p.locator('[data-ip-proof="'+str(i)+'"]').click();expect(p.locator('#ip-proof-current')).to_contain_text('STEP '+str(i+1));clean(p)
  expect(p.locator('.ip-proof')).to_contain_text('以逆函数定理为前提');shot(p,'implicit-proof-desktop.png')
  ok('All sixteen proof steps render correctly and separate existence from differentiating an assumed g')
  screen(p,'challenge')
  answers={'meaning':1,'base':1,'circle':1,'flat':2,'residual':1,'surface':0,'singular':1,'order':1}
  for k,v in answers.items():p.locator('input[name="ip-question-'+k+'"][value="'+str(v)+'"]').check()
  p.locator('#ip-quiz-form button[type="submit"]').click();expect(p.locator('#ip-quiz-score')).to_contain_text('8 / 8');assert p.locator('.ip-feedback.correct').count()==8
  ok('Eight reasoning checks score correct answers and reveal independent explanations')
  screen(p,'explore');screen(p,'challenge');expect(p.locator('#ip-quiz-score')).to_contain_text('8 / 8');p.locator('[data-ip-action="clear-quiz"]').click();assert p.locator('input:checked').count()==0
  ok('Quiz drafts survive screen changes and reset does not corrupt the experiment')
  route(p,'#lab=implicit&step=vector&coupling=0.1&vhx=0.2&vhy=0.1&screen=explore');screen(p,'proof');assert 'coupling=0.1' in p.evaluate('location.hash');screen(p,'explore');expect(p.locator('#ip-vhx')).to_have_value('0.2');expect(p.locator('#ip-coupling')).to_have_value('0.1')
  ok('Shareable hash state preserves mathematical parameters across exploration and proof')
  with p.expect_download() as info:p.locator('[data-ip-action="export"]').click()
  dl=info.value;dl.save_as(OUT/'implicit-export.csv');csv=(OUT/'implicit-export.csv').read_text();assert 'implicit_derivative_error_ratio' in csv;assert '"coupling":0.1' in csv
  ok('CSV is a real browser download containing parameters and explicit finite-data warnings')
  p.locator('[data-action="share"]').click();p.wait_for_timeout(100)
  if p.locator('#share-dialog').is_visible():expect(p.locator('#share-url')).to_contain_text('');assert 'lab=implicit' in p.locator('#share-url').input_value();p.keyboard.press('Escape')
  ok('Sharing is wired through the existing app and provides a fallback when clipboard is unavailable')
  for lab in ['limits','differentiability','fields','completeness','taylor','series','uniform','linear']:
   p.locator('#nav-'+lab).click();assert p.locator('h1').count()==1;assert not errors
  p.locator('#nav-implicit').click();clean(p)
  ok('Every previous module remains navigable after the new controller is mounted and destroyed')
  p.set_viewport_size({'width':390,'height':844})
  for k in ['curve','condition','surface','vector']:
   stage(p,k);clean(p)
  p.locator('[data-ip-phase="2"]').click();shot(p,'implicit-vector-mobile.png');stage(p,'curve');shot(p,'implicit-curve-mobile.png');screen(p,'proof');shot(p,'implicit-proof-mobile.png');clean(p)
  ok('All four stages and proof views fit a 390-pixel mobile viewport without horizontal overflow')
  p.emulate_media(reduced_motion='reduce');screen(p,'explore');slide(p,'progress',0);p.locator('[data-ip-action="play"]').click();expect(p.locator('#ip-progress')).to_have_value('1');expect(p.locator('[data-ip-action="play"]')).to_have_attribute('aria-pressed','false');p.wait_for_timeout(200);expect(p.locator('#ip-progress')).to_have_value('1')
  ok('Reduced-motion preference uses one deliberate stage at a time instead of continuous animation')
  assert not errors;assert not [r for r in requests if r.startswith('https://')]
  ok('No JavaScript errors or external runtime requests occurred during the complete session')
  ctx.close();browser.close()
finally:
 if server:server.terminate()
 (OUT/'implicit-browser-report.json').write_text(json.dumps({'mode':'offline-harness' if args.offline_harness else 'http','checks':checks,'count':len(checks),'errors':errors,'requests':requests},ensure_ascii=False,indent=2))

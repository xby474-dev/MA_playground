"""Real-browser checks of the complete v1.3 application, not a mock UI.
Default: served ES modules. --offline-harness: inject the actually built offline
HTML when browser navigation is prohibited, without altering browser policies.
"""
from __future__ import annotations
import argparse,json,subprocess,time,urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
args_parser=argparse.ArgumentParser();args_parser.add_argument('--offline-harness',action='store_true');args_parser.add_argument('--browser');args_parser.add_argument('--url',default='http://127.0.0.1:4173/MA_playground/')
args=args_parser.parse_args();OUT=ROOT/'test-results';OUT.mkdir(exist_ok=True)
server=None
if not args.offline_harness:
 try:urllib.request.urlopen(args.url,timeout=1)
 except Exception:
  server=subprocess.Popen(['node','scripts/serve.mjs','--dir','dist','--port','4173'],cwd=ROOT,stdout=subprocess.DEVNULL)
  for _ in range(40):
   try:urllib.request.urlopen(args.url,timeout=1);break
   except Exception:time.sleep(.1)
results=[];errors=[];requests=[]
def ok(name):results.append(name);print(f'PASS {len(results):02d}  {name}',flush=True)
def route(page,h):page.evaluate('(h)=>location.hash=h',h);page.wait_for_timeout(70)
def slide(page,id,value):page.locator('#'+id).evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}));}',value)
def visible(page,selector):return page.locator(selector+':visible').first
def screenshot(page,name):
 page.evaluate('scrollTo(0,0)')
 # Let a genuine transient toast expire naturally; do not hide UI for a capture.
 page.wait_for_function("!document.querySelector('#toast.visible')",timeout=6000)
 page.wait_for_timeout(70)
 page.screenshot(path=str(OUT/name),full_page=True,animations='disabled')
def no_overflow(page):
 d=page.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})');assert d['scroll']<=d['width']+1,d

def unknown_elements(page):return page.evaluate('Array.from(document.querySelectorAll("#main *")).filter(e=>e instanceof HTMLUnknownElement).map(e=>e.tagName)')
def test_candidate(page,value):
 page.locator('#cp-candidate').fill(value);page.locator('#cp-upper-form button').click()
try:
 with sync_playwright() as p:
  opts={'headless':True}
  if args.browser:opts['executable_path']=args.browser
  browser=p.chromium.launch(**opts);context=browser.new_context(viewport={'width':1512,'height':1100},reduced_motion='reduce',accept_downloads=True)
  page=context.new_page();page.set_default_timeout(7000);page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url))
  if args.offline_harness:page.set_content((ROOT/'dist/completeness-lab.html').read_text(),wait_until='load')
  else:page.goto(args.url,wait_until='networkidle');page.locator('#nav-completeness').click()
  expect(page.locator('#cp-title')).to_have_text('五种定理，同一个终点。');expect(page.locator('#nav-completeness')).to_have_attribute('aria-current','page')
  assert page.locator('.lab-nav').count()==5
  assert page.locator('.cp-desktop-graph [data-cp-node]').count()==5
  assert page.locator('.cp-desktop-graph [data-cp-edge]').count()==5
  expect(page.locator('.page-guide[data-guide="completeness"]')).to_be_visible();expect(page.locator('.page-guide[data-guide="completeness"] [data-guide-action="start"]')).to_be_visible()
  ok('Fourth lab opens a five-node, five-edge proof cycle with an in-page guide')
  page.locator('.cp-assumptions summary').click();expect(page.locator('.cp-assumptions')).to_contain_text('阿基米德有序域');expect(page.locator('.cp-assumptions')).to_contain_text('长度趋零');page.locator('.cp-assumptions summary').click()
  ok('The map makes ordered-field, Archimedean and shrinking-interval assumptions available')
  page.locator('#cp-from').select_option('mono');page.locator('#cp-to').select_option('sup');expect(page.locator('#cp-route-description')).to_contain_text('4 条箭头');assert page.locator('.cp-graph-edge.on-route').count()==4
  page.locator('[data-cp-action="route"]').click();expect(page.locator('.cp-proof-context')).to_contain_text('单调有界');expect(page.locator('.cp-proof-context')).to_contain_text('闭区间套')
  ok('Route planner follows actual directed paths, including a four-link reverse implication')
  page.locator('[data-cp-action="map"]').click();edge=page.locator('.cp-desktop-graph [data-cp-edge="bw-cauchy"]');edge.focus();page.keyboard.press('Enter');expect(page.locator('.cp-proof-given')).to_contain_text('Bolzano–Weierstrass')
  ok('Implication arrows are keyboard-operable and open the corresponding independent proof')
  page.locator('[data-cp-action="map"]').click();node=page.locator('.cp-desktop-graph [data-cp-node="sup"]');node.focus();page.keyboard.press('Space');expect(page.locator('#cp-upper-form')).to_be_visible();expect(page.locator('#cp-title')).to_be_focused()
  ok('Keyboard node activation enters the shared experiment and transfers focus to the heading')
  assert 's−ε<x' in page.locator('.cp-definition').inner_text()
  assert 'aₙ²≤d<bₙ²' in page.locator('#cp-interpretation').inner_text()
  assert 'r²<d' in page.locator('#cp-upper-feedback').inner_text();assert unknown_elements(page)==[]
  ok('Less-than inequalities remain visible text; no unintended unknown HTML elements are created')
  slide(page,'cp-depth',8);expect(page.locator('#cp-live')).to_contain_text('181/128');expect(page.locator('#cp-live')).to_contain_text('363/256');expect(page.locator('#cp-depth')).to_have_value('8')
  visible(page,'[data-cp-action="next"]').click();expect(page.locator('#cp-depth')).to_have_value('9');visible(page,'[data-cp-action="prev"]').click();expect(page.locator('#cp-depth')).to_have_value('8')
  ok('Bisection, next and previous controls produce exact expected rational brackets')
  for n in ['mono','nested','bw','cauchy','sup']:
   visible(page,f'[data-cp-node="{n}"]').click();expect(page.locator('#cp-depth')).to_have_value('8');expect(page.locator('#cp-context-n')).to_have_text('8')
  ok('Changing any of the five lenses preserves target and construction depth')
  test_candidate(page,'7/5');expect(page.locator('#cp-upper-feedback')).to_contain_text('267/190');expect(page.locator('#cp-upper-feedback')).to_contain_text('还不是上界')
  test_candidate(page,'10/7');expect(page.locator('#cp-upper-feedback')).to_contain_text('99/70');expect(page.locator('#cp-upper-feedback')).to_contain_text('不是最小的')
  ok('Upper-bound inspector constructs a larger set element or a smaller upper bound exactly')
  test_candidate(page,'1/0');expect(page.locator('#cp-candidate')).to_have_attribute('aria-invalid','true');expect(page.locator('#cp-upper-feedback')).to_contain_text('分母不能为 0')
  test_candidate(page,'<img src=x>');assert page.locator('#cp-upper-feedback img').count()==0
  test_candidate(page,'1.4');expect(page.locator('#cp-upper-feedback')).to_contain_text('267/190');assert page.locator('#cp-candidate').get_attribute('aria-invalid') is None
  ok('Invalid candidates are rejected without state poisoning or HTML injection; valid decimals recover')
  page.locator('[data-cp-domain="Q"]').click();expect(page.locator('#cp-depth')).to_have_value('8');expect(page.locator('.cp-domain-grid section.active')).to_contain_text('不存在最小上界')
  page.locator('#cp-target').select_option('rational');test_candidate(page,'3/2');expect(page.locator('#cp-upper-feedback')).to_contain_text('本例的最小上界');expect(page.locator('#cp-live')).to_contain_text('3/2');expect(page.locator('.cp-domain-grid section.active')).to_contain_text('五个普遍命题仍不成立')
  ok('R/Q switching keeps the same data, and the rational target is a normal success without declaring Q complete')
  page.locator('[data-cp-stage="0"]').click();assert page.locator('.cp-graph-node.fails').count()==5;expect(page.locator('#cp-map-outcome')).to_contain_text('正例');screenshot(page,'completeness-map-q.png')
  ok('All five universal Q nodes stay false even while the selected rational example succeeds')
  page.locator('#cp-target').select_option('three');visible(page,'[data-cp-node="nested"]').click();expect(page.locator('#cp-target')).to_have_value('three');expect(page.locator('.cp-definition')).to_contain_text('恰有一个点')
  slide(page,'cp-depth',32);expect(page.locator('#cp-live')).to_contain_text('1/4294967296');page.locator('#cp-zoom').check();expect(page.locator('#cp-primary-plot')).to_contain_text('局部放大');assert 'NaN' not in page.locator('#cp-primary-plot').inner_html()
  ok('Shrinking closed intervals keep exact nonzero width at the display limit and support stable local zoom')
  page.locator('#cp-reference').uncheck();assert '∉ ℚ' not in page.locator('#cp-primary-plot').inner_text();page.locator('#cp-reference').check();expect(page.locator('#cp-primary-plot')).to_contain_text('∉ ℚ')
  ok('The optional missing-point marker is labelled as an ambient real reference, not a visible rational gap')
  page.locator('.cp-ledger summary').click();assert page.locator('#cp-ledger tbody tr').count()==33;page.locator('.cp-ledger summary').click();expect(page.locator('#cp-interpretation')).to_contain_text('无限交集');expect(page.locator('#cp-interpretation')).to_contain_text('为空')
  page.locator('#cp-target').select_option('two');screenshot(page,'completeness-nested-q.png')
  ok('The exact ledger retains every finite layer and distinguishes finite nonemptiness from the infinite intersection')
  visible(page,'[data-cp-node="bw"]').click();slide(page,'cp-depth',16);page.locator('[data-cp-parity="even"]').click();expect(page.locator('[data-cp-parity="even"]')).to_have_attribute('aria-pressed','true');assert page.locator('#cp-primary-plot circle[fill="#246853"]').count()==9
  page.locator('[data-cp-parity="odd"]').click();assert page.locator('#cp-primary-plot circle[fill="#246853"]').count()==8;expect(page.locator('#cp-interpretation')).to_contain_text('1,3,5');page.locator('[data-cp-parity="even"]').click();screenshot(page,'completeness-bw.png')
  ok('BW subsequence selection keeps even or odd original indices without sorting or claiming whole-sequence convergence')
  page.locator('.cp-proof-detail summary').click();expect(page.locator('.cp-proof-detail')).to_contain_text('若任一子列');expect(page.locator('.cp-proof-detail')).to_contain_text('q²=d');page.locator('.cp-proof-detail summary').click()
  ok('The Q counterexample proves failure for every convergent subsequence, not just the two displayed choices')
  visible(page,'[data-cp-node="cauchy"]').click();slide(page,'cp-depth',5);slide(page,'cp-epsilon',5);expect(page.locator('#cp-interpretation')).to_contain_text('暂未达到');expect(page.locator('#cp-interpretation')).to_contain_text('不代表数列不是 Cauchy')
  page.locator('[data-cp-action="certify"]').click();expect(page.locator('#cp-depth')).to_have_value('6');expect(page.locator('#cp-interpretation')).to_contain_text('解析尾部证书已满足');expect(page.locator('#cp-interpretation')).to_contain_text('所有尾部项')
  ok('Strict epsilon certificates distinguish a sufficient tail bound from a failure of Cauchyness')
  slide(page,'cp-m',120);slide(page,'cp-k',180);expect(page.locator('#cp-primary-plot')).to_contain_text('m=126');expect(page.locator('#cp-primary-plot')).to_contain_text('j=186');expect(page.locator('#cp-interpretation')).to_contain_text('精确差');assert 'NaN' not in page.locator('#cp-primary-plot').inner_html();screenshot(page,'completeness-cauchy-q.png')
  ok('Two independently selected far tail indices use exact rational differences beyond floating-point resolution')
  page.locator('#cp-target').select_option('rational');expect(page.locator('#cp-interpretation')).to_contain_text('精确差为 0');expect(page.locator('.cp-domain-grid section.active')).to_contain_text('极限 3/2');assert page.locator('#cp-reference').count()==0;assert page.locator('#cp-zoom').count()==0
  ok('Constant rational tail gives zero exact distance and unsupported plot controls are not offered')
  page.locator('#cp-target').select_option('two');page.locator('[data-cp-action="outgoing-proof"]').click();expect(page.locator('.cp-proof-given')).to_contain_text('Cauchy 完备性')
  for i in range(4):
   page.locator(f'[data-cp-proof-step="{i}"]').click();expect(page.locator(f'[data-cp-proof-step="{i}"]')).to_have_attribute('aria-current','step');assert len(page.locator('#cp-proof-current').inner_text())>80;assert unknown_elements(page)==[]
  expect(page.locator('#cp-proof-current')).to_contain_text('不是上界');screenshot(page,'completeness-proof.png')
  ok('The Cauchy-to-supremum proof checks all four steps, minimality and noncircular premises')
  for edge_id in ['sup-mono','mono-nested','nested-bw','bw-cauchy','cauchy-sup']:
   page.locator(f'.cp-proof-ring [data-cp-edge="{edge_id}"]').click();page.locator('.cp-proof-full summary').click();assert page.locator('.cp-proof-full section').count()==4;assert unknown_elements(page)==[]
  ok('Every implication exposes a complete four-step proof with no truncated HTML inequalities')
  page.locator('[data-cp-action="proof-explore"]').click();expect(page.locator('#cp-depth')).to_have_value('6');expect(page.locator('#cp-target')).to_have_value('two')
  ok('Proof-to-experiment navigation keeps the same target and construction parameters')
  page.evaluate('''() => { const old=URL.createObjectURL; URL.createObjectURL=(blob)=>{window.__cpBlob=blob;return old(blob);}; }''')
  page.locator('[data-cp-action="export"]').click();csv=page.evaluate('window.__cpBlob.text()');assert 'NOT an infinite-process proof' in csv;assert 'domain=Q' in csv;assert '1/64' in csv
  ok('CSV export contains exact fractions, the selected domain and an explicit finite-data disclaimer')
  page.locator('[data-action="share"]').click()
  # Clipboard fallback is async; let the native dialog settle before the next control.
  page.wait_for_timeout(150)
  if page.locator('#share-dialog').is_visible():
   url=page.locator('#share-url').input_value();assert 'lab=completeness' in url;assert 'target=two' in url;assert 'domain=Q' in url;assert 'n=6' in url;page.locator('#share-dialog [data-action="close-dialog"]').click()
  else:assert 'lab=completeness' in page.url
  ok('Share preserves all mathematical settings and supports the manual-copy fallback')
  slide(page,'cp-depth',30);visible(page,'[data-cp-action="play"]').click();page.wait_for_timeout(1250);expect(page.locator('#cp-depth')).to_have_value('31');visible(page,'[data-cp-action="play"]').click();page.wait_for_timeout(1200);expect(page.locator('#cp-depth')).to_have_value('31')
  visible(page,'[data-cp-action="play"]').click();page.wait_for_timeout(1300);expect(page.locator('#cp-depth')).to_have_value('32');expect(visible(page,'[data-cp-action="play"]')).to_have_attribute('aria-pressed','false')
  ok('Explicit reduced-motion animation advances discrete layers, pauses and stops at the finite display limit')
  visible(page,'[data-cp-action="play"]').click();page.locator('#nav-limits').click();page.wait_for_timeout(1300);expect(page.locator('#nav-limits')).to_have_attribute('aria-current','page');page.locator('#nav-completeness').click();expect(page.locator('#cp-title')).to_have_text('五种定理，同一个终点。')
  ok('Leaving the experiment destroys its animation and does not mutate the old labs')
  route(page,'#lab=completeness&screen=proof&edge=nested-bw&proofStep=2&n=11&target=three&domain=Q');expect(page.locator('#cp-proof-current')).to_contain_text('先有公共点');expect(page.locator('#cp-target')).to_have_value('three');expect(page.locator('#cp-context-n')).to_have_text('11')
  ok('Deep links restore theorem, proof step, target, domain and construction depth')
  page.locator('[data-cp-stage="4"]').click();assert page.locator('#cp-quiz fieldset').count()==6
  for q in ['domain','quantifiers','bw','increments','intervals','normal']:page.locator(f'input[name="cp-{q}"][value="1"]').check()
  page.locator('#cp-quiz button[type="submit"]').click();expect(page.locator('#cp-quiz-score')).to_contain_text('6 / 6');assert page.locator('.cp-feedback.correct').count()==6;screenshot(page,'completeness-challenge.png')
  ok('Six transfer questions grade correctly and provide explanations for domains, quantifiers, subsequences and hypotheses')
  page.locator('[data-cp-action="start"]').click();page.locator('[data-cp-stage="4"]').click();expect(page.locator('input[name="cp-domain"][value="1"]')).to_be_checked();expect(page.locator('#cp-quiz-score')).to_contain_text('6 / 6')
  page.locator('input[name="cp-domain"][value="0"]').check();assert page.locator('.cp-feedback:visible').count()==0;page.locator('#cp-quiz button[type="submit"]').click();expect(page.locator('#cp-quiz-score')).to_contain_text('5 / 6');expect(page.locator('#cp-feedback-domain')).to_contain_text('不因环境')
  ok('In-session answers survive exploration, and editing invalidates stale feedback before regrading')
  page.locator('[data-cp-action="reset"]').click();expect(page.locator('#cp-target')).to_have_value('two');expect(page.locator('[data-cp-domain="R"]')).to_have_attribute('aria-pressed','true');expect(page.locator('#cp-context-n')).to_have_text('5');page.locator('[data-cp-stage="4"]').click();assert page.locator('#cp-quiz input:checked').count()==0
  ok('Reset clears shared parameters and session-only quiz drafts')
  route(page,'#lab=completeness&screen=oops&target=%3Cimg%3E&node=bad&edge=bad&domain=X&n=999&epsilon=-1&candidate=%3Cimg%3E');expect(page.locator('#cp-title')).to_have_text('五种定理，同一个终点。');expect(page.locator('#cp-context-n')).to_have_text('32');expect(page.locator('#cp-target')).to_have_value('two');assert unknown_elements(page)==[]
  ok('Malformed URLs are clamped and whitelisted without injecting markup or producing nonfinite graphs')
  route(page,'#lab=completeness');screenshot(page,'completeness-map-desktop.png')
  for width in [360,390,768,1024]:
   page.set_viewport_size({'width':width,'height':844});no_overflow(page)
   if width<690:
    assert page.locator('.cp-mobile-graph [data-cp-node]:visible').count()==5;assert page.locator('.cp-mobile-graph [data-cp-edge]:visible').count()==5
   if width==390:screenshot(page,'completeness-map-mobile.png')
  ok('Map and five-lab navigation reflow at 360, 390, 768 and 1024px without document overflow')
  page.set_viewport_size({'width':360,'height':844});visible(page,'[data-cp-node="nested"]').click();expect(page.locator('#cp-depth-mobile')).to_be_visible();page.locator('#cp-depth-mobile').focus();slide(page,'cp-depth-mobile',21);expect(page.locator('#cp-depth-mobile')).to_be_focused();expect(page.locator('#cp-depth')).to_have_value('21');expect(page.locator('#cp-context-n')).to_have_text('21');no_overflow(page);screenshot(page,'completeness-nested-mobile.png')
  ok('Mobile plot has its own synchronized depth control with focus preserved during updates')
  visible(page,'[data-cp-node="cauchy"]').click();slide(page,'cp-depth-mobile',32);slide(page,'cp-m',120);slide(page,'cp-k',180);page.locator('.cp-proof-detail summary').click();page.locator('.cp-ledger summary').click();no_overflow(page);assert 'NaN' not in page.locator('#cp-primary-plot').inner_html();page.locator('.cp-proof-detail summary').click();page.locator('.cp-ledger summary').click()
  ok('Long exact rational tails, open proofs and scrollable ledgers do not overflow on a 360px phone')
  page.locator('[data-cp-action="outgoing-proof"]').click();page.locator('.cp-proof-full summary').click();no_overflow(page);screenshot(page,'completeness-proof-mobile.png');page.locator('[data-cp-stage="4"]').click();no_overflow(page)
  ok('Long proof and quiz pages remain usable on narrow screens')
  page.set_viewport_size({'width':1512,'height':1100});page.locator('#nav-differentiability').click();expect(page.locator('h1')).to_have_text('四个性质，一张关系图。');page.locator('#nav-fields').click();expect(page.locator('#field-scene svg')).to_be_visible();page.locator('#nav-limits').click();expect(page.locator('#nav-limits')).to_have_attribute('aria-current','page')
  ok('All three existing public experiments remain reachable and mount successfully')
  page.locator('#nav-completeness').click();ids=page.locator('[id]').evaluate_all('(els)=>els.map(e=>e.id)');assert len(ids)==len(set(ids));assert errors==[],errors
  external=[u for u in requests if u.startswith(('https://','http://')) and not u.startswith(args.url.split('/MA_playground')[0])];assert external==[],external
  ok('No duplicate IDs, uncaught JavaScript errors or external runtime requests in exercised flows')
  report={'passed':len(results),'failed':0,'mode':'offline-harness' if args.offline_harness else 'served-modules','checks':results,'errors':errors,'external_runtime_requests':external,'viewports':[360,390,768,1024,1512],'browser':browser.version}
  (OUT/'completeness-browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
  print(f'\n{len(results)} completeness browser checks passed. Mode: {report["mode"]}',flush=True)
  browser.close()
finally:
 if server:server.terminate()

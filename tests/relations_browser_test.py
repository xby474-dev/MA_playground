"""v1.2 relation-lab tests. Served mode is the default; --offline-harness
uses the actual built HTML when browser navigation is prohibited. It does not
modify browser policies and does not claim HTTP module-loading verification.
"""
from __future__ import annotations
import argparse
import json
import subprocess
import time
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--offline-harness',action='store_true');p.add_argument('--browser');p.add_argument('--url',default='http://127.0.0.1:4173/MA_playground/')
args=p.parse_args();OUT=ROOT/'test-results';OUT.mkdir(exist_ok=True);server=None
if not args.offline_harness:
    try: urllib.request.urlopen(args.url,timeout=1)
    except Exception:
        server=subprocess.Popen(['node','scripts/serve.mjs','--dir','dist','--port','4173'],cwd=ROOT,stdout=subprocess.DEVNULL)
        for _ in range(30):
            try: urllib.request.urlopen(args.url,timeout=1);break
            except Exception: time.sleep(.1)
results=[];errors=[];requests=[]
def ok(name): results.append(name);print(f'PASS {len(results):02d}  {name}',flush=True)
def slider(page,id,v):page.locator('#'+id).evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}));}',v)
def screenshot(page,name):
    page.evaluate('scrollTo(0,0)');page.wait_for_timeout(80);page.screenshot(path=str(OUT/name),full_page=True,animations='disabled')
def no_overflow(page):
    d=page.evaluate('({w:innerWidth,s:document.documentElement.scrollWidth})');assert d['s']<=d['w']+1,d

def route(page,hash):
    page.evaluate('(h)=>{location.hash=h}',hash);page.wait_for_timeout(60)
def open_edge(page,id):
    if page.locator('[data-r-action="map"]:visible').count():page.locator('[data-r-action="map"]:visible').first.click()
    page.locator(f'[data-r-edge="{id}"]:visible').first.click()
def reveal(page,values=None):
    if values is not None:
        for prop,v in zip(['P','C','D','S'],values):page.locator(f'input[name="rel-{prop}"][value="{"yes" if v else "no"}"]').check()
    page.locator('#rel-predictions button[type="submit"]').click()
try:
 with sync_playwright() as p:
    opts={'headless':True}
    if args.browser:opts['executable_path']=args.browser
    browser=p.chromium.launch(**opts);ctx=browser.new_context(viewport={'width':1512,'height':1100},reduced_motion='reduce',accept_downloads=True);page=ctx.new_page();page.set_default_timeout(6000)
    page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url))
    if args.offline_harness:page.set_content((ROOT/'dist/relations-lab.html').read_text(),wait_until='load')
    else:
        page.goto(args.url,wait_until='networkidle');page.locator('#nav-differentiability').click()
    expect(page.locator('h1')).to_have_text('四个性质，一张关系图。');expect(page.locator('#nav-differentiability')).to_have_attribute('aria-current','page')
    assert page.locator('.rel-desktop-graph .rel-edge.theorem').count()==3
    assert page.locator('.rel-desktop-graph .rel-edge.inverse').count()==5
    assert page.locator('.rel-desktop-graph .rel-node.unknown').count()==4
    ok('Default differential experiment is the single relation map, with true and false arrows distinguished')
    page.locator('[data-r-property="S"]:visible').first.click();expect(page.locator('#rel-concept')).to_contain_text('开邻域')
    ok('Property definition explicitly distinguishes existence in a neighbourhood from continuity at the origin')
    reveal(page,[True,True,True,True]);assert page.locator('.rel-desktop-graph .rel-node.yes').count()==4
    expect(page.locator('#rel-prediction-result')).to_contain_text('4 项正确')
    screenshot(page,'relations-map-desktop.png');no_overflow(page)
    ok('Predictions reveal the authored four-node truth table without treating samples as proof')
    for fn in ['saddle','wave','quadratic']:
        page.locator('#rel-function').select_option(fn);assert page.locator('.rel-desktop-graph .rel-node.unknown').count()==4
        reveal(page,[True]*4);assert page.locator('.rel-desktop-graph .rel-node.yes').count()==4
    ok('All four smooth positive examples are selectable and changing example resets the reveal')
    page.locator('[data-r-edge="s-d"]:visible').first.focus();page.keyboard.press('Enter')
    expect(page.locator('h1')).to_have_text('偏导连续 → 可微');expect(page.locator('#rel-surface')).to_be_visible()
    expect(page.locator('#rel-page-title')).to_be_focused()
    ok('Graph arrows are keyboard-operable and navigate to the corresponding explanation/experiment')
    reveal(page,[True]*4);expect(page.locator('#rel-relation-result')).to_contain_text('正例帮助理解')
    page.locator('[data-r-action="proof"]').click();assert page.locator('#rel-proof').get_attribute('open') is not None
    expect(page.locator('#rel-proof')).to_contain_text('ε/√2');expect(page.locator('#rel-proof')).to_contain_text('所有方向')
    screenshot(page,'relations-proof-desktop.png')
    ok('True-arrow explanation unfolds a uniform epsilon-delta proof rather than a list of observations')
    page.locator('.rel-next-banner [data-r-edge="d-p"]').click()
    expect(page.locator('#rel-function')).to_have_value('wave');expect(page.locator('#rel-plane-label')).to_contain_text('z = x')
    page.locator('.rel-next-banner [data-r-edge="d-c"]').click()
    expect(page.locator('h1')).to_have_text('可微 → 连续')
    page.locator('.rel-next-banner [data-r-stage="2"]').click()
    expect(page.locator('h1')).to_have_text('可微 ⇏ 偏导连续')
    expect(page.locator('#rel-function')).to_have_value('bowl');expect(page.locator('#rel-relation-result')).to_contain_text('不代表逆推总成立')
    ok('Guided path visits all three implications before explicitly attempting the inverse on a smooth example')
    page.locator('.rel-next-banner [data-r-model="oscillation"]').click();reveal(page,[True,True,True,False])
    expect(page.locator('#rel-relation-result')).to_contain_text('反例成立');assert page.locator('#rel-status-strip .yes').count()==3;assert page.locator('#rel-status-strip .no').count()==1
    slider(page,'rel-sequence',120);expect(page.locator('#rel-sequence-note')).to_contain_text('−1、+1')
    slider(page,'rel-scale',4);expect(page.locator('#rel-bound')).to_contain_text('统一上界：ρ')
    expect(page.locator('#rel-scale-output')).to_contain_text('10⁻⁴')
    screenshot(page,'relations-oscillation-desktop.png')
    ok('Differentiability without continuous partials uses analytic -1/+1 sequences and a uniform vanishing remainder bound')
    page.locator('.rel-next-banner [data-r-edge="p-c"]').click();expect(page.locator('#rel-function')).to_have_value('ratio')
    reveal(page,[True,False,False,False]);slider(page,'rel-scale',4)
    expect(page.locator('#rel-live-data>div').first).to_contain_text('0.5')
    expect(page.locator('#rel-live-data>div').last).to_contain_text('5000')
    assert page.locator('#rel-plot svg circle').count()>=3
    page.locator('[data-r-angle="0"]').click();expect(page.locator('#rel-live-data>div').first).to_contain_text('0')
    page.locator('[data-r-angle="45"]').click();page.locator('[data-r-sign="-1"]').click();expect(page.locator('#rel-live-data>div').first).to_contain_text('0.5')
    screenshot(page,'relations-ratio-desktop.png')
    ok('Neighbourhood partial existence versus discontinuity: axes, diagonal, both sides and punctured origin are distinct')
    page.locator('[data-r-view="derivative"]').click();slider(page,'rel-sequence',90)
    expect(page.locator('#rel-sequence-note')).to_contain_text('90 和 −90')
    ok('The discontinuity example exposes unbounded nearby partials, not a violation of the bounded-partials theorem')
    page.locator('.rel-next-banner [data-r-edge="c-p"]').click();expect(page.locator('#rel-function')).to_have_value('absolute')
    expect(page.locator('#rel-plane')).to_be_disabled();expect(page.locator('#rel-live-data>div').nth(1)).to_contain_text('未定义')
    reveal(page,[False,True,False,False]);page.locator('[data-r-view="derivative"]').click()
    expect(page.locator('#rel-sequence-note')).to_contain_text('正侧 1 / 负侧 -1')
    expect(page.locator('#rel-bound')).to_contain_text('非微分误差')
    expect(page.locator('#rel-relation-result')).to_contain_text('反例成立')
    ok('Continuous cusp has genuinely undefined partials, disabled derivative plane and explicitly labelled reference height')
    page.evaluate('()=>{window.__realURL=URL.createObjectURL;URL.createObjectURL=b=>{window.__csv=b;return window.__realURL(b)}}')
    page.locator('[data-r-action="export"]').click();csv=page.evaluate('window.__csv.text()')
    lines=[x for x in csv.splitlines() if not x.startswith('#')];assert len(lines)==102;assert 'finite samples are not a proof' in csv
    cols=lines[0].split(',');row=lines[1].split(',');assert row[cols.index('L')]=='';assert row[cols.index('ratio')]==''
    ok('CSV exports undefined derivative quantities as blank rather than zero, with finite-sampling provenance')
    page.locator('.rel-next-banner [data-r-edge="p-d"]').click();reveal(page,[True,True,False,False]);slider(page,'rel-scale',4)
    expect(page.locator('#rel-live-data>div').last).to_contain_text('0.5');expect(page.locator('#rel-status-strip')).to_contain_text('连续')
    page.locator('[data-r-metric="raw"]').click();expect(page.locator('#rel-chart-title')).to_contain_text('绝对误差变小')
    page.locator('[data-r-metric="ratio"]').click();expect(page.locator('#rel-chart-title')).to_contain_text('除以位移')
    ok('Original counterexample still establishes that continuity and both partials together do not imply differentiability')
    open_edge(page,'bounded-c');reveal(page,[True,True,True,False])
    expect(page.locator('#rel-relation-result')).to_contain_text('与箭头相容')
    page.locator('#rel-function').select_option('ratio');reveal(page)
    expect(page.locator('#rel-relation-result')).to_contain_text('前提没有满足')
    page.locator('[data-r-action="proof"]').click();expect(page.locator('#rel-proof')).to_contain_text('处处存在');expect(page.locator('#rel-proof')).to_contain_text('不是可微性证明')
    ok('The textbook conditional arrow is present and refuses an example that lacks bounded partials')
    open_edge(page,'s-d');page.locator('#rel-function').select_option('oscillation');reveal(page)
    expect(page.locator('#rel-relation-result')).to_contain_text('前提没有满足');assert page.locator('#rel-status-strip .yes').count()==3
    ok('A false antecedent does not turn a theorem red or falsely force its conclusion to fail')
    page.locator('#rel-function').select_option('wave');page.locator('[data-r-view="surface"]').click()
    before=page.locator('#rel-surface').evaluate('(c)=>c.toDataURL()');page.locator('#rel-surface').focus();page.keyboard.press('ArrowRight')
    assert before!=page.locator('#rel-surface').evaluate('(c)=>c.toDataURL()')
    page.keyboard.press('Home');assert before==page.locator('#rel-surface').evaluate('(c)=>c.toDataURL()')
    ok('Three-dimensional surface camera supports keyboard rotation and exact reset')
    slider(page,'rel-scale',1);page.locator('[data-r-action="play"]').click();page.wait_for_timeout(300)
    assert float(page.locator('#rel-scale').input_value())>1
    page.locator('[data-r-action="play"]').click();q=page.locator('#rel-scale').input_value();page.wait_for_timeout(180)
    assert page.locator('#rel-scale').input_value()==q
    ok('Explicit approach animation advances and pauses without replacing the focused input')
    slider(page,'rel-angle',137);slider(page,'rel-scale',2.25);page.locator('[data-r-sign="-1"]').click();page.locator('#rel-zoom').uncheck()
    saved=page.evaluate('location.hash');page.locator('[data-r-action="map"]').click();route(page,saved)
    expect(page.locator('#rel-function')).to_have_value('wave');expect(page.locator('#rel-angle')).to_have_value('137');expect(page.locator('#rel-scale')).to_have_value('2.25');expect(page.locator('#rel-zoom')).not_to_be_checked()
    assert 'reason' not in saved and 'answer' not in saved
    ok('Deep links restore example, arrow, observation view, direction, metric and scale but no student answers')
    page.evaluate('Object.defineProperty(navigator,"clipboard",{configurable:true,value:undefined})')
    page.locator('[data-action="share"]').click();expect(page.locator('#share-dialog')).to_be_visible();assert 'mode=relations' in page.locator('#share-url').input_value();page.keyboard.press('Escape')
    ok('Shared link fallback works in a browser without clipboard permission')
    page.locator('.rel-journey [data-r-stage="4"]').click();expect(page.locator('#rel-challenge-answer')).to_contain_text('提交后')
    assert page.locator('.rel-score').count()==0
    cases={'ridge':([True,True,False,False],1),'rational':([True,True,True,True],0),'radial':([True,True,True,False],2)}
    for fn,(answers,reason) in cases.items():
        page.locator(f'[data-r-challenge="{fn}"]').click()
        for prop,v in zip(['P','C','D','S'],answers):page.locator(f'input[name="rel-{prop}"][value="{"yes" if v else "no"}"]').check()
        page.locator(f'input[name="reason"][value="{reason}"]').check()
        page.locator('#rel-predictions button[type="submit"]').click();expect(page.locator('#rel-prediction-result')).to_contain_text('4 / 4');expect(page.locator('#rel-prediction-result')).to_contain_text('理由正确')
        expect(page.locator('.rel-result-proof')).to_be_visible()
    screenshot(page,'relations-challenge-desktop.png')
    ok('All three unseen-function challenges validate four properties plus a reason and unfold substantive proofs')
    page.locator('input[name="rel-D"][value="no"]').check();page.locator('input[name="reason"][value="0"]').check();page.locator('#rel-predictions button[type="submit"]').click()
    expect(page.locator('#rel-prediction-result')).to_contain_text('3 / 4');expect(page.locator('#rel-prediction-result')).to_contain_text('理由需要修正')
    page.locator('[data-r-action="challenge-explore"]').click();expect(page.locator('#rel-function')).to_have_value('radial')
    page.locator('.rel-journey [data-r-stage="4"]').click();expect(page.locator('input[name="rel-D"][value="no"]')).to_be_checked()
    ok('Incorrect classifications and reasons are reported separately; drafts survive exploration without leaking to URLs')
    for width in [360,390,768,1024]:
        page.set_viewport_size({'width':width,'height':844})
        page.locator('.rel-journey [data-r-stage="0"]').click();no_overflow(page)
        if width==390:screenshot(page,'relations-map-mobile.png')
        open_edge(page,'p-c');no_overflow(page);page.locator('[data-r-action="proof"]').click();no_overflow(page)
        if width==390:screenshot(page,'relations-proof-mobile.png')
        page.locator('.rel-journey [data-r-stage="4"]').click();no_overflow(page)
    ok('Map, cases, long proofs and assessments have no document overflow at 360/390/768/1024 pixels')
    page.set_viewport_size({'width':390,'height':844});page.locator('.rel-journey [data-r-stage="0"]').click()
    expect(page.locator('.rel-mobile-graph')).to_be_visible();assert not page.locator('.rel-desktop-graph').is_visible()
    page.locator('.rel-mobile-graph [data-r-edge="d-s"]').click();expect(page.locator('h1')).to_have_text('可微 ⇏ 偏导连续')
    reveal(page,[True,True,True,False]);slider(page,'rel-sequence',100)
    screenshot(page,'relations-oscillation-mobile.png')
    ok('Mobile uses a readable directed tree and touchable inverse arrows rather than shrinking the desktop map')
    # Whole legacy app remains reachable, and no relation animation can corrupt it.
    page.set_viewport_size({'width':1512,'height':1100});page.locator('#nav-limits').click();expect(page.locator('h1')).to_have_text('所有直线，都不够。')
    page.locator('#nav-fields').click();expect(page.locator('#nav-fields')).to_have_attribute('aria-current','page')
    page.locator('#nav-differentiability').click();expect(page.locator('h1')).to_have_text('四个性质，一张关系图。')
    ok('Switching between relation lab, limits and field lab cleans up controllers and keeps existing experiments available')
    route(page,'lab=differentiability&mode=relations&fn=%3Cscript%3E&edge=bad&screen=case&q=NaN&angle=Infinity&n=9999')
    expect(page.locator('#rel-function')).to_have_value('bowl');expect(page.locator('#rel-angle')).to_have_value('45')
    assert 'NaN' not in page.locator('#rel-live-data').inner_text()
    ok('Malformed relation routes are rejected or clamped in the live app')
    page.locator('[data-r-action="reset"]').click();expect(page.locator('h1')).to_have_text('四个性质，一张关系图。');assert page.locator('input:checked').count()==0
    ok('Reset clears relation state and session prediction drafts')
    unnamed=page.locator('button').evaluate_all('els=>els.filter(e=>e.offsetWidth&&!e.getAttribute("aria-label")&&!e.textContent.trim()).map(e=>e.outerHTML)');assert not unnamed,unnamed
    assert not errors,errors
    external=[u for u in requests if not u.startswith(('http://127.0.0.1:','http://localhost:','data:','blob:','about:'))];assert not external,external
    ok('All exercised controls are named, no uncaught JS errors, and no external runtime requests')
    browser.close()
 report={'mode':'actual standalone HTML injected into about:blank' if args.offline_harness else 'served ES modules','browser':'Chromium','passed':len(results),'checks':results,'errors':errors,'external_requests':external,'notes':['Numerical checks validate implementation consistency, not general theorems.','Clipboard denial and Blob construction tested; native OS saving not assumed.','No Safari, Firefox or full screen-reader audit.']}
 (OUT/'relations-browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
 print(f'\n{len(results)} relation browser checks passed.')
finally:
 if server:server.terminate();server.wait(timeout=5)

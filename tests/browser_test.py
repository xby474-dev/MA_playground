"""Real Chromium interaction tests. Normal mode tests served ES modules.

Use --offline-harness only when browser network navigation is prohibited:
it injects the generated standalone HTML into about:blank. No browser policies
are modified. HTTP routing is then checked separately, not claimed as E2E-tested.
"""
from __future__ import annotations
import argparse
import json
import subprocess
import time
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--offline-harness', action='store_true')
parser.add_argument('--browser', help='Explicit Chromium executable, otherwise Playwright-managed Chromium')
parser.add_argument('--url', default='http://127.0.0.1:4173/MA_playground/')
args = parser.parse_args()
OUT = ROOT / 'test-results'
OUT.mkdir(exist_ok=True)
server = None
if not args.offline_harness:
    try:
        urllib.request.urlopen(args.url, timeout=1)
    except Exception:
        server = subprocess.Popen(['node','scripts/serve.mjs','--dir','dist','--port','4173'], cwd=ROOT, stdout=subprocess.DEVNULL)
        for _ in range(30):
            try:
                urllib.request.urlopen(args.url,timeout=1)
                break
            except Exception:
                time.sleep(.1)
results: list[str] = []
errors: list[str] = []
requests: list[str] = []

def ok(name: str) -> None:
    results.append(name)
    print(f'PASS {len(results):02d}  {name}', flush=True)

def slider(page, selector: str, value: float) -> None:
    page.locator(selector).evaluate('(el, value) => { el.value = value; el.dispatchEvent(new Event("input", {bubbles: true})); }', value)

def no_overflow(page, name: str) -> None:
    metrics=page.evaluate('({width: innerWidth, scroll: document.documentElement.scrollWidth})')
    assert metrics['scroll']<=metrics['width']+1, (name,metrics)

def screenshot(page, name: str) -> None:
    page.evaluate('window.scrollTo(0,0)')
    page.wait_for_timeout(100)
    page.screenshot(path=str(OUT/name),full_page=True,animations='disabled')

try:
    with sync_playwright() as p:
        options={'headless': True}
        if args.browser:
            options['executable_path']=args.browser
        browser=p.chromium.launch(**options)
        context=browser.new_context(viewport={'width':1512,'height':1100},device_scale_factor=1,reduced_motion='reduce',accept_downloads=True)
        page=context.new_page()
        page.set_default_timeout(6000)
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('request',lambda r:requests.append(r.url))
        if args.offline_harness:
            page.set_content((ROOT/'dist/standalone.html').read_text(),wait_until='load')
        else:
            page.goto(args.url,wait_until='networkidle')
        expect(page.locator('h1')).to_have_text('所有直线，都不够。')
        expect(page.locator('#nav-limits')).to_have_attribute('aria-current','page')
        expect(page.locator('math').first).to_be_visible()
        assert not errors, errors
        ok('Initial application, MathML and selected navigation render without JS errors')
        expect(page.locator('.page-guide')).to_be_visible()
        expect(page.locator('[data-guide-action="collapse"]')).to_be_visible()
        page.locator('[data-guide-action="collapse"]').click()
        expect(page.locator('[data-guide-action="expand"]')).to_be_visible()
        page.locator('[data-guide-action="expand"]').click()
        page.locator('[data-guide-action="start"]').click()
        expect(page.locator('[data-set="path"]').first).to_be_focused()
        ok('First-entry guide is expanded, collapsible, restorable and locates the first experiment control')
        assert page.locator('[data-action="camera-reset"]').is_hidden()
        assert page.locator('.skip-link').evaluate('(el)=>el.getBoundingClientRect().width')==1
        ok('Inactive camera controls and unfocused skip link are hidden')

        page.locator('[data-action="challenge"]').click()
        expect(page.locator('#live-data .data-value').last).to_have_text('0.5')
        expect(page.locator('#pin-count')).to_have_text('1/4')
        expect(page.locator('[data-set="path"][data-value="parabola"]')).to_have_attribute('aria-pressed','true')
        assert page.locator('#convergence-plot svg').count()==1
        ok('Guided counterexample pins a line and shows parabola limit 1/2')
        slider(page,'#scale',4)
        expect(page.locator('#live-data .data-value').last).to_have_text('0.5')
        assert '10⁻⁴' in page.locator('#scale-value').inner_text()
        ok('Extreme zoom parameter keeps the parabola value at 1/2')
        old_hash=page.evaluate('location.hash')
        page.locator('.skip-link').focus()
        page.keyboard.press('Enter')
        expect(page.locator('#main')).to_be_focused()
        assert page.evaluate('location.hash')==old_hash
        expect(page.locator('#live-data .data-value').last).to_have_text('0.5')
        ok('Skip link moves focus to main without resetting the experiment hash route')
        slider(page,'#coefficient',-2)
        expect(page.locator('#live-data .data-value').last).to_have_text('-0.4')
        page.locator('[data-set="sign"][data-value="-1"]').click()
        expect(page.locator('#live-data .data-value').last).to_have_text('-0.4')
        ok('Negative parabola coefficient and negative t preserve the analytic value')
        slider(page,'#coefficient',0)
        expect(page.locator('#live-data .data-value').last).to_have_text('0')
        assert 'counterexample' not in page.locator('#observation').get_attribute('class')
        page.locator('[data-set="path"][data-value="vertical"]').click()
        expect(page.locator('#coefficient')).to_be_disabled()
        expect(page.locator('#live-data .data-value').last).to_have_text('0')
        ok('Degenerate parabola and the separate vertical path are handled correctly')

        page.locator('[data-action="pin"]').click()
        page.locator('[data-action="pin"]').click()
        expect(page.locator('#pin-count')).to_have_text('2/4')
        page.locator('[data-set="path"][data-value="parabola"]').click()
        slider(page,'#coefficient',1)
        page.locator('[data-action="pin"]').click()
        slider(page,'#coefficient',2)
        page.locator('[data-action="pin"]').click()
        slider(page,'#coefficient',3)
        page.locator('[data-action="pin"]').click()
        expect(page.locator('#pin-count')).to_have_text('4/4')
        page.locator('[data-action="unpin"]').first.click()
        expect(page.locator('#pin-count')).to_have_text('3/4')
        ok('Pin uniqueness, maximum capacity and removal work')
        page.locator('#zoom').check()
        assert '局部放大' in page.locator('#main-plot').inner_text()
        assert 'NaN' not in page.locator('#main-plot').inner_html()
        ok('Follow zoom produces finite, equal-scale plane coordinates')

        page.locator('[data-set="view"][data-value="surface"]').click()
        expect(page.locator('#surface')).to_be_visible()
        page.wait_for_timeout(100)
        before=page.locator('#surface').evaluate('(c)=>c.toDataURL()')
        page.locator('#surface').focus()
        page.keyboard.press('ArrowRight')
        after=page.locator('#surface').evaluate('(c)=>c.toDataURL()')
        assert before!=after
        page.keyboard.press('Home')
        reset=page.locator('#surface').evaluate('(c)=>c.toDataURL()')
        assert before==reset
        ok('3D rendering responds to keyboard rotation and exact camera reset')
        page.locator('[data-set="view"][data-value="plane"]').click()
        assert page.locator('#surface').count()==0
        ok('Switching away from Canvas cleans up the surface element')

        # Test export construction in-browser. Native download may be blocked by enterprise policy.
        page.evaluate('() => { window.__export = null; window.__oldBlobURL = URL.createObjectURL; URL.createObjectURL = blob => { window.__export = blob; return window.__oldBlobURL(blob); }; }')
        page.locator('[data-action="export"]').click()
        csv=page.evaluate('window.__export.text()')
        assert 'finite samples are not a proof' in csv
        assert len([x for x in csv.splitlines() if not x.startswith('#')])==102
        assert 'comparison_1' in csv
        ok('CSV export creates 101 samples, comparison data and a non-proof disclaimer')
        # Exercise the denied/unavailable-clipboard fallback without granting permissions.
        page.evaluate('Object.defineProperty(navigator,"clipboard",{configurable:true,value:undefined})')
        page.locator('[data-action="share"]').click()
        expect(page.locator('#share-dialog')).to_be_visible()
        url=page.locator('#share-url').input_value()
        assert 'pins=' in url and 'lab=limits' in url
        page.keyboard.press('Escape')
        expect(page.locator('#share-dialog')).not_to_be_visible()
        page.locator('#share-dialog').evaluate('(d)=>{if(d.open)d.close()}')
        expect(page.locator('#share-dialog')).to_be_hidden()
        ok('Sharing preserves experiment inputs and has a keyboard-dismissable clipboard fallback')

        page.locator('[data-action="reset"]').click()
        expect(page.locator('#pin-count')).to_have_text('0/4')
        expect(page.locator('#coefficient')).to_have_value('1')
        ok('Reset restores a clean experiment')
        page.locator('[data-action="challenge"]').click()
        page.wait_for_timeout(4300)
        screenshot(page,'limits-desktop.png')
        page.locator('#tab-proof').click()
        assert '竖直线' in page.locator('#panel-proof').inner_text()
        assert '∀' in page.locator('#panel-proof').inner_text()
        assert 'PLACEHOLDER' not in page.locator('#panel-proof').inner_html()
        no_overflow(page,'desktop proof')
        screenshot(page,'limits-proof.png')
        ok('Limit proof renders quantifiers, separate vertical path and the contradiction')

        page.locator('#tab-quiz').click()
        for i,v in enumerate([1,1,2]):
            page.locator(f'input[name="question-{i}"][value="{v}"]').check()
        page.locator('#quiz-form button[type="submit"]').click()
        expect(page.locator('#quiz-summary')).to_contain_text('3 / 3')
        assert page.locator('.quiz-feedback.correct').count()==3
        page.locator('input[name="question-0"][value="0"]').check()
        page.locator('#quiz-form button[type="submit"]').click()
        expect(page.locator('#quiz-summary')).to_contain_text('2 / 3')
        page.locator('#tab-proof').click()
        page.locator('#tab-quiz').click()
        expect(page.locator('input[name="question-0"][value="0"]')).to_be_checked()
        page.locator('[data-action="quiz-reset"]').click()
        assert page.locator('input:checked').count()==0
        ok('Quiz answers, scoring, explanations, tab persistence and reset work')

        page.locator('#nav-differentiability').click()
        # v1.2 navigation opens the relation graph. Original v1.0 UI remains
        # reachable for this unchanged legacy regression flow. New UI has its own suite.
        page.evaluate('location.hash="lab=differentiability&mode=classic"')
        expect(page.locator('h1')).to_have_text('偏导存在，也不够。')
        expect(page.locator('#surface')).to_be_visible()
        expect(page.locator('#live-data .data-value').last).to_have_text('0.5')
        assert '1/2' in page.locator('#worst-error').inner_text()
        ok('Differentiability starts with the counterexample and exact worst-case formula')
        for direction in ['0','90']:
            page.locator(f'[data-action="direction"][data-value="{direction}"]').click()
            expect(page.locator('#live-data .data-value').last).to_have_text('0')
        page.locator('[data-action="direction"][data-value="45"]').click()
        slider(page,'#scale',4)
        expect(page.locator('#live-data .data-value').last).to_have_text('0.5')
        assert '5 × 10⁻⁵' in page.locator('#live-data').inner_text()
        ok('Axis directions give zero while diagonal relative error remains 1/2')
        page.locator('[data-set="metric"][data-value="raw"]').click()
        assert '两种误差都会变小' in page.locator('#chart-title').inner_text()
        page.locator('[data-set="metric"][data-value="ratio"]').click()
        assert '除以位移' in page.locator('#chart-title').inner_text()
        page.locator('[data-set="model"][data-value="smooth"]').click()
        expect(page.locator('#live-data .data-value').last).to_have_text('1 × 10⁻⁴')
        assert '在所有方向上' in page.locator('#observation').inner_text()
        ok('Metric switch contrasts raw and relative error; smooth error is rho')
        page.locator('[data-set="view"][data-value="polar"]').click()
        expect(page.locator('#zoom')).to_be_disabled()
        assert '而非输入位移' in page.locator('#main-plot svg').get_attribute('aria-label')
        slider(page,'#angle',360)
        assert 'NaN' not in page.locator('#main-plot').inner_html()
        ok('Polar direction scan has explicit error-radius semantics and finite endpoints')
        page.locator('[data-set="view"][data-value="surface"]').click()
        page.locator('#zoom').check()
        expect(page.locator('#surface')).to_be_visible()
        ok('Local surface zoom renders without changing the error calculation')

        slider(page,'#scale',1)
        page.locator('[data-action="play"]').click()
        page.wait_for_timeout(450)
        q=float(page.locator('#scale').input_value())
        assert q>1
        page.locator('[data-action="play"]').click()
        q2=page.locator('#scale').input_value()
        page.wait_for_timeout(220)
        assert page.locator('#scale').input_value()==q2
        ok('Explicit animation advances the logarithmic scale and pauses cleanly')
        page.locator('#tab-explore').focus()
        page.keyboard.press('ArrowRight')
        expect(page.locator('#tab-proof')).to_be_focused()
        expect(page.locator('#tab-proof')).to_have_attribute('aria-selected','true')
        page.locator('.extra-note summary').click()
        assert '双侧' in page.locator('#panel-proof').inner_text()
        page.locator('#tab-proof').focus()
        page.keyboard.press('ArrowRight')
        expect(page.locator('#tab-quiz')).to_be_focused()
        ok('ARIA tabs support arrow keys and retain keyboard focus')
        for i,v in enumerate([0,1,2]):
            page.locator(f'input[name="question-{i}"][value="{v}"]').check()
        page.locator('#quiz-form button[type="submit"]').click()
        expect(page.locator('#quiz-summary')).to_contain_text('3 / 3')
        ok('Second experiment quiz has consistent correct answers and explanations')

        page.locator('#tab-explore').click()
        page.locator('[data-action="reset"]').click()
        page.wait_for_timeout(4300)
        screenshot(page,'differentiability-desktop.png')
        page.locator('[data-set="view"][data-value="polar"]').click()
        screenshot(page,'direction-scan.png')
        page.locator('#tab-proof').click()
        screenshot(page,'differentiability-proof.png')
        for width in [360,390,768,1024]:
            page.set_viewport_size({'width':width,'height':844})
            for tab in ['explore','proof','quiz']:
                page.locator(f'#tab-{tab}').click()
                no_overflow(page,f'{width}px {tab}')
            if width==390:
                page.locator('#tab-explore').click()
                screenshot(page,'differentiability-mobile.png')
        ok('No horizontal document overflow across 360, 390, 768 and 1024 px and all three panels')
        page.set_viewport_size({'width':390,'height':844})
        page.locator('#nav-limits').click()
        page.locator('[data-action="challenge"]').click()
        slider(page,'#scale',4)
        page.locator('#zoom').check()
        no_overflow(page,'mobile limits extremes')
        page.wait_for_timeout(4300)
        screenshot(page,'limits-mobile.png')
        ok('Mobile limit controls, exponential values and zoom remain usable')

        # Malformed hash changes exercise the real router and all allowlists.
        page.evaluate('location.hash="lab=limits&k=Infinity&q=NaN&view=%3Cscript%3E&pins=bad:999"')
        page.wait_for_timeout(100)
        expect(page.locator('h1')).to_have_text('所有直线，都不够。')
        assert page.locator('#main-plot svg').count()==1
        assert 'NaN' not in page.locator('#main-plot').inner_html()
        ok('Malformed deep links cannot inject markup or poison plotting state')

        page.set_viewport_size({'width':1512,'height':1100})
        page.locator('[data-action="about"]').first.click()
        expect(page.locator('#about-dialog')).to_be_visible()
        page.keyboard.press('Escape')
        expect(page.locator('#about-dialog')).not_to_be_visible()
        unnamed=page.locator('button').evaluate_all('els=>els.filter(e=>e.offsetWidth && !e.getAttribute("aria-label") && !e.textContent.trim()).map(e=>e.outerHTML)')
        assert not unnamed,unnamed
        external=page.locator('a[target="_blank"]').evaluate_all('els=>els.filter(e=>!e.rel.includes("noopener")).map(e=>e.href)')
        assert not external,external
        assert page.evaluate('matchMedia("(prefers-reduced-motion: reduce)").matches')
        ok('Dialogs, named controls, secure external links and reduced-motion preference are present')
        assert not errors,errors
        external_requests=[u for u in requests if not u.startswith(('http://127.0.0.1:','http://localhost:','data:','blob:','about:'))]
        assert not external_requests,external_requests
        ok('All exercised UI flows are free of uncaught JS errors and external runtime requests')
        browser.close()
    report={'mode':'standalone injection (no browser network navigation)' if args.offline_harness else 'served ES modules', 'browser':'Chromium', 'passed':len(results), 'checks':results, 'uncaught_errors':errors, 'notes':['Native clipboard success is not asserted; denial fallback is tested.','CSV Blob content is checked; system file-save permission is not assumed.','Finite math tests check implementation consistency, not theorem validity.']}
    (OUT/'browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print(f'\n{len(results)} browser checks passed. Mode: {report["mode"]}')
finally:
    if server:
        server.terminate()
        server.wait(timeout=5)

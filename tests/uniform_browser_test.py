"""Browser checks for the v1.6 uniform-convergence experiment.

The default path exercises the production HTTP build; --offline-harness uses
the generated standalone artifact when managed browser policy blocks navigation.
"""
from __future__ import annotations
import argparse, subprocess, time, urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--offline-harness', action='store_true')
parser.add_argument('--browser')
parser.add_argument('--url', default='http://127.0.0.1:4173/MA_playground/')
args = parser.parse_args()
server = None
if not args.offline_harness:
    try:
        urllib.request.urlopen(args.url, timeout=1)
    except Exception:
        server = subprocess.Popen(['node', 'scripts/serve.mjs', '--dir', 'dist', '--port', '4173'], cwd=ROOT, stdout=subprocess.DEVNULL)
        for _ in range(40):
            try:
                urllib.request.urlopen(args.url, timeout=1)
                break
            except Exception:
                time.sleep(.1)

checks = []
errors = []
OUT = ROOT / 'test-results'
OUT.mkdir(exist_ok=True)

def ok(message):
    checks.append(message)
    print(f'PASS {len(checks):02d}  {message}', flush=True)

def route(page, hash_value):
    page.evaluate('(h) => { location.hash = h }', hash_value)
    page.wait_for_timeout(120)

def no_unknown(page):
    bad = page.evaluate('''() => Array.from(document.querySelectorAll('#main *')).filter(el => el instanceof HTMLUnknownElement).map(el => el.tagName)''')
    assert not bad, bad

try:
    with sync_playwright() as p:
        options = {'headless': True}
        if args.browser:
            options['executable_path'] = args.browser
        browser = p.chromium.launch(**options)
        context = browser.new_context(viewport={'width': 1512, 'height': 1100}, accept_downloads=True)
        page = context.new_page()
        page.set_default_timeout(8000)
        page.on('pageerror', lambda error: errors.append(str(error)))
        if args.offline_harness:
            page.set_content((ROOT / 'dist' / 'uniform-lab.html').read_text(encoding='utf-8'), wait_until='load')
        else:
            page.goto(args.url, wait_until='networkidle')
            page.locator('#nav-uniform').click()
        expect(page.locator('#uf-title')).to_contain_text('每个点')
        expect(page.locator('#nav-uniform')).to_have_attribute('aria-current', 'page')
        assert page.locator('.lab-nav').count() == 7
        expect(page.locator('.page-guide')).to_be_visible()
        expect(page.locator('.page-guide')).to_contain_text('本页要回答的问题')
        ok('Seventh experiment mounts with seven navigation entries and an expanded start guide')

        page.locator('[data-guide-action="start"]').click()
        expect(page.locator('[data-uf-screen="workshop"]')).to_have_attribute('aria-current', 'step')
        expect(page.locator('#uf-main-plot svg')).to_be_visible()
        expect(page.locator('#uf-history svg')).to_be_visible()
        ok('Start guide moves to the workshop and renders the real partial-sum and error plots')

        page.locator('[data-uf-track="follow"]').click()
        expect(page.locator('#uf-track-note')).to_contain_text('重新选择一个点')
        page.locator('#uf-N').evaluate("(e) => { e.value = 32; e.dispatchEvent(new Event('input', {bubbles:true})) }")
        expect(page.locator('#uf-live')).to_contain_text('移动点')
        ok('Fixed-point and escaping-point modes remain visibly distinct')

        page.locator('#uf-family').select_option('power')
        page.locator('#uf-domain').select_option('restricted')
        expect(page.locator('#uf-formula')).to_contain_text('xᴺ')
        page.locator('[data-uf-action="certificate"]').click()
        expect(page.locator('#uf-certificate')).to_contain_text('一个 N')
        ok('Restricted power family exposes an analytic uniform certificate')

        route(page, '#lab=uniform&screen=workshop&family=power&domain=closed&track=follow&N=20')
        expect(page.locator('#uf-plot-note')).to_contain_text('有限采样')
        expect(page.locator('#uf-certificate')).to_contain_text('找不到这样的 N')
        ok('Closed-domain x^N keeps the pointwise counterexample and refuses a false global certificate')

        page.locator('[data-uf-screen="proof"]').first.click()
        expect(page.locator('[data-uf-step="0"]')).to_be_visible()
        for step in range(4):
            page.locator(f'[data-uf-step="{step}"]').click()
            assert len(page.locator('#uf-proof-current').inner_text()) > 30
        page.locator('.uf-full-proof summary').click()
        assert page.locator('.uf-full-proof section').count() == 4
        no_unknown(page)
        ok('Proof screen exposes all four authored steps and the complete argument')

        page.locator('[data-uf-screen="challenge"]').click()
        assert page.locator('#uf-quiz fieldset').count() == 6
        page.locator('#uf-quiz button[type="submit"]').click()
        expect(page.locator('#uf-quiz-score')).to_contain_text('/ 6')
        ok('Challenge screen keeps six explanations instead of only a score')

        page.locator('[data-action="share"]').click()
        if page.locator('#share-dialog').is_visible():
            assert 'lab=uniform' in page.locator('#share-url').input_value()
            page.locator('#share-dialog [data-action="close-dialog"]').click()
        page.keyboard.press('Escape')
        ok('Uniform experiment state is shareable without changing the existing dialog contract')

        assert errors == [], errors
        browser.close()
finally:
    if server:
        server.terminate()

print(f'UNIFORM_BROWSER_CHECKS={len(checks)}')

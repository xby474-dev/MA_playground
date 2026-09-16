"""Real-browser regression tests for the unified field lab.

Default: served production ES modules. --offline-harness: inject the actual
standalone build without changing browser/network policy. Never claim that
injection verifies HTTP module loading; Node separately tests those resources.
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
OUT=ROOT/'test-results'; OUT.mkdir(exist_ok=True)
parser=argparse.ArgumentParser()
parser.add_argument('--offline-harness',action='store_true')
parser.add_argument('--browser')
parser.add_argument('--url',default='http://127.0.0.1:4173/MA_playground/')
args=parser.parse_args()
server=None
if not args.offline_harness:
    try: urllib.request.urlopen(args.url,timeout=1)
    except Exception:
        server=subprocess.Popen(['node','scripts/serve.mjs','--dir','dist','--port','4173'],cwd=ROOT,stdout=subprocess.DEVNULL)
        for _ in range(35):
            try: urllib.request.urlopen(args.url,timeout=1); break
            except Exception: time.sleep(.1)
results=[]; errors=[]; requests=[]
def ok(name):
    results.append(name);print(f'PASS {len(results):02d}  {name}',flush=True)
def slider(page,key,value):
    page.locator(f'#field-{key}').evaluate('(el,v)=>{el.value=v;el.dispatchEvent(new Event("input",{bubbles:true}));}',value)
def value(page,where='inside'):
    return float(page.locator(f'#field-{where}-value').inner_text().replace('−','-').replace(',',''))
def no_overflow(page):
    m=page.evaluate('({w:innerWidth, sw:document.documentElement.scrollWidth})');assert m['sw']<=m['w']+1,m

def snap(page,name):
    page.evaluate('scrollTo(0,0)');page.screenshot(path=str(OUT/name),full_page=True,animations='disabled')

try:
    with sync_playwright() as p:
        opts={'headless':True}
        if args.browser:opts['executable_path']=args.browser
        browser=p.chromium.launch(**opts)
        context=browser.new_context(viewport={'width':1512,'height':1100},device_scale_factor=1,reduced_motion='reduce',accept_downloads=True)
        page=context.new_page();page.set_default_timeout(8000)
        page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url))
        if args.offline_harness:page.set_content((ROOT/'dist/standalone.html').read_text(),wait_until='load')
        else:page.goto(args.url,wait_until='networkidle')
        page.locator('#nav-fields').click();expect(page.locator('#nav-fields')).to_have_attribute('aria-current','page')
        expect(page.locator('#field-scene svg')).to_be_visible();assert page.locator('.lab-nav').count()==6  # v1.5 adds series; all existing navigation remains
        expect(page.locator('.page-guide[data-guide="fields"]')).to_be_visible()
        expect(page.locator('.page-guide[data-guide="fields"] [data-guide-action="start"]')).to_be_visible()
        ok('Field experiment opens with an in-page guide that explains the local-to-boundary question')
        for nav_id in ['nav-limits','nav-differentiability','nav-fields','nav-completeness','nav-taylor','nav-series']: assert page.locator('#'+nav_id).count()==1
        assert value(page)==6 and value(page,'outside')==6
        ok('Third lab mounts in the existing app; legacy navigation and analytical readouts are present')
        expect(page.locator('.field-journey [data-field-stage="green"]')).to_have_attribute('aria-current','step')
        assert page.locator('.field-journey button').count()==5
        ok('Five connected stations form one experiment rather than separate formula pages')
        for phase in [1,2,3,0]:
            page.locator(f'[data-field-phase="{phase}"]').click();expect(page.locator(f'[data-field-phase="{phase}"]')).to_have_attribute('aria-pressed','true')
        ok('Four local-to-boundary phases are directly operable')
        slider(page,'n',4);assert '16' in page.locator('#field-counts').inner_text();assert value(page)==6
        slider(page,'n',6);assert '36' in page.locator('#field-counts').inner_text();assert value(page)==6
        slider(page,'n',3)
        ok('Refinement changes cell and incidence counts without changing the integral')
        page.locator('[data-field-phase="2"]').click();expect(page.locator('#field-pair')).to_be_visible()
        pair=page.locator('#field-pair').inner_text();assert '相反定向' in pair and '=0' in pair.replace(' ','').replace('\n','')
        slider(page,'cancel',0);before=page.locator('#field-scene').inner_html()
        slider(page,'cancel',1);after=page.locator('#field-scene').inner_html();assert before!=after and value(page)==6
        ok('Cancellation changes the display only; independently computed paired contributions sum to zero')
        snap(page,'field-green-cancellation.png')
        page.locator('[data-field-cell="8"]').first.click();expect(page.locator('#field-cell')).to_have_value('9')
        page.locator('#field-cell').fill('2');expect(page.locator('#field-cell')).to_have_value('2')
        ok('SVG selection and accessible numeric cell selector stay synchronized')
        page.locator('[data-field-preset="source"]').click();assert value(page)==0
        page.locator('[data-field-preset="rotation"]').click();assert value(page)==6
        slider(page,'b',-2);assert value(page)==-12
        ok('Pure source, rotation and negative curl produce distinct signed circulation results')
        page.locator('.field-advanced>summary').click();page.locator('[data-field-orientation="-1"]').click();assert value(page)==12
        assert '旋度' in page.locator('#field-orientation-note').inner_text()
        page.locator('[data-field-orientation="1"]').click();page.locator('[data-field-preset="mixed"]').click()
        ok('Reversing Green orientation flips both integrals, not the field derivative')
        slider(page,'c',0);assert value(page)==4
        slider(page,'L',3);assert value(page)==9
        slider(page,'L',2);slider(page,'c',.5)
        ok('Domain size and spatial profile update the analytical integrals')
        page.locator('[data-field-action="next-stage"]').click()
        expect(page.locator('.field-journey [data-field-stage="flux"]')).to_have_attribute('aria-current','step')
        assert value(page)==7.2 and value(page,'outside')==7.2
        page.locator('[data-field-phase="1"]').click();snap(page,'field-planar-flux.png')
        ok('Guided next step preserves the field and replaces circulation with planar flux')
        page.locator('[data-field-preset="rotation"]').click();assert value(page)==0
        page.locator('[data-field-preset="source"]').click();assert value(page)==12
        page.locator('[data-field-action="next-stage"]').click();assert value(page)==32
        ok('Planar flux extends to volume flux; a rotational component has no divergence contribution')
        slider(page,'n',4);counts=page.locator('#field-counts').inner_text();assert all(x in counts for x in ['64','144','96'])
        slider(page,'slice',3);assert int(page.locator('#field-cell').input_value())>48
        page.locator('#field-cell').fill('999');expect(page.locator('#field-cell')).to_have_value('64')
        slider(page,'n',2);assert int(page.locator('#field-cell').input_value())<=8
        ok('Gauss layer and cell selection are clamped coherently when the mesh changes')
        slider(page,'n',3);page.locator('#field-cell').fill('5');page.locator('[data-field-phase="2"]').click()
        slider(page,'cancel',.35);snap(page,'field-gauss-cancellation.png')
        page.locator('[data-field-phase="3"]').click();snap(page,'field-gauss-boundary.png')
        assert '闭合外壳' in page.locator('#field-outside-label').inner_text()
        ok('Gauss shows shared-face cancellation followed by the complete closed outer shell')
        page.locator('.field-advanced>summary').click();page.locator('[data-field-orientation="-1"]').click();assert value(page)==-32
        assert '−∫' in page.locator('#field-orientation-note').inner_text()
        page.locator('[data-field-orientation="1"]').click()
        ok('Inward Gauss observation explicitly negates the volume integral')
        angle_before=page.locator('#field-scene').inner_html();slider(page,'viewAngle',65);assert angle_before!=page.locator('#field-scene').inner_html() and value(page)==32
        ok('Three-dimensional viewing angle affects geometry but not mathematics')
        page.locator('#nav-fields').click();page.locator('.field-journey [data-field-stage="stokes"]').click()
        assert value(page)==6
        slider(page,'h',0);flat=page.locator('#field-local-data').inner_text()
        slider(page,'h',1.65);curved=page.locator('#field-local-data').inner_text()
        assert flat!=curved and value(page)==6 and value(page,'outside')==6
        assert '参数面积' in curved and '中心处的面积因子不是整块的实际面积' in curved
        ok('Surface bending changes local normal density and area factor while retaining boundary circulation')
        page.locator('[data-field-phase="1"]').click();snap(page,'field-stokes-surface.png')
        page.locator('.field-advanced>summary').click();slider(page,'a',-2);assert value(page)==6
        page.locator('[data-field-orientation="-1"]').click();assert value(page)==-6
        ok('Stokes is insensitive to gradient additions; normal and boundary orientation flip together')
        slider(page,'L',1);slider(page,'h',2);slider(page,'viewAngle',-180)
        assert 'NaN' not in page.locator('#field-scene').inner_html();assert value(page)==-1.25
        ok('Steep surface and view-angle extremes stay finite and integral-consistent')
        # CSV creation tested independently of host download permissions.
        page.evaluate('''()=>{window.__fieldCsv=null;window.__originalURL=URL.createObjectURL;URL.createObjectURL=b=>{b.text().then(t=>window.__fieldCsv=t);return "blob:test";};window.__oldAnchor=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){};}''')
        page.locator('[data-field-action="export"]').click();page.wait_for_function('window.__fieldCsv!==null')
        csv=page.evaluate('window.__fieldCsv');assert 'analytic' in csv and len(csv.strip().split('\n'))==12
        page.evaluate('()=>{URL.createObjectURL=window.__originalURL;HTMLAnchorElement.prototype.click=window.__oldAnchor;}')
        ok('CSV contains parameters and all independently computed cell integrals')
        saved=page.evaluate('location.hash');page.locator('[data-action="reset"]').click();assert value(page)==6
        page.evaluate('(h)=>{location.hash=h;}',saved);expect(page.locator('.field-journey [data-field-stage="stokes"]')).to_have_attribute('aria-current','step')
        assert value(page)==-1.25;expect(page.locator('#field-h')).to_have_value('2')
        ok('Share hash restores theorem, shape, orientation and numerical parameters')
        page.locator('.field-journey [data-field-stage="unify"]').click();assert page.locator('#field-summary-table tr').count()==4
        assert '二维' in page.locator('.field-comparison').inner_text()
        page.locator('[data-field-action="hole"]').click();assert '−2π' in page.locator('#field-hole-explanation').inner_text()
        page.locator('[data-field-action="hole"]').click();assert '没有定义' in page.locator('#field-hole-explanation').inner_text()
        snap(page,'field-unified-overview.png')
        ok('Unified map preserves dimensions and the hole example includes the inner boundary or fails the hypotheses')
        page.locator('#tab-proof').click();assert '一维微积分基本定理' in page.locator('#panel-proof').inner_text()
        assert 'Fubini' in page.locator('#panel-proof').inner_text()
        page.get_by_text('曲面隆起为什么不改变本例的环流？',exact=True).click()
        assert '实际面积元' in page.locator('#panel-proof').inner_text()
        page.locator('.field-theorem-list summary').nth(2).click()
        snap(page,'field-proof.png')
        ok('Proof path includes hypotheses, FTC/Fubini, cancellation and pullback; authored content remains offline')
        page.locator('#tab-proof').focus();page.keyboard.press('ArrowRight');expect(page.locator('#tab-quiz')).to_have_attribute('aria-selected','true')
        expect(page.locator('#tab-quiz')).to_be_focused()
        ok('Existing keyboard-operated learning tabs work with the new experiment')
        keys=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {fieldQuizzes} from './src/field-content.js';console.log(JSON.stringify(fieldQuizzes.map(q=>q.correct)));"],cwd=ROOT,text=True))
        for i,k in enumerate(keys):page.locator(f'input[name="field-question-{i}"][value="{k}"]').check()
        page.locator('#field-quiz-form button[type="submit"]').click();expect(page.locator('#field-quiz-result')).to_contain_text('8 / 8')
        assert page.locator('.quiz-feedback.correct').count()==8
        ok('All eight quiz keys are scored correctly and explanations are shown')
        page.locator('#tab-explore').click();page.locator('#tab-quiz').click()
        assert page.locator('#field-quiz-form input:checked').count()==8
        page.locator('[data-field-action="quiz-reset"]').click();assert page.locator('#field-quiz-form input:checked').count()==0
        for i,k in enumerate(keys):page.locator(f'input[name="field-question-{i}"][value="{(k+1)%3}"]').check()
        page.locator('#field-quiz-form button[type="submit"]').click();expect(page.locator('#field-quiz-result')).to_contain_text('0 / 8')
        ok('Quiz persistence, reset and incorrect-answer feedback are implemented')
        page.locator('#nav-fields').click();page.locator('[data-field-action="play"]').click()
        expect(page.locator('[data-field-phase="3"]')).to_have_attribute('aria-pressed','true')
        ok('Reduced-motion preference skips automatic animation without hiding the final state')
        page.emulate_media(reduced_motion='no-preference');page.locator('[data-field-action="play"]').click();page.wait_for_timeout(260)
        expect(page.locator('[data-field-action="play"]')).to_have_attribute('aria-pressed','true')
        page.locator('[data-field-action="play"]').click();paused=page.locator('#field-cancel').input_value();page.wait_for_timeout(300)
        assert page.locator('#field-cancel').input_value()==paused
        page.locator('[data-field-action="play"]').click();page.wait_for_timeout(4300)
        expect(page.locator('[data-field-phase="3"]')).to_have_attribute('aria-pressed','true')
        ok('Animation plays, pauses and finishes at the outer boundary')
        page.locator('[data-field-action="play"]').click();page.locator('#nav-limits').click();page.wait_for_timeout(200)
        expect(page.locator('#nav-limits')).to_have_attribute('aria-current','page');expect(page.locator('#coefficient')).to_be_visible()
        # v1.2 exposes the relation graph by default; retain the old comparison assertion as well.
        page.locator('#nav-differentiability').click();expect(page.locator('#rel-map-graph')).to_be_visible()
        page.evaluate('location.hash="lab=differentiability&mode=classic"');expect(page.locator('#angle')).to_be_visible()
        ok('Leaving a playing field lab cleans up animation and preserves both original experiments')
        page.locator('#nav-fields').click();page.emulate_media(reduced_motion='reduce')
        for width in [360,390,768,1024]:
            page.set_viewport_size({'width':width,'height':900})
            for stage in ['green','flux','gauss','stokes','unify']:
                page.locator(f'.field-journey [data-field-stage="{stage}"]').click()
                for tab in ['explore','proof','quiz']:
                    page.locator(f'#tab-{tab}').click();no_overflow(page)
                page.locator('#tab-explore').click()
            ok(f'All five stages and three learning panels fit the {width}px viewport without document overflow')
        page.set_viewport_size({'width':390,'height':900});page.locator('.field-journey [data-field-stage="stokes"]').click();page.locator('[data-field-phase="2"]').click()
        snap(page,'field-stokes-mobile.png')
        assert 'compact-scene' in page.locator('#field-scene svg').get_attribute('class')
        page.locator('.field-journey [data-field-stage="gauss"]').click();snap(page,'field-gauss-mobile.png')
        ok('Mobile geometry is reframed, not just shrunk to illegible desktop labels')
        page.evaluate('location.hash="#lab=fields&stage=<img%20src=x>&n=Infinity&a=NaN&cell=-99&L=0&h=999&viewAngle=Infinity"')
        expect(page.locator('.field-journey [data-field-stage="green"]')).to_have_attribute('aria-current','step')
        assert page.locator('#main img').count()==0 and 'NaN' not in page.locator('#field-scene').inner_html()
        ok('Malformed deep links cannot inject markup or non-finite geometry')
        page.locator('.skip-link').focus();oldhash=page.evaluate('location.hash');page.keyboard.press('Enter');assert page.evaluate('location.hash')==oldhash
        expect(page.locator('#main')).to_be_focused()
        ok('Skip link retains the full field route and moves keyboard focus into the experiment')
        direct=context.new_page();direct.on('pageerror',lambda e:errors.append(str(e)));direct.on('request',lambda r:requests.append(r.url))
        if args.offline_harness:direct.set_content((ROOT/'dist/field-lab.html').read_text(),wait_until='load')
        else:direct.goto(args.url+'field-lab.html',wait_until='networkidle')
        expect(direct.locator('#nav-fields')).to_have_attribute('aria-current','page')
        expect(direct.locator('#field-scene svg')).to_be_visible();assert direct.locator('.lab-nav').count()==6
        direct.close()
        ok('Direct offline entry opens the unified lab without a hash and retains all six experiments')
        assert not errors,errors
        external=[r for r in requests if r.startswith('http') and not r.startswith(('http://127.0.0.1','http://localhost'))]
        assert not external,external
        ok('Exercised flows have no uncaught errors and no external runtime requests')
        report={'passed':len(results),'checks':results,'errors':errors,'mode':'standalone injection' if args.offline_harness else 'served production ES modules','browser':browser.version,'viewport_widths':[360,390,768,1024,1512],'runtime_requests':requests}
        (OUT/'field-browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
        browser.close()
finally:
    if server:server.terminate();server.wait(timeout=5)
print(f'\n{len(results)} field browser checks passed.',flush=True)

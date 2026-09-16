import test from 'node:test';
import assert from 'node:assert/strict';
import { header } from '../src/content.js';
import { fieldHeader } from '../src/field-content.js';
import { relationsHeader } from '../src/relations-content.js';
import { completenessPage } from '../src/completeness-content.js';
import { completenessDefaults } from '../src/completeness-state.js';
import { taylorPage } from '../src/taylor-content.js';
import { taylorDefaults } from '../src/taylor-state.js';
import { seriesPage } from '../src/series-content.js';
import { seriesDefaults } from '../src/series-state.js';
import { defaults } from '../src/state.js';
import { fieldDefaults } from '../src/field-state.js';
import { relationsDefaults } from '../src/relations-state.js';
import { guideStorageKey, pageGuide } from '../src/page-guide.js';

test('Every experiment header includes a first-entry guide with the approved learning copy', () => {
  const pages = [
    header(defaults()),
    header(defaults('differentiability')),
    fieldHeader(fieldDefaults()),
    relationsHeader(relationsDefaults()),
    completenessPage(completenessDefaults()),
    taylorPage(taylorDefaults()),
    seriesPage(seriesDefaults()),
  ];
  for (const html of pages) {
    assert.ok(html.includes('class="page-guide"'));
    assert.ok(html.includes('本页要回答的问题'));
    assert.ok(html.includes('怎么开始'));
    assert.ok(html.includes('重点观察'));
    assert.ok(html.includes('本页结论'));
    assert.ok(html.includes('常见误区'));
    assert.ok(html.includes('data-guide-action="collapse"'));
    assert.ok(html.includes('data-guide-action="expand"'));
    assert.ok(html.includes('开始第 1 步'));
  }
});

test('Guide content links the three experiments to their full documentation', () => {
  for (const [type, doc, text] of [
    ['limits', 'MATHEMATICS.md', '多元极限'],
    ['differentiability', 'RELATIONS-GUIDE.md', '关系实验'],
    ['fields', 'FIELD-GUIDE.md', '场实验'],
    ['completeness', 'COMPLETENESS-GUIDE.md', '完备性实验'],
    ['taylor', 'TAYLOR-GUIDE.md', 'Taylor 实验'],
    ['series', 'SERIES-GUIDE.md', '级数实验'],
  ]) {
    const html = pageGuide(type);
    assert.ok(html.includes(doc));
    assert.ok(html.includes(text));
    assert.ok(html.includes('target="_blank"'));
  }
});

test('Guide state keys separate experiments, modes, tabs and relation screens', () => {
  const limits = guideStorageKey({ type: 'limits', tab: 'explore' });
  const proof = guideStorageKey({ type: 'limits', tab: 'proof' });
  const relationMap = guideStorageKey({ type: 'differentiability', mode: 'relations', screen: 'map' });
  const relationCase = guideStorageKey({ type: 'differentiability', mode: 'relations', screen: 'case' });
  assert.notEqual(limits, proof);
  assert.notEqual(relationMap, relationCase);
  assert.notEqual(limits, relationMap);
});

test('The new completeness and Taylor screens each receive screen-specific guidance', () => {
  for (const screen of ['map', 'explore', 'proof', 'challenge']) {
    const html = completenessPage({ ...completenessDefaults(), screen });
    assert.match(html, /data-guide="completeness"/);
    assert.match(html, new RegExp(`page-guide-completeness-${screen}`));
  }
  for (const screen of ['grow', 'error', 'boundary', 'proof', 'challenge']) {
    const html = taylorPage({ ...taylorDefaults(), screen });
    assert.match(html, /data-guide="taylor"/);
    assert.match(html, new RegExp(`page-guide-taylor-${screen}`));
  }
  for (const screen of ['map', 'workshop', 'proof', 'challenge']) {
    const html = seriesPage({ ...seriesDefaults(), screen });
    assert.match(html, /data-guide="series"/);
    assert.match(html, new RegExp(`page-guide-series-${screen}`));
  }
});

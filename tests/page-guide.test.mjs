import test from 'node:test';
import assert from 'node:assert/strict';
import { header } from '../src/content.js';
import { fieldHeader } from '../src/field-content.js';
import { relationsHeader } from '../src/relations-content.js';
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

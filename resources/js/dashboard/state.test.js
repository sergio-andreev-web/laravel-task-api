import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultTask, normalizeTask, visibleFilters } from './state.js';

test('normalizes task form values', () => {
    const task = normalizeTask({ title: '  Ship  ', description: '  Ready  ', priority: 'high', due_at: '' });
    assert.deepEqual(task, { title: 'Ship', description: 'Ready', priority: 'high', due_at: null });
    assert.equal(normalizeTask({ title: 'X', priority: 'unknown' }).priority, 'normal');
    assert.equal(defaultTask().done, false);
});

test('omits inactive filters from API requests', () => {
    const filters = visibleFilters({ status: 'all', priority: 'all', search: '  ', page: 2, per_page: 15 });
    assert.deepEqual(filters, { page: 2, per_page: 15 });
    assert.equal(visibleFilters({ status: 'open', priority: 'high', search: ' ship ', page: 1, per_page: 15 }).search, 'ship');
});

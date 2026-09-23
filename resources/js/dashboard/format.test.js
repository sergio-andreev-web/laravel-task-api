import assert from 'node:assert/strict';
import test from 'node:test';
import {
    countLabel,
    escapeHtml,
    formatDate,
    formatDateTime,
    inputDateTime,
    isOverdue,
    priorityLabel,
} from './format.js';

test('escapes task titles before rendering markup', () => {
    assert.equal(escapeHtml('<script>'), '&lt;script&gt;');
    assert.equal(escapeHtml('A & B'), 'A &amp; B');
    assert.equal(escapeHtml('"quote"'), '&quot;quote&quot;');
    assert.equal(escapeHtml(null), '');
});

test('formats due dates safely', () => {
    assert.equal(formatDate(null), 'No due date');
    assert.equal(formatDate('not-a-date'), 'Invalid date');
    assert.equal(formatDateTime(null), '');
    assert.equal(formatDateTime('not-a-date'), '');
    assert.notEqual(formatDate('2026-01-01T12:00:00Z'), 'Invalid date');
});

test('converts an ISO timestamp to datetime-local format', () => {
    assert.equal(inputDateTime(''), '');
    assert.equal(inputDateTime('invalid'), '');
    assert.match(inputDateTime('2026-01-01T12:00:00Z'), /^2026-01-01T\d{2}:00$/);
});

test('marks only open past-due tasks as overdue', () => {
    const now = new Date('2026-05-10T12:00:00Z');
    assert.equal(isOverdue({ done: false, due_at: '2026-05-09T12:00:00Z' }, now), true);
    assert.equal(isOverdue({ done: false, due_at: '2026-05-11T12:00:00Z' }, now), false);
    assert.equal(isOverdue({ done: true, due_at: '2026-05-09T12:00:00Z' }, now), false);
    assert.equal(isOverdue({ done: false, due_at: null }, now), false);
});

test('renders priority and count labels', () => {
    assert.equal(priorityLabel('high'), 'High');
    assert.equal(priorityLabel('low'), 'Low');
    assert.equal(priorityLabel('unknown'), 'Normal');
    assert.equal(countLabel(1, 'task', 'tasks'), '1 task');
    assert.equal(countLabel(2, 'task', 'tasks'), '2 tasks');
});

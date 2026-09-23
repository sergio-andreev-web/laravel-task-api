import { countLabel, escapeHtml, formatDate, formatDateTime, inputDateTime, isOverdue, priorityLabel } from './format.js';

const e = escapeHtml;

function statCard(label, value, tone = '') {
    return `<article class="stat-card ${tone}">
        <span class="stat-label">${e(label)}</span>
        <strong class="stat-value">${e(value)}</strong>
    </article>`;
}

export function renderStats(stats) {
    return [
        statCard('All tasks', stats.total),
        statCard('Open', stats.open, 'accent'),
        statCard('Done', stats.done, 'success'),
        statCard('Overdue', stats.overdue, 'danger'),
    ].join('');
}

export function renderFilters(filters) {
    return `<div class="filter-grid">
        <label class="search-field">
            <span>Search tasks</span>
            <input name="search" type="search" maxlength="120" value="${e(filters.search)}" placeholder="Search by title…" autocomplete="off">
        </label>
        <label>
            <span>Status</span>
            <select name="status">
                ${option('all', 'All statuses', filters.status)}
                ${option('open', 'Open', filters.status)}
                ${option('done', 'Done', filters.status)}
            </select>
        </label>
        <label>
            <span>Priority</span>
            <select name="priority">
                ${option('all', 'All priorities', filters.priority)}
                ${option('low', 'Low', filters.priority)}
                ${option('normal', 'Normal', filters.priority)}
                ${option('high', 'High', filters.priority)}
            </select>
        </label>
    </div>`;
}

function option(value, label, selected) {
    return `<option value="${e(value)}"${selected === value ? ' selected' : ''}>${e(label)}</option>`;
}

function taskMeta(task) {
    const dueClass = isOverdue(task) ? 'due overdue' : 'due';
    return `<div class="task-meta">
        <span class="priority priority-${e(task.priority)}">${e(priorityLabel(task.priority))}</span>
        <span class="${dueClass}">${e(formatDate(task.due_at))}</span>
        <span class="created">Created ${e(formatDateTime(task.created_at))}</span>
    </div>`;
}

export function renderTask(task) {
    return `<article class="task-card${task.done ? ' completed' : ''}" data-task-id="${e(task.id)}">
        <div class="task-main">
            <label class="task-check" title="Mark task ${task.done ? 'open' : 'done'}">
                <input type="checkbox" data-action="toggle" data-id="${e(task.id)}"${task.done ? ' checked' : ''}>
                <span class="check-control" aria-hidden="true"></span>
            </label>
            <div class="task-content">
                <h3>${e(task.title)}</h3>
                ${task.description ? `<p>${e(task.description)}</p>` : ''}
                ${taskMeta(task)}
            </div>
        </div>
        <div class="task-actions">
            <button type="button" class="text-button" data-action="edit" data-id="${e(task.id)}">Edit</button>
            <button type="button" class="text-button destructive" data-action="delete" data-id="${e(task.id)}">Delete</button>
        </div>
    </article>`;
}

export function renderList(state) {
    if (state.loading && state.tasks.length === 0) {
        return `<div class="empty-state"><span class="loading-indicator"></span><p>Loading tasks…</p></div>`;
    }
    if (state.tasks.length === 0) {
        const filtered = state.filters.search || state.filters.status !== 'all' || state.filters.priority !== 'all';
        return `<div class="empty-state">
            <div class="empty-icon" aria-hidden="true">✓</div>
            <h3>${filtered ? 'No matching tasks' : 'Nothing to do yet'}</h3>
            <p>${filtered ? 'Try changing your filters or search term.' : 'Create a task to get started.'}</p>
            ${filtered ? '<button type="button" class="secondary-button" data-action="clear-filters">Clear filters</button>' : ''}
        </div>`;
    }
    return state.tasks.map(renderTask).join('');
}

export function renderPagination(meta) {
    if ((meta.last_page || 1) < 2) return '';
    return `<nav class="pagination" aria-label="Task pages">
        <button type="button" data-action="previous"${meta.current_page <= 1 ? ' disabled' : ''}>Previous</button>
        <span>Page ${e(meta.current_page)} of ${e(meta.last_page)}</span>
        <button type="button" data-action="next"${meta.current_page >= meta.last_page ? ' disabled' : ''}>Next</button>
    </nav>`;
}

function field(name, label, value, errors, attributes = '') {
    const error = errors[name];
    return `<label class="form-field${error ? ' invalid' : ''}">
        <span>${e(label)}</span>
        <input name="${e(name)}" value="${e(value ?? '')}" ${attributes} aria-invalid="${error ? 'true' : 'false'}">
        ${error ? `<small role="alert">${e(error)}</small>` : ''}
    </label>`;
}

export function renderEditor(state) {
    if (state.dialog !== 'create' && state.dialog !== 'edit') return '';
    const task = state.dialog === 'edit' ? state.tasks.find((item) => item.id === state.selectedId) : null;
    const values = task || { title: '', description: '', priority: 'normal', due_at: '' };
    const title = state.dialog === 'create' ? 'New task' : 'Edit task';
    return `<div class="dialog-backdrop" data-action="backdrop">
        <section class="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <div class="dialog-header">
                <div><p class="eyebrow">Task details</p><h2 id="dialog-title">${title}</h2></div>
                <button type="button" class="icon-button" data-action="close" aria-label="Close">×</button>
            </div>
            <form id="task-form">
                ${field('title', 'Title', values.title, state.fieldErrors, 'required maxlength="120" autofocus')}
                <label class="form-field${state.fieldErrors.description ? ' invalid' : ''}">
                    <span>Description</span>
                    <textarea name="description" rows="5" maxlength="2000">${e(values.description ?? '')}</textarea>
                    ${state.fieldErrors.description ? `<small role="alert">${e(state.fieldErrors.description)}</small>` : ''}
                </label>
                <div class="form-row">
                    <label class="form-field"><span>Priority</span>
                        <select name="priority">
                            ${option('low', 'Low', values.priority)}
                            ${option('normal', 'Normal', values.priority)}
                            ${option('high', 'High', values.priority)}
                        </select>
                    </label>
                    ${field('due_at', 'Due date', inputDateTime(values.due_at), state.fieldErrors, 'type="datetime-local"')}
                </div>
                <div class="dialog-actions">
                    <button type="button" class="secondary-button" data-action="close">Cancel</button>
                    <button type="submit" class="primary-button"${state.saving ? ' disabled' : ''}>${state.saving ? 'Saving…' : 'Save task'}</button>
                </div>
            </form>
        </section>
    </div>`;
}

export function renderDeleteDialog(state) {
    if (state.dialog !== 'delete') return '';
    const task = state.tasks.find((item) => item.id === state.selectedId);
    return `<div class="dialog-backdrop" data-action="backdrop">
        <section class="dialog-panel compact" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
            <h2 id="delete-title">Delete task?</h2>
            <p>${task ? `“${e(task.title)}” will be removed.` : 'This task will be removed.'}</p>
            <div class="dialog-actions">
                <button type="button" class="secondary-button" data-action="close">Cancel</button>
                <button type="button" class="danger-button" data-action="confirm-delete"${state.saving ? ' disabled' : ''}>${state.saving ? 'Deleting…' : 'Delete task'}</button>
            </div>
        </section>
    </div>`;
}

export function renderSummary(state) {
    return `<div class="list-summary">
        <span>${countLabel(state.pagination.total || 0, 'task', 'tasks')}</span>
        ${state.loading ? '<span class="updating">Updating…</span>' : ''}
    </div>`;
}

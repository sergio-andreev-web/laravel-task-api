import { createStore } from './dashboard/state.js';
import { createController } from './dashboard/controller.js';
import {
    renderDeleteDialog, renderEditor, renderFilters, renderList,
    renderPagination, renderStats, renderSummary,
} from './dashboard/render.js';

const root = document.querySelector('#task-dashboard');

if (root) {
    const store = createStore();
    const controller = createController(store);
    const filters = root.querySelector('#filters');
    const stats = root.querySelector('#stats');
    const summary = root.querySelector('#summary');
    const list = root.querySelector('#task-list');
    const pagination = root.querySelector('#pagination');
    const feedback = root.querySelector('#feedback');
    const dialog = root.querySelector('#dialog-root');

    let lastFilterKey = '';
    store.subscribe((state) => {
        const filterKey = JSON.stringify(state.filters);
        if (filterKey !== lastFilterKey) {
            filters.innerHTML = renderFilters(state.filters);
            lastFilterKey = filterKey;
        }
        stats.innerHTML = renderStats(state.stats);
        summary.innerHTML = renderSummary(state);
        list.innerHTML = renderList(state);
        pagination.innerHTML = renderPagination(state.pagination);
        feedback.innerHTML = state.error
            ? `<div class="message error" role="alert">${escapeText(state.error)}</div>`
            : state.notice ? `<div class="message notice" role="status">${escapeText(state.notice)}</div>` : '';
        dialog.innerHTML = renderEditor(state) + renderDeleteDialog(state);
        document.body.classList.toggle('dialog-open', Boolean(state.dialog));
    });

    filters.addEventListener('change', (event) => {
        if (event.target.name === 'status') controller.filters({ status: event.target.value });
        if (event.target.name === 'priority') controller.filters({ priority: event.target.value });
    });

    filters.addEventListener('input', (event) => {
        if (event.target.name === 'search') controller.search(event.target.value);
    });

    root.addEventListener('click', (event) => {
        const button = event.target.closest('[data-action]');
        if (!button) return;
        const action = button.dataset.action;
        const id = Number(button.dataset.id);
        if (action === 'create') store.beginDialog('create');
        if (action === 'edit') store.beginDialog('edit', id);
        if (action === 'delete') store.beginDialog('delete', id);
        if (action === 'close') store.closeDialog();
        if (action === 'confirm-delete') controller.remove();
        if (action === 'previous') controller.page(-1);
        if (action === 'next') controller.page(1);
        if (action === 'clear-filters') controller.filters({ status: 'all', priority: 'all', search: '' });
        if (action === 'backdrop' && event.target === button) store.closeDialog();
    });

    root.addEventListener('change', (event) => {
        if (event.target.dataset.action === 'toggle') {
            controller.toggle(Number(event.target.dataset.id), event.target.checked);
        }
    });

    root.addEventListener('submit', (event) => {
        if (event.target.id !== 'task-form') return;
        event.preventDefault();
        controller.save(event.target);
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && store.get().dialog) store.closeDialog();
    });

    window.addEventListener('beforeunload', () => controller.destroy());
    controller.refresh();
}

function escapeText(value) {
    const node = document.createElement('span');
    node.textContent = value;
    return node.innerHTML;
}

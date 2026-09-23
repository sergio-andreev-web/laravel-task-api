import { TaskApi, fieldErrors } from './api.js';
import { normalizeTask, visibleFilters } from './state.js';

export function createController(store, api = new TaskApi()) {
    let activeRequest = null;
    let searchTimer = null;

    async function refresh() {
        activeRequest?.abort();
        const request = new AbortController();
        activeRequest = request;
        store.patch({ loading: true, error: '' });
        try {
            const [list, stats] = await Promise.all([
                api.list(visibleFilters(store.get().filters), request.signal),
                api.stats(request.signal),
            ]);
            if (request !== activeRequest) return;
            store.patch({
                tasks: list.data || [],
                pagination: list.meta || { current_page: 1, last_page: 1, total: 0 },
                stats,
                loading: false,
            });
        } catch (error) {
            if (error.name !== 'AbortError') store.setError(error);
        }
    }

    function filters(changes) {
        store.setFilters(changes);
        refresh();
    }

    function search(value) {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => filters({ search: value }), 250);
    }

    async function save(form) {
        if (store.get().saving) return;
        const values = normalizeTask(Object.fromEntries(new FormData(form)));
        if (!values.title) {
            store.patch({ fieldErrors: { title: 'Enter a title.' } });
            return;
        }
        store.patch({ saving: true, fieldErrors: {}, error: '' });
        try {
            const state = store.get();
            if (state.dialog === 'edit') {
                await api.update(state.selectedId, values);
                store.setNotice('Task updated.');
            } else {
                await api.create(values);
                store.setNotice('Task created.');
            }
            store.closeDialog();
            await refresh();
        } catch (error) {
            store.patch({ saving: false, fieldErrors: fieldErrors(error) });
            store.setError(error);
        }
    }

    async function toggle(id, checked) {
        const original = store.get().tasks;
        store.patch({ tasks: original.map((task) => task.id === id ? { ...task, done: checked } : task) });
        try {
            await api.update(id, { done: checked });
            await refresh();
        } catch (error) {
            store.patch({ tasks: original });
            store.setError(error);
        }
    }

    async function remove() {
        if (store.get().saving) return;
        store.patch({ saving: true, error: '' });
        try {
            await api.remove(store.get().selectedId);
            store.closeDialog();
            store.setNotice('Task deleted.');
            await refresh();
        } catch (error) {
            store.setError(error);
        }
    }

    function page(direction) {
        const state = store.get();
        const next = Math.min(state.pagination.last_page, Math.max(1, state.filters.page + direction));
        if (next !== state.filters.page) filters({ page: next });
    }

    function destroy() {
        activeRequest?.abort();
        clearTimeout(searchTimer);
    }

    return { refresh, filters, search, save, toggle, remove, page, destroy };
}

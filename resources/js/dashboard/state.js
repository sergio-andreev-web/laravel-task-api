const VALID_STATUSES = new Set(['all', 'open', 'done']);
const VALID_PRIORITIES = new Set(['all', 'low', 'normal', 'high']);

function fromQuery() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status') || 'all';
    const priority = params.get('priority') || 'all';
    return {
        status: VALID_STATUSES.has(status) ? status : 'all',
        priority: VALID_PRIORITIES.has(priority) ? priority : 'all',
        search: (params.get('search') || '').slice(0, 120),
        page: Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1),
        per_page: 15,
    };
}

export function createStore() {
    const subscribers = new Set();
    let state = {
        filters: fromQuery(),
        tasks: [],
        pagination: { current_page: 1, last_page: 1, total: 0 },
        stats: { total: 0, open: 0, done: 0, overdue: 0, by_priority: {} },
        loading: false,
        saving: false,
        error: '',
        notice: '',
        selectedId: null,
        dialog: null,
        fieldErrors: {},
    };

    function publish() {
        for (const subscriber of subscribers) subscriber(state);
    }

    return {
        get: () => state,
        subscribe(listener) {
            subscribers.add(listener);
            listener(state);
            return () => subscribers.delete(listener);
        },
        patch(changes) {
            state = { ...state, ...changes };
            publish();
        },
        setFilters(changes) {
            const filters = { ...state.filters, ...changes };
            if (!Object.hasOwn(changes, 'page')) filters.page = 1;
            state = { ...state, filters };
            const url = new URL(window.location.href);
            for (const [key, value] of Object.entries(filters)) {
                if (value === 'all' || value === '' || (key === 'page' && value === 1) || key === 'per_page') {
                    url.searchParams.delete(key);
                } else {
                    url.searchParams.set(key, value);
                }
            }
            window.history.replaceState(null, '', url);
            publish();
        },
        beginDialog(dialog, selectedId = null) {
            state = { ...state, dialog, selectedId, fieldErrors: {}, error: '' };
            publish();
        },
        closeDialog() {
            state = { ...state, dialog: null, selectedId: null, fieldErrors: {} };
            publish();
        },
        setError(error) {
            state = { ...state, error: error?.message || String(error), loading: false, saving: false };
            publish();
        },
        setNotice(notice) {
            state = { ...state, notice, error: '' };
            publish();
        },
    };
}

export function visibleFilters(filters) {
    const result = { page: filters.page, per_page: filters.per_page };
    if (filters.status !== 'all') result.status = filters.status;
    if (filters.priority !== 'all') result.priority = filters.priority;
    if (filters.search.trim()) result.search = filters.search.trim();
    return result;
}

export function defaultTask() {
    return { title: '', description: '', priority: 'normal', due_at: '', done: false };
}

export function normalizeTask(values) {
    const title = String(values.title || '').trim();
    const description = String(values.description || '').trim();
    const priority = VALID_PRIORITIES.has(values.priority) && values.priority !== 'all' ? values.priority : 'normal';
    return {
        title,
        description: description || null,
        priority,
        due_at: values.due_at || null,
    };
}

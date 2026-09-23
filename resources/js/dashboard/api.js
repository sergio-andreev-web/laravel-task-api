export class ApiError extends Error {
    constructor(message, status, details = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}

function queryString(filters = {}) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
            search.set(key, String(value));
        }
    }
    const result = search.toString();
    return result ? `?${result}` : '';
}

async function parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    if (response.status === 204) return null;
    if (!contentType.includes('application/json')) {
        if (!response.ok) throw new ApiError(`Request failed (${response.status})`, response.status);
        return response.text();
    }
    const body = await response.json();
    if (!response.ok) {
        throw new ApiError(body.message || `Request failed (${response.status})`, response.status, body.errors || {});
    }
    return body;
}

export class TaskApi {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.pending = new Map();
    }

    async request(path, options = {}) {
        const response = await fetch(`${this.baseUrl}${path}`, {
            headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
            credentials: 'same-origin',
            ...options,
        });
        return parseResponse(response);
    }

    list(filters = {}, signal) {
        return this.request(`/tasks${queryString(filters)}`, { signal });
    }

    stats(signal) {
        return this.request('/tasks/stats', { signal });
    }

    get(id, signal) {
        return this.request(`/tasks/${encodeURIComponent(id)}`, { signal });
    }

    create(values) {
        return this.request('/tasks', { method: 'POST', body: JSON.stringify(values) });
    }

    update(id, values) {
        return this.request(`/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(values) });
    }

    remove(id) {
        return this.request(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' });
    }
}

export function fieldErrors(error) {
    if (!(error instanceof ApiError)) return {};
    return Object.fromEntries(
        Object.entries(error.details).map(([field, messages]) => [field, Array.isArray(messages) ? messages[0] : String(messages)]),
    );
}

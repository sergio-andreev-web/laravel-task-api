const dateFormatter = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });

export function formatDate(value) {
    if (!value) return 'No due date';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Invalid date' : dateFormatter.format(date);
}

export function formatDateTime(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`;
}

export function inputDateTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
}

export function isOverdue(task, now = new Date()) {
    return !task.done && Boolean(task.due_at) && new Date(task.due_at) < now;
}

export function priorityLabel(priority) {
    return ({ low: 'Low', normal: 'Normal', high: 'High' })[priority] || 'Normal';
}

export function countLabel(count, singular, plural) {
    return `${new Intl.NumberFormat().format(count)} ${count === 1 ? singular : plural}`;
}

export function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]);
}

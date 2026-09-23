<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f7f8fb">
    <title>Task Board</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
<main id="task-dashboard" class="dashboard">
    <header class="page-header">
        <div class="page-heading">
            <p class="eyebrow">Workspace</p>
            <h1>Task Board</h1>
            <p>Plan work, track progress and keep priorities in sight.</p>
        </div>
        <button type="button" class="primary-button new-task" data-action="create">
            <span aria-hidden="true">＋</span> New task
        </button>
    </header>

    <section aria-label="Task statistics" id="stats" class="stats-grid"></section>

    <section class="tasks-panel" aria-labelledby="tasks-heading">
        <div class="panel-header">
            <div>
                <p class="eyebrow">Overview</p>
                <h2 id="tasks-heading">Tasks</h2>
            </div>
            <div id="summary" class="list-summary"></div>
        </div>
        <div id="feedback" class="feedback" aria-live="polite"></div>
        <div id="filters" class="filters"></div>
        <div id="task-list" class="task-list"></div>
        <div id="pagination"></div>
    </section>

    <div id="dialog-root"></div>
</main>
</body>
</html>

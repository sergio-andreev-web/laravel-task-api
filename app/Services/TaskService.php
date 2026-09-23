<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TaskService
{
    public function search(array $filters): LengthAwarePaginator
    {
        $query = Task::query();
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('done', $filters['status'] === 'done');
        }
        if (isset($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }
        if (isset($filters['search'])) {
            $query->where('title', 'like', '%'.addcslashes($filters['search'], '%_').'%');
        }
        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 15);
    }

    public function stats(): array
    {
        return [
            'total' => Task::count(),
            'open' => Task::where('done', false)->count(),
            'done' => Task::where('done', true)->count(),
            'overdue' => Task::where('done', false)->whereNotNull('due_at')->where('due_at', '<', now())->count(),
            'by_priority' => [
                'low' => Task::where('priority', 'low')->count(),
                'normal' => Task::where('priority', 'normal')->count(),
                'high' => Task::where('priority', 'high')->count(),
            ],
        ];
    }
}

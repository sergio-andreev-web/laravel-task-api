<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function __construct(private readonly TaskService $tasks) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = Validator::make($request->query(), [
            'status' => ['sometimes', Rule::in(['all', 'open', 'done'])],
            'priority' => ['sometimes', Rule::in(['low', 'normal', 'high'])],
            'search' => ['sometimes', 'string', 'max:120'],
            'per_page' => ['sometimes', 'integer', 'between:1,100'],
        ])->validate();
        return TaskResource::collection($this->tasks->search($filters));
    }

    public function store(StoreTaskRequest $request)
    {
        $task = Task::create($request->validated());
        return (new TaskResource($task))->response()->setStatusCode(201);
    }

    public function show(Task $task): TaskResource
    {
        return new TaskResource($task);
    }

    public function update(UpdateTaskRequest $request, Task $task): TaskResource
    {
        $task->update($request->validated());
        return new TaskResource($task->refresh());
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->noContent();
    }

    public function stats(): array
    {
        return $this->tasks->stats();
    }
}

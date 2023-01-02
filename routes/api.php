<?php

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/tasks', fn () => Task::query()->latest()->get());
Route::post('/tasks', function (Request $request) {
    $data = $request->validate(['title' => ['required', 'string', 'max:120']]);
    return response()->json(Task::create($data), 201);
});
Route::patch('/tasks/{task}', function (Request $request, Task $task) {
    $data = $request->validate(['done' => ['required', 'boolean']]);
    $task->update($data);
    return $task;
});
Route::delete('/tasks/{task}', function (Task $task) {
    $task->delete();
    return response()->noContent();
});

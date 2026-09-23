<?php

namespace Tests\Feature;

use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_task_lifecycle(): void
    {
        $task = $this->postJson('/api/tasks', ['title' => 'Ship demo', 'priority' => 'high'])
            ->assertCreated()->assertJsonPath('data.priority', 'high')->json('data');
        $this->getJson('/api/tasks/'.$task['id'])->assertOk()->assertJsonPath('data.title', 'Ship demo');
        $this->patchJson('/api/tasks/'.$task['id'], ['done' => true])
            ->assertOk()->assertJsonPath('data.done', true);
        $this->getJson('/api/tasks/stats')->assertOk()->assertJsonPath('done', 1);
        $this->deleteJson('/api/tasks/'.$task['id'])->assertNoContent();
        $this->getJson('/api/tasks/'.$task['id'])->assertNotFound();
    }

    public function test_filters_and_pagination(): void
    {
        Task::create(['title' => 'Deploy app', 'priority' => 'high']);
        Task::create(['title' => 'Write docs', 'priority' => 'low', 'done' => true]);
        $this->getJson('/api/tasks?status=open&priority=high')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/tasks?search=docs')->assertOk()->assertJsonPath('meta.total', 1);
        $this->getJson('/api/tasks?per_page=1')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_validation(): void
    {
        $this->postJson('/api/tasks', ['title' => ''])->assertUnprocessable();
        $this->postJson('/api/tasks', ['title' => 'x', 'priority' => 'urgent'])->assertUnprocessable();
        $this->getJson('/api/tasks?per_page=500')->assertUnprocessable();
    }
}

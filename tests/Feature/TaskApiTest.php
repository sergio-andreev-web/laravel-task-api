<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_task_lifecycle(): void
    {
        $task = $this->postJson('/api/tasks', ['title' => 'Ship demo'])
            ->assertCreated()->json();
        $this->getJson('/api/tasks')->assertOk()->assertJsonCount(1);
        $this->patchJson('/api/tasks/'.$task['id'], ['done' => true])
            ->assertOk()->assertJsonPath('done', true);
        $this->deleteJson('/api/tasks/'.$task['id'])->assertNoContent();
    }

    public function test_rejects_blank_title(): void
    {
        $this->postJson('/api/tasks', ['title' => ''])->assertUnprocessable();
    }
}

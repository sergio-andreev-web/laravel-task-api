<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Seeder;

class DemoTaskSeeder extends Seeder
{
    public function run(): void
    {
        foreach (file(database_path('demo-tasks.jsonl'), FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $task = json_decode($line, true, 512, JSON_THROW_ON_ERROR);
            Task::create(['title' => $task['title']]);
        }
    }
}

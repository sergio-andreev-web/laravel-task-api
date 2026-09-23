<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = ['title', 'description', 'priority', 'due_at', 'done'];

    protected $casts = [
        'done' => 'boolean',
        'due_at' => 'datetime',
    ];
}

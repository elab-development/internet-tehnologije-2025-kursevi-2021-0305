<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run()
    {
        User::factory(5)->create(['role' => 'student']);
        User::factory(3)->create(['role' => 'teacher']);
        User::factory(1)->create(['role' => 'admin']);
    }
}


<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourseFactory extends Factory
{
    protected $model = Course::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'teacher_id' => User::where('role', 'teacher')->inRandomOrder()->first()->id ?? User::factory()->create(['role' => 'teacher'])->id,
        ];
    }
}

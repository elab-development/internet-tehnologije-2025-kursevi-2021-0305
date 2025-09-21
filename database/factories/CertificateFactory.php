<?php

namespace Database\Factories;

use App\Models\Certificate;
use App\Models\User;
use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

class CertificateFactory extends Factory
{
    protected $model = Certificate::class;

    public function definition(): array
    {
        return [
            'user_id' => User::where('role', 'student')->inRandomOrder()->first()->id ?? User::factory()->create(['role' => 'student'])->id,
            'course_id' => Course::inRandomOrder()->first()->id ?? Course::factory()->create()->id,
            'certificate_url' => 'https://example.com/certificates/' . $this->faker->uuid() . '.pdf',
        ];
    }
}

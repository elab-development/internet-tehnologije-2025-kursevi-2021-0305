<?php

namespace Database\Factories;

use App\Models\Video;
use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

class VideoFactory extends Factory
{
    protected $model = Video::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(4),
            'video_url' => 'https://example.com/' . $this->faker->uuid() . '.mp4',
            'course_id' => Course::inRandomOrder()->first()->id ?? Course::factory()->create()->id,
        ];
    }
}

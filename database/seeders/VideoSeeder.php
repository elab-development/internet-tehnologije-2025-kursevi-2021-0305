<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Video;

class VideoSeeder extends Seeder
{
    public function run()
    {
        Video::factory(30)->create(); // Svaki kurs će imati oko 3 video lekcije
    }
}

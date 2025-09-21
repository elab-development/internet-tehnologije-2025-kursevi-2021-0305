<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Certificate;

class CertificateSeeder extends Seeder
{
    public function run()
    {
        Certificate::factory(5)->create(); // Samo nekim studentima dodeliti sertifikate
    }
}



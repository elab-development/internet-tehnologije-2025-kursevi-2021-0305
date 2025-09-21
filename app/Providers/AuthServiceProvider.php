<?php

namespace App\Providers;

use App\Models\Video;
use App\Policies\VideoPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\Course;
use App\Policies\CoursePolicy;
use App\Models\Certificate;
use App\Policies\CertificatePolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Video::class => VideoPolicy::class, 
        Course::class => CoursePolicy::class, // Dodajemo CoursePolicy
        Certificate::class => CertificatePolicy::class
    ];
}

<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Course;
use Illuminate\Http\Request;


class EnrollmentController extends Controller
{
    public function store(Request $request, Course $course)
    {
        $user = auth()->user();

        if ($user->role !== 'student') {
            return response()->json(['error' => 'Only students can enroll in courses'], 403);
        }

        if (Enrollment::where('user_id', $user->id)->where('course_id', $course->id)->exists()) {
            return response()->json(['message' => 'Already enrolled in this course'], 400);
        }

        Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        return response()->json(['message' => 'Enrolled successfully!']);
    }
}
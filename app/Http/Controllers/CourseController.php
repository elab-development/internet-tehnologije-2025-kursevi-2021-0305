<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use App\Http\Resources\CourseResource;

class CourseController extends Controller
{
    public function index()
    {
        return CourseResource::collection(Course::with(['teacher', 'videos', 'enrollments'])->get());
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'teacher_id' => 'required|exists:users,id'
        ]);
    
        // Kreiranje kursa
        $course = new Course($validatedData);
        $course->save();
    
        return response()->json([
            'message' => 'Course created successfully',
            'course' => $course
        ], 201);
    }

    public function show(Course $course)
    {
        return new CourseResource($course->load(['teacher', 'videos', 'enrollments']));
    }

    public function update(Request $request, Course $course)
{
    // Validacija podataka
    $validatedData = $request->validate([
        'title' => 'required|string|max:255',
        'description' => 'required|string',
    ]);

    // Ažuriranje kursa
    $course->update($validatedData);

    return response()->json([
        'message' => 'Course updated successfully',
        'course' => $course
    ], 200);
}


    public function destroy(Course $course)
    {
        $course->delete();
        return response()->json(['message' => 'Course deleted']);
    }

}
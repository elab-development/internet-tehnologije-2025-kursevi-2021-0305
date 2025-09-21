<?php

namespace App\Policies;

use Illuminate\Auth\Access\Response;
use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Course $course): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'teacher';
    }
    /**
     * Determine whether the user can update the model.
     */
    public function updateCourse(User $user, Course $course)
{
    return $user->id === $course->teacher_id; // ✅ Primer provere da li je nastavnik vlasnik kursa
}

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Course $course): bool
    {
        return $user->id === $course->teacher_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Course $course): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Course $course): bool
    {
        return false;
    }
    public function enroll(User $user, Course $course)
    {
        return $user->role === 'student';
    }

    public function uploadVideo(User $user, Course $course)
    {   
        return $user->role === 'teacher' && $user->id === $course->teacher_id;
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\UserResource;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class UserController extends Controller
{
    use AuthorizesRequests;
    // 🔍 Prikaz svih korisnika (samo admin)
    public function index()
    {
        $this->authorize('viewAny', User::class);
        return UserResource::collection(User::all());
    }

    // 🔍 Prikaz pojedinačnog korisnika
    public function show(User $user)
    {
        return new UserResource($user->load(['courses', 'enrollments']));
    }

    // 📝 Ažuriranje profila (samo vlasnik ili admin)
    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:6'
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return new UserResource($user);
    }

    // 🗑️ Brisanje korisnika (samo admin)
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);
        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }

    // 🎓 Kursevi koje student pohađa
    public function enrolledCourses(User $user)
    {
        return response()->json($user->enrollments->map(fn($e) => $e->course));
    }

    // 📚 Kursevi koje nastavnik predaje
    public function teachingCourses(User $user)
    {
        return response()->json($user->courses);
    }
}

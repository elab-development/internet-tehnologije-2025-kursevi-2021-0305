<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\User;
use Carbon\Carbon;

class ForgotPasswordController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['error' => 'User not found'], 404);
    }

    // Generišemo token
    $token = Str::random(60);

    // Brišemo postojeći token ako postoji
    DB::table('password_reset_tokens')->where('email', $request->email)->delete();

    // Čuvamo token u bazi
    DB::table('password_reset_tokens')->insert([
        'email' => $request->email,
        'token' => hash('sha256', $token), // Laravel hashira token
        'created_at' => Carbon::now(),
    ]);

    // Opcionalno: Ovdde možete poslati email korisniku sa tokenom

    return response()->json([
        'message' => 'Reset link sent!',
        'token' => $token, // OVO JE ORIGINALNI TOKEN, NE HASHIRANI
    ]);
    }


    public function generateToken(Request $request)
    {
        $user = User::where('email', $request->input('email'))->first();
        if ($user) {
            $token = Password::createToken($user);
            return response()->json(['token' => $token]);
        } else {
            return response()->json(['error' => 'User not found'], 404);
        }
    }
    public function getView(){
        return view('auth.forgot-password');
    }

}
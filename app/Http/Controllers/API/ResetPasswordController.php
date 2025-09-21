<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class ResetPasswordController extends Controller
{
    public function reset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);
    
        // Dohvatamo token iz baze
        $record = DB::table('password_reset_tokens')
                    ->where('email', $request->email)
                    ->first();
    
        if (!$record) {
            return response()->json(['error' => 'Invalid or expired token'], 400);
        }
    
        // Proveravamo da li uneti token odgovara hashiranom tokenu u bazi
        if (!hash_equals($record->token, hash('sha256', $request->token))) {
            return response()->json(['error' => 'Invalid token'], 400);
        }
    
        // Resetujemo lozinku
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();
    
        // Brišemo token iz baze
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();
    
        return response()->json(['message' => 'Password has been reset.']);
    }
    public function getView(string $token){
        return view('auth.reset-password', ['token' => $token]);
    }

}
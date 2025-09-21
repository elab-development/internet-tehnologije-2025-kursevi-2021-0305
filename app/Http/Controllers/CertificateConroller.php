<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Video;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    public function index(User $user)
    {
        if (Auth::id() !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($user->certificates);
    }

    public function show(Certificate $certificate)
    {
        return response()->json([
            'id' => $certificate->id,
            'user_id' => $certificate->user_id,
            'course_id' => $certificate->course_id,
            'certificate_url' => $certificate->certificate_url,
            'created_at' => $certificate->created_at,
            'updated_at' => $certificate->updated_at
        ]);    
    }

    public function generateCertificate($courseId)
    {
        $user = Auth::user();
        $course = Course::findOrFail($courseId);

        // Proveri da li je korisnik upisan na kurs
        $enrollment = Enrollment::where('user_id', $user->id)
                                ->where('course_id', $course->id)
                                ->first();

        if (!$enrollment) {
            return response()->json(['error' => 'Niste upisani na ovaj kurs.'], 403);
        }

        // Proveri da li je korisnik pogledao sve videe kursa
        $totalVideos = Video::where('course_id', $course->id)->count();
        $watchedVideos = $user->watchedVideos()->where('course_id', $course->id)->count();

        if ($watchedVideos < $totalVideos) {
            return response()->json(['error' => 'Morate pogledati sve video lekcije da biste dobili sertifikat.'], 403);
        }

        // Generiši PDF sertifikat
        $data = [
            'name' => $user->name,
            'course' => $course->title,
            'date' => now()->format('d.m.Y'),
        ];

        $pdf = Pdf::loadView('certificate', $data);

        // Kreiraj direktorijum ako ne postoji
        $certificatePath = 'public/certificates/' . $user->id . '_course_' . $course->id . '.pdf';
        Storage::makeDirectory('public/certificates');

        // Sačuvaj PDF sertifikat u `storage/app/public/certificates`
        Storage::put($certificatePath, $pdf->output());

        // Sačuvaj sertifikat u bazi
        $certificate = Certificate::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'certificate_url' => Storage::url($certificatePath),
        ]);

        return response()->json([
            'success' => 'Sertifikat uspešno generisan.',
            'certificate' => $certificate
        ]);
    }
    public function upload(Request $request)
    {
        $request->validate([
            'certificate' => 'required|mimes:pdf|max:10000',
            'course_id' => 'required|exists:courses,id',
        ]);
    
        $path = $request->file('certificate')->store('certificates', 'public');
    
        $certificate = new Certificate();
        $certificate->file_path = $path;
        $certificate->user_id = auth()->id();
        $certificate->course_id = $request->course_id;
        $certificate->certificate_url = asset('storage/' . $path); // Dodaj URL sertifikata
        $certificate->save();
    
        return response()->json([
            'message' => 'Certificate uploaded successfully',
            'url' => $certificate->certificate_url
        ], 201);
    }

    public function export($certificateId)
    {
        $certificate = Certificate::with(['user', 'course'])->findOrFail($certificateId);
    
        // Proveri da li postoji view fajl
        if (!view()->exists('certificate')) {
            return response()->json(['error' => 'Template not found.'], 500);
        }
    
        // Generiši PDF
        $pdf = Pdf::loadView('pdf.certificate', ['certificate' => $certificate]);
    
        return $pdf->download('certificate-' . $certificate->id . '.pdf');
    }
    
}
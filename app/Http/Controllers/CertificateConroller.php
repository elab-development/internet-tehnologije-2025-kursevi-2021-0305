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

   public function generateCertificate(Course $course)
{
    $user = Auth::user();

    // 1) Provera upisa
    $isEnrolled = Enrollment::where('user_id', $user->id)
                            ->where('course_id', $course->id)
                            ->exists();
    if (!$isEnrolled) {
        return response()->json(['error' => 'Niste upisani na ovaj kurs.'], 403);
    }

    // 2) Provera odgledanih videa (preko whereHas da ne traži course_id u pivotu)
    $totalVideos   = $course->videos()->count(); // pretpostavka da Course ima relaciju videos()
    $watchedVideos = $user->watchedVideos()      // pretpostavka da User ima belongsToMany(Video::class)
        ->whereHas('course', fn($q) => $q->whereKey($course->id))
        ->count();

    if ($watchedVideos < $totalVideos) {
        return response()->json(['error' => 'Morate pogledati sve video lekcije da biste dobili sertifikat.'], 403);
    }

    // 3) Generisanje PDF-a (uhvati potencijalne greške u view-u)
    $data = [
        'name'   => $user->name,
        'course' => $course->title,
        'date'   => now()->format('d.m.Y'),
    ];

    try {
        $pdf = Pdf::loadView('certificate', $data);
    } catch (\Throwable $e) {
        \Log::error('PDF generation failed', ['msg' => $e->getMessage()]);
        return response()->json([
            'error' => 'Greška pri generisanju PDF-a. Proverite da li postoji view "certificate" i resursi u njemu.'
        ], 500);
    }

    // 4) Snimanje na PUBLIC disk i pravilan URL
    Storage::disk('public')->makeDirectory('certificates');
    $filename = $user->id . 'course' . $course->id . '.pdf';
    $path     = "certificates/{$filename}";

    Storage::disk('public')->put($path, $pdf->output());
    $url = asset('storage/' . $path); // radi uz php artisan storage:link

    // 5) Upis/Update u bazu (da ne pravimo duplikate)
    $certificate = Certificate::updateOrCreate(
        ['user_id' => $user->id, 'course_id' => $course->id],
        ['certificate_url' => $url]
    );

    return response()->json([
    'success'     => 'Sertifikat uspešno generisan.',
    'certificate' => $certificate,
    'url'         => $url,
]);
}
    public function upload(Request $request)
    {
        $request->validate([
            'certificate' => 'required|mimes:pdf|max:10000',
            'course_id' => 'required|exists:courses,id',
            'user_id' => 'required|exists:users,id' 
        ]);
    
        $path = $request->file('certificate')->store('certificates', 'public');
    
        $certificate = new Certificate();
        $certificate->file_path = $path;
        $certificate->user_id = $request->user_id;
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


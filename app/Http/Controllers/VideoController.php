<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use App\Http\Resources\VideoResource;
use App\Models\Course;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class VideoController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request)
    {
        $this->authorize('create', Video::class);
        
        $video = Video::create($request->validated());
        return new VideoResource($video);
    }

    public function destroy(Video $video)
    {
        $this->authorize('delete', $video);
        
        $video->delete();
        return response()->json(['message' => 'Video deleted']);
    }

    public function index($courseId)
    {
        $videos = Video::where('course_id', $courseId)->get();
        return response()->json($videos);
    }

    public function show($courseId, $videoId)
    {
        $video = Video::where('course_id', $courseId)->where('id', $videoId)->first();

        if (!$video) {
            return response()->json(['message' => 'Video not found'], 404);
        }

        return response()->json($video);
    }
    public function upload(Request $request, $courseId)
    {
        $user = auth()->user();
        
        $course = Course::findOrFail($courseId);
        
       // if ($user->cannot('uploadVideo', $course)) {
        //    return response()->json(['error' => 'Only teachers can upload videos for their courses'], 403);
       // }
        
        $request->validate([
            'video' => 'required|mimes:mp4,mov,avi|max:50000',
        ]);
        
        $path = $request->file('video')->store('videos', 'public');
        
        $video = new Video();
        $video->course_id = $courseId;
        $video->url = asset('storage/' . $path);
        $video->save();
        
        return response()->json(['message' => 'Video uploaded successfully', 'video' => $video], 201);
    }
}

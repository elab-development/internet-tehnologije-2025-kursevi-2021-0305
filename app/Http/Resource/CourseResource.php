<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'teacher' => new UserResource($this->whenLoaded('teacher')),
            'videos' => VideoResource::collection($this->whenLoaded('videos')),
            'students_enrolled' => EnrollmentResource::collection($this->whenLoaded('enrollments')),
            'created_at' => $this->created_at->format('Y-m-d'),
        ];
    }
}
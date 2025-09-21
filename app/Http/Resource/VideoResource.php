<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VideoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'video_url' => $this->video_url,
            'course' => new CourseResource($this->whenLoaded('course')),
            'created_at' => $this->created_at->format('Y-m-d'),
        ];
    }
}

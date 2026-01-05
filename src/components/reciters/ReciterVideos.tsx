"use client";

import { useState } from "react";
import VideoGallery from "./VideoGallery";
import VideoModal from "@/components/player/VideoModal";

interface ReciterVideosProps {
    videos: any[];
}

export default function ReciterVideos({ videos }: ReciterVideosProps) {
    const [selectedVideo, setSelectedVideo] = useState<any>(null);

    return (
        <>
            <VideoGallery
                videos={videos}
                onPlay={(video) => setSelectedVideo(video)}
            />

            {selectedVideo && (
                <VideoModal
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}
        </>
    );
}

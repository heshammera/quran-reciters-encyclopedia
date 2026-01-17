"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface Album {
    name: string;
    count: number;
}

interface AlbumFilterProps {
    albums: Album[];
}

export default function AlbumFilter({ albums }: AlbumFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentAlbum = searchParams.get("album");

    if (!albums || albums.length === 0) return null;

    const handleSelect = (albumName: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (albumName) {
            params.set("album", albumName);
        } else {
            params.delete("album");
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <div className="flex items-center gap-2 min-w-max">
                <button
                    onClick={() => handleSelect(null)}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                        !currentAlbum
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500"
                    )}
                >
                    كل التلاوات
                </button>
                {albums.map((album) => (
                    <button
                        key={album.name}
                        onClick={() => handleSelect(album.name)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                            currentAlbum === album.name
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500"
                        )}
                    >
                        {album.name}
                        <span className="mr-2 opacity-75 text-xs">({album.count})</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

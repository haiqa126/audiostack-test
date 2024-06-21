"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ReleasePageProps {
    params: {
        id: string;
    };
}

const Release = ({ params }: ReleasePageProps) => {
    const [release, setRelease] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchRelease = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(
                    `https://api.discogs.com/releases/${params.id}`,
                    {
                        params: {
                            token: process.env.NEXT_PUBLIC_DISCOGS_TOKEN,
                        },
                    }
                );
                setRelease(response.data);
            } catch (error) {
                setError("Error fetching release data");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchRelease();
        }
    }, [params.id]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/" className="text-blue-500">
                    Go back
                </Link>
            </div>
        );
    }

    if (!release) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <p className="mb-4">No release found</p>
                <Link href="/" className="text-blue-500">
                    Go back
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4 min-h-screen min-w-full flex items-center justify-center bg-gray-100">
            <div className="flex flex-col sm:flex-row gap-10">
                {release.images && release.images.length > 0 && (
                    <div className="mb-4">
                        <Image
                            src={release.images[0].uri}
                            alt={release.title}
                            width={300}
                            height={300}
                        />
                    </div>
                )}
                <div>
                    <h1 className="text-3xl mb-4">{release.title}</h1>
                    <h2 className="text-3xl mb-4">{release.artists_sort}</h2>
                    <p className="text-lg mb-2">Release Year: {release.year}</p>
                    <h2 className="text-xl mt-4 mb-2">Track List</h2>
                    <ul className="list-disc pl-4">
                        {release.tracklist.map((track: any) => (
                            <li key={track.position} className="mb-1 list-none">
                                {track.position} - {track.title}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4">Community has: {release.community?.have}</p>
                    <Button onClick={() => router.back()} className="mt-6">
                        Go back
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Release;

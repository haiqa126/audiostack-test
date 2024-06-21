"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

const Home = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialSearchTerm = searchParams.get("q") || "";
    const initialPage = parseInt(searchParams.get("page") as string, 10) || 1;

    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [results, setResults] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(0);
    const [artistId, setArtistId] = useState<number | null>(null);
    const [artistImageUrl, setArtistImageUrl] = useState("");
    const [artistReleaseCount, setArtistReleaseCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [manualPage, setManualPage] = useState("");

    useEffect(() => {
        if (initialSearchTerm) {
            fetchArtist(initialSearchTerm);
        }
    }, [initialSearchTerm]);

    useEffect(() => {
        if (artistId) {
            fetchReleases(artistId, currentPage);
        }
    }, [artistId, currentPage]);

    const fetchArtist = async (artist: string) => {
        setLoading(true);
        setError("");

        try {
            const response = await axios.get(`https://api.discogs.com/database/search`, {
                params: {
                    q: artist,
                    type: "artist",
                    token: process.env.NEXT_PUBLIC_DISCOGS_TOKEN,
                    per_page: 5,
                    page: 1,
                },
            });

            const artistData = response.data.results[0];
            if (artistData) {
                setArtistId(artistData.id);
                setArtistImageUrl(artistData.cover_image);
            } else {
                setError("Artist not found");
                setArtistId(null);
                setArtistImageUrl("");
                setLoading(false);
                setResults([]);
            }
        } catch (err) {
            setError("An error occurred while fetching data.");
            setLoading(false);
        }
    };

    const fetchReleases = async (artistId: number, page: number) => {
        setLoading(true);
        setError("");

        try {
            const releasesResponse = await axios.get(
                `https://api.discogs.com/artists/${artistId}/releases`,
                {
                    params: {
                        sort: "year",
                        sort_order: "desc",
                        per_page: 5,
                        page: page,
                    },
                }
            );
            setResults(releasesResponse.data.releases);
            setTotalPages(releasesResponse.data.pagination.pages);
            setArtistReleaseCount(releasesResponse.data.pagination.items);
        } catch (err) {
            setError("An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCurrentPage(1);
        router.push(`/?q=${searchTerm}&page=1`);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        router.push(`/?q=${searchTerm}&page=${newPage}`);
    };

    const handleManualPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setManualPage(e.target.value);
    };

    const handleManualPageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const page = parseInt(manualPage, 10);
        if (page > 0 && page <= totalPages) {
            handlePageChange(page);
        }
    };

    const renderPagination = () => {
        const pages = [];
        const startPage = Math.max(currentPage - 2, 1);
        const endPage = Math.min(currentPage + 2, totalPages);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`p-2 ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'} rounded mx-1`}
                >
                    {i}
                </Button>
            );
        }

        // Add the last page button
        if (totalPages > endPage) {
            pages.push(
                <Button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className={`p-2 ${totalPages === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'} rounded mx-1`}
                >
                    {totalPages}
                </Button>
            );
        }

        return pages;
    };

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <div className="flex flex-col items-center">
                <h1 className="text-2xl mb-4">Search for an Artist</h1>
                <p className="text-gray-500 text-center mb-4">
                    Search for an artist to see their releases
                </p>
                <form onSubmit={handleSearch} className="flex flex-row space-x-2">
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Enter artist name"
                        className="p-2 border border-gray-300 rounded min-w-80"
                    />
                    <Button type="submit" className="p-2 bg-blue-500 text-white rounded">
                        Search
                    </Button>
                </form>
            </div>

            {loading && (
                <div className="flex justify-center items-center mt-24">
                    <Image className="w-20 h-20 animate-spin mr-2" src="https://www.svgrepo.com/show/448500/loading.svg" alt="Loading icon" width={80} height={80} />
                    Processing...
                </div>

            )}
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}

            {!loading && artistImageUrl && (
                <div className="flex justify-center items-center flex-row my-10">
                    <Image src={artistImageUrl} alt={searchTerm} width={200} height={200} />
                    <h2 className="text-2xl ml-4">
                        {initialSearchTerm} has {artistReleaseCount} releases
                    </h2>
                </div>
            )}

            {!loading && <div className="my-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mx-auto gap-4 max-w-7xl">
                {results.map((release) => (
                    <Link href={`/release/${release.id}`} key={release.id}>
                        <div className="border rounded p-4 transition-all hover:shadow-md min-h-80">
                            <Image
                                src={release.thumb || "/placeholder.png"}
                                alt={release.title}
                                width={200}
                                height={200}
                                className="object-cover w-full h-full rounded"
                            />
                            <p className="mt-2 text-center">{release.title}</p>
                        </div>
                    </Link>
                ))}
            </div>}

            {!loading && results.length > 0 && <div className="flex justify-center my-20 space-x-2">
                {renderPagination()}
                <form onSubmit={handleManualPageSubmit} className="flex flex-row space-x-2">
                    <Input
                        type="number"
                        value={manualPage}
                        onChange={handleManualPageChange}
                        placeholder="Page"
                        className="p-2 border border-gray-300 rounded"
                    />
                    <Button type="submit" className="p-2 bg-blue-500 text-white rounded">
                        Go
                    </Button>
                </form>
            </div>}
        </div>
    );
};

const HomePage = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <Home />
    </Suspense>
);

export default HomePage;

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_DISCOGS_TOKEN: process.env.DISCOGS_TOKEN,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "i.discogs.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: [],
    },
    env: {
        NEXT_PUBLIC_APP_NAME: 'Sticky Note Wall',
        NEXT_PUBLIC_APP_DESCRIPTION: 'Söyleyemediklerini anonim olarak paylaş',
    },
};

export default nextConfig;

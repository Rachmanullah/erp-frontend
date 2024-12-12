/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '2000', // Tambahkan port jika diperlukan
                pathname: '/images/**', // Path spesifik untuk gambar
            },
        ],
    },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Esto permite que el build termine aunque haya errores de ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Esto permite que el build termine aunque haya errores de tipo
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

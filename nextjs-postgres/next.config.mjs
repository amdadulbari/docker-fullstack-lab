/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone' creates a self-contained production build
  // Ideal for Docker — copies only necessary files
  output: 'standalone',
};

export default nextConfig;

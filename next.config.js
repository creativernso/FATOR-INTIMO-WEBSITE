/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
  async redirects() {
    return [
      {
        // Old slug had accented characters dropped incorrectly (missing
        // letters, not just accents). Redirect preserves the SEO value
        // already earned by the indexed URL.
        source: '/blog/por-que-voc-continua-amando-quem-te-machuca-e-no-fraqueza',
        destination: '/blog/por-que-voce-continua-amando-quem-te-machuca-e-nao-e-fraqueza',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

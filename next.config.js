/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    CHURN_PREVENTION_OPENAI_API_KEY: process.env.CHURN_PREVENTION_OPENAI_API_KEY,
  },
  output: 'standalone',
}

module.exports = nextConfig 
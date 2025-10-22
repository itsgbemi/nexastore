/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY,
  },
  // Remove the experimental section entirely
}

module.exports = nextConfig

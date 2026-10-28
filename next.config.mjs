import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Reduce dev memory usage: keep fewer pages in memory
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 2,
  },

  // Keep heavy Payload packages external during dev to avoid re-bundling
  serverExternalPackages: [
    'graphql',
    // sharp is a native module; bundling it breaks the image resizer.
    'sharp',
  ],

  // Reduce logging noise to save I/O and memory
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // React strict mode - already defaults to true
  reactStrictMode: true,
}

export default withPayload(nextConfig)

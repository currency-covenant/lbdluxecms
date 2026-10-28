/**
 * Regenerates the missing image sizes for existing media.
 *
 * Run with: npx tsx scripts/regenerate-media-sizes.ts [--id 28] [--dry-run] [--cleanup]
 *
 * Payload only writes a real `sizes` map when sharp is handed to it (see
 * src/payload.config.ts). The media in this bucket was uploaded before that
 * was configured, so every `sizes` entry is null and the site serves each
 * image at its full uploaded resolution — a 21 MB cover photo for a 380px
 * banner on the card.
 *
 * This script re-submits each original file through Payload's own upload
 * pipeline. The document keeps its ID (so nothing that references it breaks),
 * Payload generates and uploads the configured sizes, and the `sizes` map is
 * written back to the document.
 *
 * --cleanup removes S3 objects that no media document points at any more.
 */
import { readFileSync } from 'node:fs'
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3'

// Load .env before the config module is imported.
for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (match && !(match[1] in process.env)) process.env[match[1]] = match[2]
}

const { getPayload } = await import('payload')
const { default: config } = await import('../src/payload.config')

const args = process.argv.slice(2)
const onlyId = args.includes('--id') ? Number(args[args.indexOf('--id') + 1]) : null
const dryRun = args.includes('--dry-run')
const cleanup = args.includes('--cleanup')
const force = args.includes('--force')

const payload = await getPayload({ config })

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
})

const isResizableImage = (doc: { mimeType?: string | null }) =>
  !!doc.mimeType && doc.mimeType.startsWith('image/') && doc.mimeType !== 'image/svg+xml'

const hasUsableSizes = (doc: { sizes?: Record<string, { url?: string | null }> | null }) => {
  const sizes = doc.sizes
  if (!sizes) return false
  const entries = Object.entries(sizes)
  if (entries.length === 0) return false
  return entries.every(([, value]) => !!value?.url)
}

/** Every S3 key a media document still points at. */
async function referencedKeys() {
  const { docs } = await payload.find({ collection: 'media', limit: 500, depth: 0 })
  const keys = new Set<string>()
  for (const doc of docs as any[]) {
    if (doc.filename) keys.add(`media/${doc.filename}`)
    for (const size of Object.values(doc.sizes ?? {})) {
      if ((size as any)?.filename) keys.add(`media/${(size as any).filename}`)
    }
  }
  return keys
}

if (cleanup) {
  const referenced = await referencedKeys()
  const listed = await s3.send(
    new ListObjectsV2Command({ Bucket: process.env.S3_BUCKET as string, MaxKeys: 1000 }),
  )
  // Only generated size variants are removed by default. A file that is not a
  // size variant may still be linked to from somewhere outside the CMS, so
  // removing those is an explicit decision.
  const isSizeVariant = (key: string) => /-\d+x\d+\.[a-z0-9]+$/i.test(key)
  const orphans = (listed.Contents ?? []).filter(
    (o) => !!o.Key && !referenced.has(o.Key) && isSizeVariant(o.Key),
  )
  console.log(`referenced: ${referenced.size}, objects: ${listed.KeyCount}, orphan variants: ${orphans.length}`)
  for (const o of orphans) {
    if (dryRun) {
      console.log(`  would delete ${o.Key} (${o.Size} bytes)`)
      continue
    }
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET as string, Key: o.Key }))
    console.log(`  deleted ${o.Key} (${o.Size} bytes)`)
  }
  process.exit(0)
}

const { docs } = await payload.find({
  collection: 'media',
  limit: 200,
  depth: 0,
  sort: 'id',
})

let regenerated = 0
let skipped = 0
let failed = 0

for (const doc of docs as any[]) {
  if (onlyId && doc.id !== onlyId) continue

  if (!isResizableImage(doc)) {
    skipped++
    continue
  }
  if (hasUsableSizes(doc) && !force) {
    console.log(`  ${doc.filename} — sizes already present, skipping`)
    skipped++
    continue
  }
  if (!doc.url || !doc.filename) {
    console.log(`  ${doc.filename ?? doc.id} — no URL, skipping`)
    skipped++
    continue
  }

  const originalBytes = (doc.filesize ?? 0) > 0 ? ` ${(doc.filesize / 1024 / 1024).toFixed(1)} MB` : ''

  if (dryRun) {
    console.log(`  ${doc.filename}${originalBytes} — would regenerate`)
    continue
  }

  const targetName = doc.filename
  const sourceUrl = doc.url

  try {
    const response = await fetch(sourceUrl)
    if (!response.ok) throw new Error(`download failed: ${response.status}`)
    const buffer = Buffer.from(await response.arrayBuffer())

    // Park the filename first. Payload's upload flow asks "is this filename
    // taken?" before writing, and the document matches itself — so without
    // this the file is renamed to "<name>-1.<ext>" and the original object
    // is orphaned in the bucket.
    await payload.update({
      collection: 'media',
      id: doc.id,
      data: { filename: `${targetName}__regen` },
      context: { disableRevalidate: true },
    })

    await payload.update({
      collection: 'media',
      id: doc.id,
      data: {},
      // The local API takes the same shape the upload pipeline produces
      // internally: a Buffer plus the file's metadata.
      file: {
        name: targetName,
        data: buffer,
        mimetype: doc.mimeType,
        size: buffer.length,
      } as any,
      context: { disableRevalidate: true },
    })

    const refreshed = await payload.findByID({ collection: 'media', id: doc.id, depth: 0 })
    const sizes = (refreshed as any).sizes ?? {}
    const generated = Object.entries(sizes)
      .filter(([, value]: [string, any]) => value?.url)
      .map(([name, value]: [string, any]) => `${name} ${value.width}x${value.height}`)
      .join(', ')

    console.log(`  ${targetName}${originalBytes} → ${generated || 'NO SIZES GENERATED'}`)
    regenerated++
  } catch (error) {
    console.error(`  ${targetName} — FAILED:`, (error as Error).message)
    failed++
  }
}

console.log(`\nregenerated: ${regenerated}, skipped: ${skipped}, failed: ${failed}`)
process.exit(failed > 0 ? 1 : 0)

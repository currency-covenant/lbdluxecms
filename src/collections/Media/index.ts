import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { requireRoles } from '@/access/roles'
import { triggerWebhookAfterChange, triggerWebhookAfterDelete } from '@/hooks/triggerWebhooks'
import { logAuditAfterChange, logAuditAfterDelete } from '@/hooks/logAuditEvent'

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: requireRoles(['user']),
    read: () => true,
    update: requireRoles(['user']),
    delete: requireRoles(['user']),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  hooks: {
    afterChange: [triggerWebhookAfterChange, logAuditAfterChange],
    afterDelete: [triggerWebhookAfterDelete, logAuditAfterDelete],
  },
  upload: {
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      // Display variants are encoded as WebP: the same pixels in a fraction of
      // the bytes. "og" stays a PNG because social platforms do not all
      // accept WebP for link previews.
      {
        name: 'thumbnail',
        width: 300,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'square',
        width: 500,
        height: 500,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'small',
        width: 600,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'medium',
        width: 900,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'large',
        width: 1400,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'xlarge',
        width: 1920,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}

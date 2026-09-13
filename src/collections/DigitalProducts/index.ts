import type { CollectionConfig } from 'payload'

import { requireRoles } from '@/access/roles'
import { triggerWebhookAfterChange, triggerWebhookAfterDelete } from '@/hooks/triggerWebhooks'
import { logAuditAfterChange, logAuditAfterDelete } from '@/hooks/logAuditEvent'
import { revalidateDigitalProducts, revalidateDelete } from './hooks/revalidateDigitalProducts'
import { slugField } from 'payload'

export const DigitalProducts: CollectionConfig = {
  slug: 'digital-products',
  access: {
    create: requireRoles(['user']),
    read: () => true,
    update: requireRoles(['user']),
    delete: requireRoles(['user']),
  },
  admin: {
    defaultColumns: ['title', 'price', 'currency', 'featured', 'updatedAt'],
    useAsTitle: 'title',
    group: 'Ecommerce',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Product Title',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Short Description',
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Full Description',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Gallery',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      label: 'Price',
      admin: {
        position: 'sidebar',
        description: 'Display price. Charged via the Polar checkout link.',
      },
    },
    {
      name: 'currency',
      type: 'select',
      required: true,
      defaultValue: 'USD',
      options: [
        { label: 'USD ($)', value: 'USD' },
        { label: 'EUR (€)', value: 'EUR' },
        { label: 'GBP (£)', value: 'GBP' },
      ],
      label: 'Currency',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'polarCheckoutLink',
      type: 'text',
      required: true,
      label: 'Polar Checkout Link',
      admin: {
        description: 'The Polar Checkout Link for this product (from your Polar dashboard).',
      },
    },
    {
      name: 'badge',
      type: 'text',
      label: 'Badge',
      admin: {
        description: 'Optional badge shown on the card, e.g. "New" or "Best Seller".',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Featured',
      admin: {
        position: 'sidebar',
        description: 'Featured products are sorted first on the catalog.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Display Order',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateDigitalProducts, triggerWebhookAfterChange, logAuditAfterChange],
    afterDelete: [revalidateDelete, triggerWebhookAfterDelete, logAuditAfterDelete],
  },
  versions: {
    drafts: {
      schedulePublish: true,
      validate: true,
    },
    maxPerDoc: 50,
  },
}
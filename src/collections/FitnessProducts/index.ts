import type { CollectionConfig } from 'payload'

import { requireRoles } from '@/access/roles'
import { triggerWebhookAfterChange, triggerWebhookAfterDelete } from '@/hooks/triggerWebhooks'
import { logAuditAfterChange, logAuditAfterDelete } from '@/hooks/logAuditEvent'
import { revalidateFitnessProducts, revalidateDelete } from './hooks/revalidateFitnessProducts'
import { slugField } from 'payload'

/**
 * The fitness shop catalog. One collection covers all three product types so the
 * shop is self-contained and a new type doesn't need a new table. v1 only sells
 * `program` (digital, via a Polar checkout link); `supplement` and `peptide`
 * exist so we can show them as "coming soon" and flip them on later.
 *
 * For now `type` is the category. Sub-categories will be a `subcategory` field
 * added once the catalog grows, with product URLs staying stable.
 */
export const FitnessProducts: CollectionConfig = {
  slug: 'fitness-products',
  access: {
    create: requireRoles(['user']),
    read: () => true,
    update: requireRoles(['user']),
    delete: requireRoles(['user']),
  },
  admin: {
    defaultColumns: ['title', 'type', 'price', 'currency', 'featured', 'updatedAt'],
    useAsTitle: 'title',
    group: 'Fitness',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Product Title',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'program',
      label: 'Type',
      admin: {
        position: 'sidebar',
        description: 'The primary category in the shop.',
      },
      options: [
        { label: 'Program', value: 'program' },
        { label: 'Supplement', value: 'supplement' },
        { label: 'Peptide', value: 'peptide' },
      ],
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
      label: 'Polar Checkout Link',
      admin: {
        description:
          'Leave empty until the Polar product exists. The shop shows "Notify me" while this is blank and the Buy button activates once it is filled in.',
      },
    },
    {
      name: 'comingSoon',
      type: 'checkbox',
      defaultValue: false,
      label: 'Coming Soon',
      admin: {
        position: 'sidebar',
        description: 'Force the "Notify me" waitlist even if a checkout link exists.',
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
      name: 'ageRestricted',
      type: 'checkbox',
      defaultValue: false,
      label: 'Age Restricted',
      admin: {
        position: 'sidebar',
        description: 'Requires the visitor to confirm they are of age before viewing.',
      },
    },
    {
      name: 'availableRegions',
      type: 'text',
      label: 'Available Regions',
      defaultValue: 'US',
      admin: {
        description:
          'Comma-separated region codes, e.g. "US, CA". Display only for now.',
      },
    },
    {
      name: 'shippingNote',
      type: 'text',
      label: 'Shipping Note',
      admin: {
        description: 'Short note shown on the product page, e.g. "Ships in 2–4 business days".',
      },
    },
    {
      name: 'disclaimer',
      type: 'richText',
      label: 'Disclaimer',
      admin: {
        description:
          'Legal/research-use text shown on the product page. Required for supplements and peptides.',
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
    afterChange: [revalidateFitnessProducts, triggerWebhookAfterChange, logAuditAfterChange],
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

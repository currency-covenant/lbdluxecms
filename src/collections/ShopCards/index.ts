import type { CollectionConfig } from 'payload'

import { requireRoles } from '@/access/roles'
import { triggerWebhookAfterChange, triggerWebhookAfterDelete } from '@/hooks/triggerWebhooks'
import { logAuditAfterChange, logAuditAfterDelete } from '@/hooks/logAuditEvent'
import { revalidateShopCards, revalidateDelete } from './hooks/revalidateShopCards'

export const ShopCards: CollectionConfig = {
  slug: 'shop-cards',
  access: {
    create: requireRoles(['user']),
    read: () => true,
    update: requireRoles(['user']),
    delete: requireRoles(['user']),
  },
  admin: {
    defaultColumns: ['title', 'badge', 'accentColor', 'order', 'updatedAt'],
    useAsTitle: 'title',
    group: 'Content',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      name: 'badge',
      type: 'text',
      label: 'Badge',
      admin: {
        description: 'Small chip shown in the top-left corner, e.g. "PERSONAL" or "CURRENCY COVENANT".',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo / Icon Image',
      admin: {
        position: 'sidebar',
        description: 'Optional square image shown above the title (e.g. the Covenant Seal). Falls back to the arrow icon when omitted.',
      },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'Link URL',
      admin: {
        description: 'Where the card links (e.g. https://shop.lbdluxe.com).',
      },
    },
    {
      name: 'urlLabel',
      type: 'text',
      label: 'URL Label',
      admin: {
        description: 'Display text for the URL, e.g. "SHOP.LBDLUXE.COM".',
      },
    },
    {
      name: 'accentColor',
      type: 'text',
      defaultValue: '#22d3ee',
      label: 'Accent Color (hex)',
      admin: {
        description: 'Solid accent used for the badge, icon and URL label (e.g. #22d3ee cyan, #f43f5e rose).',
        position: 'sidebar',
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
  ],
  hooks: {
    afterChange: [revalidateShopCards, triggerWebhookAfterChange, logAuditAfterChange],
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

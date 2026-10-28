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
    defaultColumns: ['title', 'badge', 'shape', 'order', 'updatedAt'],
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
      name: 'shape',
      type: 'select',
      defaultValue: 'cube',
      options: [
        { label: 'Cube', value: 'cube' },
        { label: 'Octahedron', value: 'octahedron' },
        { label: 'Tetrahedron', value: 'tetrahedron' },
        { label: 'Square Pyramid', value: 'pyramid' },
        { label: 'Hexagonal Prism', value: 'prism' },
        { label: 'Globe', value: 'globe' },
      ],
      label: '3D Shape',
      admin: {
        position: 'sidebar',
        description: 'The wireframe shape rendered in the card scene.',
      },
    },
    {
      name: 'hueOffset',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 359,
      label: 'Rainbow Hue Offset',
      admin: {
        position: 'sidebar',
        description: 'Shifts this card\'s rainbow spectrum (0–359°) so adjacent cards look distinct.',
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

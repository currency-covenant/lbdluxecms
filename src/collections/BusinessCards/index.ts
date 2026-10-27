import type { CollectionConfig } from 'payload'

import { requireRoles } from '@/access/roles'
import { triggerWebhookAfterChange, triggerWebhookAfterDelete } from '@/hooks/triggerWebhooks'
import { logAuditAfterChange, logAuditAfterDelete } from '@/hooks/logAuditEvent'
import { revalidateBusinessCard, revalidateDelete } from './hooks/revalidateBusinessCard'

export const BusinessCards: CollectionConfig = {
  slug: 'business-cards',
  access: {
    create: requireRoles(['user']),
    read: () => true,
    update: requireRoles(['user']),
    delete: requireRoles(['user']),
  },
  admin: {
    defaultColumns: ['name', 'title', 'company', 'updatedAt'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Display Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      defaultValue: 'main',
      unique: true,
      label: 'Card Slug (URL segment)',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Job Title',
    },
    {
      name: 'department',
      type: 'text',
      label: 'Department',
    },
    {
      name: 'headline',
      type: 'text',
      label: 'Headline',
    },
    {
      name: 'company',
      type: 'text',
      label: 'Company / Organization',
    },
    {
      name: 'companyLogo',
      type: 'upload',
      relationTo: 'media',
      label: 'Company Logo (legacy — prefer Logos array)',
      admin: {
        description: 'Deprecated in favor of the Logos array. Kept for back-compat; the card prefers the Logos array when populated.',
      },
    },
    {
      name: 'logos',
      type: 'array',
      label: 'Logos',
      labels: {
        singular: 'Logo',
        plural: 'Logos',
      },
      admin: {
        description: 'Reusable logo tiles. Position controls where each renders: "banner" = across from the profile picture, "below" = strip under the name block.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Logo Image',
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Alt Text',
        },
        {
          name: 'url',
          type: 'text',
          label: 'Link URL (optional)',
        },
        {
          name: 'position',
          type: 'select',
          defaultValue: 'banner',
          options: [
            { label: 'Banner (across from profile picture)', value: 'banner' },
            { label: 'Below the name block', value: 'below' },
          ],
          label: 'Position',
          admin: {
            width: '50%',
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
      ],
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Bio / Tagline',
    },
    {
      name: 'accreditations',
      type: 'array',
      label: 'Accreditations',
      labels: {
        singular: 'Accreditation',
        plural: 'Accreditations',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Profile Image',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover / Banner Image',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
    },
    {
      name: 'website',
      type: 'text',
      label: 'Website URL',
    },
    {
      name: 'companyUrl',
      type: 'text',
      label: 'Company URL',
    },
    {
      name: 'calendarUrl',
      type: 'text',
      label: 'Calendar / Booking URL',
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'Mailing Address',
    },
    {
      name: 'mapUrl',
      type: 'text',
      label: 'Map / Directions URL',
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Links',
      labels: {
        singular: 'Social Link',
        plural: 'Social Links',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'platform',
          type: 'select',
          defaultValue: 'other',
          options: [
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'X / Twitter', value: 'twitter' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'GitHub', value: 'github' },
            { label: 'Threads', value: 'threads' },
            { label: 'Snapchat', value: 'snapchat' },
            { label: 'Twitch', value: 'twitch' },
            { label: 'Yelp', value: 'yelp' },
            { label: 'Calendly', value: 'calendly' },
            { label: 'Other', value: 'other' },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'iconType',
          type: 'select',
          defaultValue: 'auto',
          options: [
            { label: 'Auto (from URL)', value: 'auto' },
            { label: 'Custom upload', value: 'custom' },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (_, siblingData) => siblingData?.iconType === 'custom',
          },
        },
      ],
    },
    {
      name: 'contactRows',
      type: 'array',
      label: 'Custom Contact Rows',
      labels: {
        singular: 'Contact Row',
        plural: 'Contact Rows',
      },
      admin: {
        description: 'Extra Blinq-style rows you control (portfolio, booking links, custom). Use Payment Links for PayPal/Venmo/Cash App/Skype.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'custom',
          options: [
            { label: 'Email', value: 'email' },
            { label: 'Phone / Mobile', value: 'phone' },
            { label: 'Text / SMS', value: 'text' },
            { label: 'Website', value: 'website' },
            { label: 'Company', value: 'company' },
            { label: 'Calendar / Booking', value: 'calendar' },
            { label: 'Location / Address', value: 'address' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'X / Twitter', value: 'twitter' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'GitHub', value: 'github' },
            { label: 'Threads', value: 'threads' },
            { label: 'Snapchat', value: 'snapchat' },
            { label: 'Twitch', value: 'twitch' },
            { label: 'Yelp', value: 'yelp' },
            { label: 'Custom', value: 'custom' },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'label',
          type: 'text',
          label: 'Label (small sub-text)',
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          label: 'Value (displayed)',
        },
        {
          name: 'url',
          type: 'text',
          label: 'Link URL (auto-derived if blank)',
        },
        {
          name: 'iconType',
          type: 'select',
          defaultValue: 'auto',
          options: [
            { label: 'Auto (from type)', value: 'auto' },
            { label: 'Custom upload', value: 'custom' },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (_, siblingData) => siblingData?.iconType === 'custom',
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
      ],
    },
    {
      name: 'paymentLinks',
      type: 'array',
      label: 'Payment Links',
      labels: {
        singular: 'Payment Link',
        plural: 'Payment Links',
      },
      admin: {
        description: 'Blinq-style payment fields (Cash App, PayPal, Venmo, Skype). Each renders as a brand-coloured icon row with a link. Type a $cashtag or handle and the URL is built automatically.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'cashapp',
          options: [
            { label: 'Cash App', value: 'cashapp' },
            { label: 'PayPal', value: 'paypal' },
            { label: 'Venmo', value: 'venmo' },
            { label: 'Skype', value: 'skype' },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          label: 'Value ($cashtag, handle, or full URL)',
        },
        {
          name: 'url',
          type: 'text',
          label: 'Link URL (auto-derived if blank)',
        },
        {
          name: 'label',
          type: 'text',
          label: 'Label (e.g. "Pay me via Cash App")',
        },
        {
          name: 'iconType',
          type: 'select',
          defaultValue: 'auto',
          options: [
            { label: 'Auto (brand logo)', value: 'auto' },
            { label: 'Custom upload', value: 'custom' },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (_, siblingData) => siblingData?.iconType === 'custom',
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
      ],
    },
    {
      name: 'accentColor',
      type: 'text',
      defaultValue: '#6366f1',
      label: 'Accent Color (hex)',
      admin: {
        description: 'Brand color used for the card icons and Save Contact button.',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateBusinessCard, triggerWebhookAfterChange, logAuditAfterChange],
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

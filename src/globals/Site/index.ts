import type { GlobalConfig } from 'payload'

import { requireRoles } from '@/access/roles'

export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Site Settings',
  access: {
    read: () => true,
    update: requireRoles(['user']),
  },
  admin: {
    group: 'Content',
    description: 'Site-wide settings and SEO defaults used by lbdluxe.com and links.lbdluxe.com.',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'LBDLUXE',
    },
    {
      name: 'defaultTitle',
      type: 'text',
      label: 'Default SEO Title',
      admin: {
        description: 'Fallback <title> / og:title when a page has no meta.',
      },
    },
    {
      name: 'defaultDescription',
      type: 'textarea',
      label: 'Default SEO Description',
      admin: {
        description: 'Fallback meta description when a page has no meta.',
      },
    },
    {
      name: 'siteUrl',
      type: 'text',
      label: 'Main Site URL',
      admin: {
        description: 'e.g. https://lbdluxe.com',
      },
    },
    {
      name: 'linksUrl',
      type: 'text',
      label: 'Links Site URL',
      admin: {
        description: 'e.g. https://links.lbdluxe.com',
      },
    },
    {
      name: 'ogImage',
      label: 'Default OG Image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Reserved for future use — default share-card image.',
      },
    },
    {
      name: 'themeColor',
      type: 'text',
      admin: {
        description: 'Reserved for future use — browser theme color (e.g. #0a0a0a).',
      },
    },
    {
      name: 'newsletter',
      type: 'group',
      label: 'Newsletter Form',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'Subscribe to Newsletter',
        },
        {
          name: 'subtitle',
          type: 'textarea',
        },
        {
          name: 'placeholder',
          type: 'text',
          defaultValue: 'name@example.com',
        },
        {
          name: 'buttonLabel',
          type: 'text',
          defaultValue: 'Subscribe',
        },
      ],
    },
    {
      name: 'socials',
      type: 'array',
      label: 'Social Links',
      admin: {
        initCollapsed: true,
        description: 'Data-driven social/profile links (used by the site navigation links).',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Name',
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'URL',
        },
      ],
    },
  ],
}
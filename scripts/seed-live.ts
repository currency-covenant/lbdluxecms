const CMS = 'https://cms.lbdluxe.com'

const siteGlobal = {
  siteName: 'LBDLUXE',
  defaultTitle: 'Lawrence Brown -- Full-Stack Developer',
  defaultDescription:
    'Portfolio of Lawrence Brown, a full-stack developer crafting modern, accessible, high-performance web applications, tutorials, and open-source projects.',
  siteUrl: 'https://lbdluxe.com',
  linksUrl: 'https://links.lbdluxe.com',
  newsletter: {
    heading: 'Subscribe to Newsletter',
    subtitle: 'A newsletter for entrepreneurs, developers, and lifelong learners.',
    placeholder: 'name@example.com',
    buttonLabel: 'Subscribe',
  },
  socials: [
    { title: 'LinkedIn', url: 'https://www.linkedin.com/in/lbsudo' },
    { title: 'Instagram', url: 'https://www.instagram.com/lbdluxe' },
    { title: 'YouTube', url: 'https://www.youtube.com/@lbdluxe' },
    { title: 'TikTok', url: 'https://www.tiktok.com/@lbdluxe' },
    { title: 'Rumble', url: 'https://www.rumble.com/c/c-6589313' },
  ],
}

const pages = [
  {
    slug: 'blog',
    title: 'Blog',
    hero: {
      type: 'lowImpact',
      links: [
        { link: { type: 'custom', newTab: false, label: 'Read Blog', url: '/blog' } },
      ],
    },
    meta: {
      title: 'Blog',
      description:
        'Articles by Lawrence Brown — ideas, tutorials, and lessons learned building for the web.',
    },
    layout: [],
  },
  {
    slug: 'shelf',
    title: 'Shelf',
    hero: {
      type: 'lowImpact',
      links: [
        { link: { type: 'custom', newTab: false, label: 'Browse Categories', url: '/shelf' } },
      ],
    },
    meta: {
      title: 'The Shelf',
      description: "Explore Lawrence Brown's shelf collection by category.",
    },
    layout: [],
  },
  {
    slug: 'shelf-items',
    title: 'Shelf Items',
    hero: {
      type: 'lowImpact',
      links: [
        { link: { type: 'custom', newTab: false, label: 'Media Library', url: '/shelf-items' } },
      ],
    },
    meta: {
      title: 'My Shelf',
      description: "Books, movies, TV shows, and albums Lawrence Brown has enjoyed.",
    },
    layout: [],
  },
]

async function api(path: string, opts: { method?: string; token?: string; body?: unknown } = {}) {
  const res = await fetch(`${CMS}/api${path}`, {
    method: opts.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { Authorization: `JWT ${opts.token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  return { status: res.status, data }
}

async function seedSiteGlobal(token: string) {
  const existing = await api('/globals/site', { token })
  if (existing.status === 200 && (existing.data as { siteName?: string })?.siteName) {
    console.log('site global already seeded — skipping')
    return
  }
  const res = await api('/globals/site', { method: 'POST', token, body: siteGlobal })
  if (res.status < 300) {
    console.log('seeded site global')
  } else {
    console.error('FAILED site global:', res.status, JSON.stringify(res.data).slice(0, 300))
  }
}

async function seedPages(token: string) {
  for (const page of pages) {
    const found = await api(
      `/pages?where[slug][equals]=${page.slug}&limit=1&depth=0`,
      { token },
    )
    const exists = (found.data as { docs?: unknown[] }).docs?.length ?? 0
    if (exists) {
      console.log(`page "${page.slug}" already exists — skipping`)
      continue
    }
    const created = await api('/pages', {
      method: 'POST',
      token,
      body: { ...page, _status: 'published' },
    })
    if (created.status < 300) {
      console.log(`created page "${page.slug}"`)
    } else {
      console.error(`FAILED page "${page.slug}":`, created.status, JSON.stringify(created.data).slice(0, 200))
    }
  }
}

async function main() {
  const login = await api('/users/login', {
    method: 'POST',
    body: { email: 'admin@lbdluxe.digital', password: 'demo' },
  })
  const token = (login.data as { token?: string })?.token
  if (!token) {
    console.error('LOGIN FAILED:', login.status, JSON.stringify(login.data).slice(0, 300))
    throw new Error('Could not authenticate to CMS — please provide admin credentials')
  }
  console.log('authenticated as admin@lbdluxe.digital')

  await seedSiteGlobal(token)
  await seedPages(token)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
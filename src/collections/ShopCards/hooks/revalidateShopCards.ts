import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateShopCards: CollectionAfterChangeHook = ({
  doc,
  req: { payload },
}) => {
  if (doc._status === 'published') {
    payload.logger.info('Revalidating shop-cards')
    try {
      revalidateTag('shop-cards')
    } catch {
      // Called outside a Next.js request context (e.g. a seed script) — safe to ignore.
    }
  }
}

export const revalidateDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload },
}) => {
  payload.logger.info('Revalidating shop-cards')
  revalidateTag('shop-cards')
}

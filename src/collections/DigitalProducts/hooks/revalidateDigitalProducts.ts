import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateDigitalProducts: CollectionAfterChangeHook = ({
  doc,
  req: { payload },
}) => {
  if (doc._status === 'published') {
    payload.logger.info('Revalidating digital-products')
    revalidateTag('digital-products')
  }
}

export const revalidateDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload },
}) => {
  payload.logger.info('Revalidating digital-products')
  revalidateTag('digital-products')
}
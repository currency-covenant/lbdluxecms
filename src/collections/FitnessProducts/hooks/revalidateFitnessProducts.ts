import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateFitnessProducts: CollectionAfterChangeHook = ({
  doc,
  req: { payload },
}) => {
  if (doc._status === 'published') {
    payload.logger.info('Revalidating fitness-products')
    revalidateTag('fitness-products')
  }
}

export const revalidateDelete: CollectionAfterDeleteHook = ({ doc, req: { payload } }) => {
  payload.logger.info('Revalidating fitness-products')
  revalidateTag('fitness-products')
}

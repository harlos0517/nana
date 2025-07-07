/* eslint-disable @typescript-eslint/no-explicit-any */
import { NanaError } from '@/NanaError'
import { BaseCTX, NanaAction, NanaErrorHandler } from './types'

const DEV = process.env.NODE_ENV !== 'production'

export const defaultAction: NanaAction<any> =
  ({ data, res }) => {
    res.locals.body = data
    res.status(200).send(data)
  }

export const defaultErrorHandler: NanaErrorHandler<any> =
  (err, ctx, errorLogger = console.error) => {
    errorLogger(err)
    try {
      const status = err instanceof NanaError ? err.status : 500
      const htmlMsg = DEV
        ? err instanceof Error ? err.message : String(err)
        : err instanceof NanaError ? err.message : 'unknown error'
      ctx.res.status(status).send(htmlMsg)
    } catch(err) {
      errorLogger(err)
    }
  }

export const combineActions = <ChildCTX extends ParentCTX, ParentCTX extends BaseCTX>(
  childAction: NanaAction<ChildCTX>,
  parentAction: NanaAction<ParentCTX>,
): NanaAction<ChildCTX> => async ctx => {
  await childAction(ctx)
  await parentAction(ctx)
}

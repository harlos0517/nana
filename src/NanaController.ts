import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express'

import { defaultAction, defaultErrorHandler, defaultTransformer } from '@/defaults'
import {
  BaseCTX,
  NanaAction,
  NanaControllerHandler,
  NanaErrorHandler,
  NanaTransformer,
} from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class NanaController<CTX extends BaseCTX = BaseCTX, Result = any, Data = Result> {
  public handler: NanaControllerHandler<CTX, Result>
  public action?: NanaAction<CTX, Data>
  public errorHandler?: NanaErrorHandler<CTX>
  public transformer?: NanaTransformer<CTX, Result, Data>

  readonly _handler = async(req: ExpressRequest, res: ExpressResponse) => {
    const allCtx = { ...req.ctx as CTX, req, res }
    try {
      const data = await this.handler(allCtx)
      const results = await this.transformer?.(data, allCtx) || defaultTransformer(data, allCtx)
      res.locals.body = results
      await (this.action || defaultAction)(results, allCtx)
    } catch(err) {
      await (this.errorHandler || defaultErrorHandler)(err, allCtx)
    }
  }

  constructor(handler: NanaControllerHandler<CTX, Result>) {
    this.handler = handler
  }
}

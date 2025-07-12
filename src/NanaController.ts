import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express'

import { defaultAction, defaultErrorHandler, defaultTransformer } from './defaults'
import {
  Empty,
  NanaAction,
  NanaControllerHandler,
  NanaErrorHandler,
  NanaTransformer,
  Obj,
} from './types'
import { createContextArgument } from './util'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class NanaController<CTX extends Obj = Empty, Result = any, Data = Result> {
  public handler: NanaControllerHandler<CTX, Result>
  public action?: NanaAction<CTX, Data>
  public errorHandler?: NanaErrorHandler<CTX>
  public transformer?: NanaTransformer<CTX, Result, Data>

  readonly _handler = async(req: ExpressRequest, res: ExpressResponse) => {
    const allCtx = createContextArgument<CTX>(req.ctx as CTX, req, res)
    try {
      const result: Result = await this.handler(allCtx)
      const data: Data =
        await this.transformer?.(result, allCtx) || defaultTransformer(result, allCtx)
      res.locals.body = data
      await (this.action || defaultAction)(data, allCtx)
    } catch(err) {
      await (this.errorHandler || defaultErrorHandler)(err, allCtx)
    }
  }

  constructor(handler: NanaControllerHandler<CTX, Result>) {
    this.handler = handler
  }
}

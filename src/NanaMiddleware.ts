

import {
  NextFunction as ExpressNext,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express'

import { defaultErrorHandler } from '@/defaults'
import {
  Empty,
  NanaErrorHandler,
  NanaMiddlewareCreateContext,
  NanaPostHandler,
  Obj,
} from '@/types'

export class NanaMiddleware<
  NewCTX extends Obj = Empty,
  _ParentCTX extends Obj = Empty,
  _CTX extends NewCTX & _ParentCTX = NewCTX & _ParentCTX,
> {
  public readonly getContext: NanaMiddlewareCreateContext<NewCTX, _ParentCTX>
  public readonly postHandler?: NanaPostHandler<_CTX>
  public readonly errorHandler: NanaErrorHandler<_CTX>

  readonly handler = async(
    req: ExpressRequest,
    res: ExpressResponse,
    next: ExpressNext,
  ) => {
    try {
      const newCtx = await this.getContext({ ...req.ctx as _ParentCTX, req, res })
      Object.assign(req.ctx, newCtx)
      next()
      this.postHandler?.({ ...req.ctx as _CTX, req, res })
    } catch(err) {
      await this.errorHandler(err, { ...req.ctx as _CTX, req, res })
    }
  }

  constructor(
    getContext: NanaMiddlewareCreateContext<NewCTX, _ParentCTX> = _ => ({} as NewCTX),
    errorHandler: NanaErrorHandler<_CTX> = defaultErrorHandler,
    postHandler?: NanaPostHandler<_CTX>,
  ) {
    this.getContext = getContext
    this.errorHandler = errorHandler
    this.postHandler = postHandler
  }
}

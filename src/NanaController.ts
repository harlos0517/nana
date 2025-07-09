import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  Router as ExpressRouter,
} from 'express'

import { defaultAction, defaultErrorHandler } from '@/defaults'
import { NanaRouter } from '@/NanaRouter'
import {
  BaseCTX,
  ControllerArgs,
  METHOD,
  NanaAction,
  NanaControllerHandler,
  NanaErrorHandler,
} from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class NanaController<CTX extends BaseCTX = BaseCTX, Data = any> {
  public readonly parentRouter: NanaRouter<CTX> | ExpressRouter
  public readonly routeName: string
  public readonly method: METHOD
  public readonly handler: NanaControllerHandler<CTX, Data>
  public readonly action: NanaAction<CTX, Data>
  public readonly errorHandler: NanaErrorHandler<CTX>

  private _handler = async(req: ExpressRequest, res: ExpressResponse) => {
    try {
      if (!req.ctx) req.ctx = {}
      const data = await this.handler({ ...req.ctx as CTX, req, res })
      res.locals.body = data
      await this.action(data, { ...req.ctx as CTX, req, res })
    } catch(err) {
      await this.errorHandler(err, { ...req.ctx as CTX, req, res })
    }
  }

  constructor(
    parentRouter: NanaRouter<CTX> | ExpressRouter,
    method: METHOD,
    ...[routeName, handler]: ControllerArgs<CTX>
  ) {
    this.parentRouter = parentRouter
    this.method = method
    this.routeName = routeName
    this.handler = handler
    if (parentRouter instanceof NanaRouter) {
      this.action = parentRouter.action
      this.errorHandler = parentRouter.errorHandler
      parentRouter.children[routeName] = this
      const expressRouter = parentRouter.expressRouter as ExpressRouter
      expressRouter[this.method](routeName, this._handler)
    } else {
      parentRouter[this.method](routeName, this._handler)
      this.action = defaultAction
      this.errorHandler = defaultErrorHandler
    }
  }
}

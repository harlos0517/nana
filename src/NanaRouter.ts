/* eslint-disable no-unused-vars */
/* eslint-disable @stylistic/max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router as ExpressRouter } from 'express'

import { defaultAction, defaultErrorHandler, defaultTransformer } from '@/defaults'
import { NanaController } from '@/NanaController'
import { NanaMiddleware } from '@/NanaMiddleware'
import {
  BaseCTX,
  ControllerArgs,
  Empty,
  METHOD,
  NanaAction,
  NanaErrorHandler,
  NanaTransformer,
  Obj,
} from '@/types'
import { routeChecker } from '@/util'

export class NanaRouter<
  NewCTX extends Obj = Empty,
  Data = any,
  _ParentCTX extends BaseCTX = BaseCTX,
  _ParentData = Data,
  __CTX extends _ParentCTX & NewCTX = _ParentCTX & NewCTX,
> {
  public parent?: NanaRouter<any, _ParentData, any, any, _ParentCTX> | ExpressRouter
  public route: string
  public readonly expressRouter: ExpressRouter = ExpressRouter()
  public readonly action: NanaAction<__CTX, Data>
  public readonly transformer: NanaTransformer<__CTX, _ParentData, Data>
  public readonly errorHandler: NanaErrorHandler<__CTX>
  public readonly children: Record<string, NanaRouter<any, any, __CTX, Data, any> | NanaController<__CTX, Data> | ExpressRouter> = {}

  constructor(
    route?: string,
    parent?: typeof this.parent,
    action?: typeof this.action,
    transformer?: typeof this.transformer,
    errorHandler?: typeof this.errorHandler,
  ) {
    this.route = routeChecker(route || '')
    this.parent = parent
    if (parent instanceof NanaRouter) {
      if (parent.children[this.route])
        throw new Error(`Route "${this.route}" already exists in parent router.`)
      parent.children[this.route] = this
      parent.expressRouter.use(this.route, this.expressRouter)
      this.action = action || ((data, ctx) => parent.action(data as any, ctx)) as NanaAction<__CTX, Data>
      this.transformer = transformer
        ? async(data, ctx) => transformer(await parent.transformer(data, ctx), ctx)
        : ((data, ctx) => parent.transformer(data, ctx)) as NanaTransformer<__CTX, _ParentData, Data>
      this.errorHandler = errorHandler || parent.errorHandler
    } else {
      parent?.use(this.route, this.expressRouter)
      this.action = action || defaultAction
      this.transformer = transformer || defaultTransformer
      this.errorHandler = errorHandler || defaultErrorHandler
    }
  }

  use<ChildNewCTX extends Obj = Empty>(_routeName: string): NanaRouter<ChildNewCTX, any, __CTX, Data>
  use<ChildNewCTX extends Obj = Empty>(_routeName: string, _router: ExpressRouter): void
  use<ChildNewCTX extends Obj = Empty>(_routeName: string, _router: NanaRouter<ChildNewCTX, any, __CTX, Data>): void
  use<_, ThisCTX extends Partial<NewCTX> = NewCTX>(_middleware: NanaMiddleware<ThisCTX, _ParentCTX>): void
  use<ChildNewCTX extends Obj = Empty>(_router: ExpressRouter): void
  use<ChildNewCTX extends Obj = Empty, ThisCTX extends Partial<NewCTX> = NewCTX>(
    ...args: [string] | [string, NanaRouter<ChildNewCTX, any, __CTX, Data> | ExpressRouter]
      | [NanaMiddleware<ThisCTX, _ParentCTX> | ExpressRouter]
  ) {
    const [routeName, toMount] = typeof args[0] === 'string' ? [args[0], args[1]] : ['/', args[0]]
    const route = routeChecker(routeName)
    if (toMount instanceof NanaRouter) {
      if (this.children[route])
        throw new Error(`Route "${this.route}" already exists in parent router.`)
      this.expressRouter.use(route, toMount.expressRouter)
      this.children[route] = toMount
      toMount.parent = this
      toMount.route = route
    } else if (toMount instanceof NanaMiddleware) {
      const middleware = toMount as NanaMiddleware<ThisCTX, _ParentCTX>
      this.expressRouter.use(middleware.handler)
    } else if (toMount instanceof ExpressRouter) {
      const expressRouter = toMount as ExpressRouter
      expressRouter.use(async(req, res, next) => {
        try {
          if (!req.ctx) req.ctx = {}
          await next()
        } catch(err) {
          await this.errorHandler(err, { ...req.ctx as __CTX, req, res })
        }
      })
      this.expressRouter.use(route, expressRouter)
      this.children[route] = expressRouter
      return toMount
    } else {
      const router = new NanaRouter<ChildNewCTX, any, __CTX, Data>(route, this)
      this.expressRouter.use(route, router.expressRouter)
      this.children[route] = router
      return router
    }
  }

  private _createController(method: METHOD, ...args: ControllerArgs<__CTX, Data>) {
    return new NanaController<__CTX, Data>(this, method, ...args)
  }

  get(...args: ControllerArgs<__CTX, Data>) {
    return this._createController(METHOD.GET, ...args)
  }

  post(...args: ControllerArgs<__CTX, Data>) {
    return this._createController(METHOD.POST, ...args)
  }

  put(...args: ControllerArgs<__CTX, Data>) {
    return this._createController(METHOD.PUT, ...args)
  }

  delete(...args: ControllerArgs<__CTX, Data>) {
    return this._createController(METHOD.DELETE, ...args)
  }

  patch(...args: ControllerArgs<__CTX, Data>) {
    return this._createController(METHOD.PATCH, ...args)
  }

  options(...args: ControllerArgs<__CTX, Data>) {
    return this._createController(METHOD.OPTIONS, ...args)
  }

  head(...args: ControllerArgs<__CTX, Data>) {
    return this._createController(METHOD.HEAD, ...args)
  }
}

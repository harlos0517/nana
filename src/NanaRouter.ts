/* eslint-disable no-unused-vars */
/* eslint-disable @stylistic/max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router as ExpressRouter } from 'express'

import { defaultAction, defaultErrorHandler, defaultTransformer } from '@/defaults'
import { NanaController } from '@/NanaController'
import { NanaMiddleware } from '@/NanaMiddleware'
import {
  BaseCTX,
  Empty,
  METHOD,
  NanaAction,
  NanaControllerHandler,
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
  public readonly expressRouter: ExpressRouter
  public action?: NanaAction<__CTX, Data>
  public transformer: NanaTransformer<__CTX, _ParentData, Data>
  public errorHandler?: NanaErrorHandler<__CTX>
  public readonly children: Record<string, NanaRouter<any, any, __CTX, Data, any> | NanaController<__CTX, any, Data> | ExpressRouter> = {}

  readonly _transformer: NanaTransformer<__CTX, Data> = async<Result = any>(data: Result, ctx: __CTX) =>
    this.parent instanceof NanaRouter
      ? this.transformer(await this.parent._transformer(data as any, ctx), ctx)
      : this.transformer(data as any, ctx)

  constructor(
    action?: typeof this.action,
    transformer?: typeof this.transformer,
    errorHandler?: typeof this.errorHandler,
  ) {
    this.action = action
    this.transformer = transformer || defaultTransformer
    this.errorHandler = errorHandler
    this.expressRouter = ExpressRouter()
  }

  use<ChildNewCTX extends Obj = Empty>(_routeName: string): NanaRouter<ChildNewCTX, any, __CTX, Data>
  use<ChildNewCTX extends Obj = Empty>(_routeName: string, _router: NanaRouter<ChildNewCTX, any, __CTX, Data>): void
  use<_, ThisCTX extends Partial<NewCTX> = NewCTX>(_middleware: NanaMiddleware<ThisCTX, _ParentCTX>): void
  use<ChildNewCTX extends Obj = Empty, ThisCTX extends Partial<NewCTX> = NewCTX>(
    ...args: [string] | [string, NanaRouter<ChildNewCTX, any, __CTX, Data> | ExpressRouter]
      | [NanaMiddleware<ThisCTX, _ParentCTX> | ExpressRouter]
  ) {
    const [routeName, toMount] = typeof args[0] === 'string' ? [args[0], args[1]] : ['/', args[0]]
    const route = routeChecker(routeName)
    if (toMount instanceof NanaRouter) {
      if (this.children[route])
        throw new Error(`Route "${route}" already exists in parent router.`)
      this.expressRouter.use(route, toMount.expressRouter)
      this.children[route] = toMount
      toMount.parent = this
      toMount.action ||= this.action
      toMount.errorHandler ||= this.errorHandler
    } else if (toMount instanceof NanaMiddleware) {
      const middleware = toMount as NanaMiddleware<ThisCTX, _ParentCTX>
      this.expressRouter.use(middleware.handler)
    } else {
      const router = new NanaRouter<ChildNewCTX, any, __CTX, Data>(
        this.action,
        defaultTransformer,
        this.errorHandler,
      )
      router.parent = this
      this.expressRouter.use(route, router.expressRouter)
      this.children[route] = router
      return router
    }
  }

  private _createController<Result = any>(
    method: METHOD,
    route: string,
    handler: NanaControllerHandler<__CTX, Result> | NanaController<__CTX, Result, Data>,
  ) {
    route = routeChecker(route)
    const controller = handler instanceof NanaController
      ? handler : new NanaController<__CTX, Result, Data>(handler)
    controller.action ||= this.action || defaultAction
    controller.errorHandler ||= this.errorHandler || defaultErrorHandler
    controller.transformer = (data: Result, ctx: __CTX) => this._transformer(data as any, ctx)
    this.children[route] = controller
    this.expressRouter[method](route, controller._handler)
    return controller
  }

  get(route: string, handler: NanaControllerHandler<__CTX, Data> | NanaController<__CTX, any, Data>) {
    return this._createController(METHOD.GET, route, handler)
  }

  post(route: string, handler: NanaControllerHandler<__CTX, Data> | NanaController<__CTX, any, Data>) {
    return this._createController(METHOD.POST, route, handler)
  }

  put(route: string, handler: NanaControllerHandler<__CTX, Data> | NanaController<__CTX, any, Data>) {
    return this._createController(METHOD.PUT, route, handler)
  }

  delete(route: string, handler: NanaControllerHandler<__CTX, Data> | NanaController<__CTX, any, Data>) {
    return this._createController(METHOD.DELETE, route, handler)
  }

  patch(route: string, handler: NanaControllerHandler<__CTX, Data> | NanaController<__CTX, any, Data>) {
    return this._createController(METHOD.PATCH, route, handler)
  }

  options(route: string, handler: NanaControllerHandler<__CTX, Data> | NanaController<__CTX, any, Data>) {
    return this._createController(METHOD.OPTIONS, route, handler)
  }

  head(route: string, handler: NanaControllerHandler<__CTX, Data> | NanaController<__CTX, any, Data>) {
    return this._createController(METHOD.HEAD, route, handler)
  }
}

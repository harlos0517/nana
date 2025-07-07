/* eslint-disable no-unused-vars */
/* eslint-disable @stylistic/max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router as ExpressRouter } from 'express'

import { combineActions, defaultAction, defaultErrorHandler } from '@/defaults'
import { NanaController } from '@/NanaController'
import { NanaMiddleware } from '@/NanaMiddleware'
import {
  BaseCTX,
  ControllerArgs,
  Empty,
  METHOD,
  NanaAction,
  NanaErrorHandler,
  Obj,
} from '@/types'

export class NanaRouter<
  NewCTX extends Obj = Empty,
  _ParentCTX extends BaseCTX = BaseCTX,
  _CTX extends _ParentCTX & NewCTX = _ParentCTX & NewCTX,
> {
  public readonly parent?: NanaRouter<any, any, _ParentCTX> | ExpressRouter
  public readonly router: ExpressRouter = ExpressRouter()
  public readonly route: string
  public action: NanaAction<_CTX>
  public errorHandler: NanaErrorHandler<_CTX>
  public readonly subRouters: Record<string, NanaRouter<any, _CTX> | NanaController<_CTX> | ExpressRouter> = {}

  constructor(
    route?: string,
    parent?: NanaRouter<any, any, _ParentCTX> | ExpressRouter,
    controllerAction?: NanaAction<_CTX>,
    errorHandler?: NanaErrorHandler<_CTX>,
  ) {
    this.route = route || '/'
    this.parent = parent
    if (parent instanceof NanaRouter) {
      if (parent.subRouters[this.route])
        throw new Error(`Route "${this.route}" already exists in parent router.`)
      parent.subRouters[this.route] = this
      parent.router.use(this.route, this.router)
      this.action = combineActions<_CTX, _ParentCTX>(
        controllerAction || (() => void 0),
        parent.action,
      )
      this.errorHandler = errorHandler || parent.errorHandler
    } else {
      parent?.use(this.route, this.router)
      this.action = controllerAction || defaultAction
      this.errorHandler = errorHandler || defaultErrorHandler
    }
  }

  use<NewCTX extends Obj = Empty>(_router: ExpressRouter): void
  use<NewCTX extends Obj = Empty>(_routeName: string): NanaRouter<NewCTX, _CTX>
  use<NewCTX extends Obj = Empty>(_routeName: string, _router: ExpressRouter): void
  use<NewCTX extends Obj = Empty>(_routeName: string, _router: NanaRouter<NewCTX, _CTX>): void
  use<_, ThisCTX extends Partial<NewCTX> = NewCTX>(_middleware: NanaMiddleware<ThisCTX, _ParentCTX>): void
  use<NewCTX extends Obj = Empty, ThisCTX extends Partial<_CTX> & BaseCTX = _CTX & BaseCTX>(...args: any[]) {
    let routeName: string
    let rest: any[]
    let toMount: NanaRouter<NewCTX, _CTX> | ExpressRouter | NanaMiddleware<ThisCTX, _ParentCTX> | undefined
    if (typeof args[0] === 'string') {
      ;[routeName, toMount, ...rest] = args
    } else {
      ;[toMount, ...rest] = args
      routeName = '/'
    }
    if (toMount instanceof NanaRouter) {
      const subRouter = toMount
      this.router.use(routeName, toMount.router)
      this.subRouters[routeName] = toMount
      subRouter.action = combineActions(
        this.action,
        subRouter.action,
      )
      subRouter.errorHandler = subRouter.errorHandler || this.errorHandler
    } else if (toMount instanceof ExpressRouter) {
      const expressRouter = toMount as ExpressRouter
      expressRouter.use(async(req, res, next) => {
        try {
          if (!req.ctx) req.ctx = {}
          await next()
        } catch(err) {
          await this.errorHandler(err, { ...req.ctx as _CTX, req, res })
        }
      })
      this.router.use(routeName, expressRouter)
      this.subRouters[routeName] = expressRouter
      return toMount
    } else if (toMount instanceof NanaMiddleware) {
      const middleware = toMount as NanaMiddleware<ThisCTX, _ParentCTX>
      this.router.use(middleware.handler)
    } else {
      const router = new NanaRouter<NewCTX, _CTX>(routeName, this)
      this.router.use(routeName, router.router)
      this.subRouters[routeName] = router
      return router
    }
  }

  private _createController<NewCTX extends Obj = Empty>(
    method: METHOD,
    ...args: ControllerArgs<NewCTX & _CTX>
  ) { return new NanaController<NewCTX & _CTX>(this, method, ...args) }

  get<NewCTX extends Obj = Empty>(...args: ControllerArgs<NewCTX & _CTX>) {
    return this._createController<NewCTX>(METHOD.GET, ...args)
  }

  post<NewCTX extends Obj = Empty>(...args: ControllerArgs<NewCTX & _CTX>) {
    return this._createController<NewCTX>(METHOD.POST, ...args)
  }

  put<NewCTX extends Obj = Empty>(...args: ControllerArgs<NewCTX & _CTX>) {
    return this._createController<NewCTX>(METHOD.PUT, ...args)
  }

  delete<NewCTX extends Obj = Empty>(...args: ControllerArgs<NewCTX & _CTX>) {
    return this._createController<NewCTX>(METHOD.DELETE, ...args)
  }

  patch<NewCTX extends Obj = Empty>(...args: ControllerArgs<NewCTX & _CTX>) {
    return this._createController<NewCTX>(METHOD.PATCH, ...args)
  }

  options<NewCTX extends Obj = Empty>(...args: ControllerArgs<NewCTX & _CTX>) {
    return this._createController<NewCTX>(METHOD.OPTIONS, ...args)
  }

  head<NewCTX extends Obj = Empty>(...args: ControllerArgs<NewCTX & _CTX>) {
    return this._createController<NewCTX>(METHOD.HEAD, ...args)
  }
}

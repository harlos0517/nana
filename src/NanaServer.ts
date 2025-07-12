
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application as ExpressApp } from 'express'

import { defaultAction, defaultErrorHandler, defaultTransformer } from './defaults'
import { NanaRouter } from './NanaRouter'
import { Empty, Obj } from './types'


export class NanaServer<CTX extends Obj = Empty, Data = any> extends NanaRouter<CTX, Data> {
  public readonly expressApp: ExpressApp
  public readonly port: number
  public onStart?: () => void

  constructor(config?: { port?: number, onStart?: () => void }) {
    super(
      defaultAction,
      defaultTransformer,
      defaultErrorHandler,
    )
    this.port = config?.port || 7777
    this.onStart = config?.onStart
    this.expressApp = express()
    this.expressApp.use((req, _, next) => {
      req.ctx = {}
      next()
    }) // Initialize context
    this.expressApp.use('/', this.expressRouter)
  }

  run() {
    return this.expressApp.listen(this.port, this.onStart)
  }
}

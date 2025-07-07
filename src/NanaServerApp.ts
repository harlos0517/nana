/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application as ExpressApp } from 'express'

import { defaultAction, defaultErrorHandler } from '@/defaults'
import { NanaController } from '@/NanaController'
import { NanaRouter } from '@/NanaRouter'
import { BaseCTX, Obj } from '@/types'

export class NanaServerApp<CTX extends BaseCTX = BaseCTX> extends NanaRouter<CTX> {
  public readonly app: ExpressApp
  public readonly port: number
  public readonly subRouters: Obj<NanaRouter<any, CTX> | NanaController<CTX>> = {}

  constructor(config: { port: number }) {
    super('/')
    this.app = express()
    this.port = config.port
    this.action = defaultAction
    this.errorHandler = defaultErrorHandler
    this.app.use('/', this.router)
  }

  run() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`)
    })
  }
}

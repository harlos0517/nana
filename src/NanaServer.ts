/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application as ExpressApp } from 'express'

import { defaultAction, defaultErrorHandler, defaultTransformer } from '@/defaults'
import { NanaRouter } from '@/NanaRouter'
import { BaseCTX } from '@/types'


export class NanaServer<CTX extends BaseCTX = BaseCTX, Data = any> extends NanaRouter<CTX, Data> {
  public readonly expressApp: ExpressApp
  public readonly port: number

  constructor(config?: { port?: number }) {
    super(
      '/',
      undefined,
      defaultAction,
      defaultTransformer,
      defaultErrorHandler,
    )
    this.port = config?.port || 7777
    this.expressApp = express()
    this.expressApp.use(req => { req.ctx = {} }) // Initialize context
    this.expressApp.use('/', this.expressRouter)
  }

  run() {
    this.expressApp.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`)
    })
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest'
import { expect, vi } from 'vitest'

import { NanaServer } from '@/NanaServer'
import { BaseCTX, METHOD } from '@/types'
import { Request, Response } from 'express'

export const dryRun = (app: NanaServer) => new Promise<void>(resolve => {
  let server: any = null
  app.expressApp.listen = vi.fn(app.expressApp.listen as any)
  const oldOnStart = app.onStart
  app.onStart = vi.fn(() => {
    oldOnStart?.()
    server?.close()
    resolve()
  })
  server = app.run()
})

export const testNana = async(
  app: NanaServer<any>,
  method: METHOD,
  route: string,
  status: number,
  data: any,
) => {
  const response = await request(app.expressApp)[method](route).expect(status)
  expect(response.body).toEqual(data)
  return response
}

export const testData = { message: 'Hello World' } as any
export const testCtx =
  { foo: 'bar', req: {} as Request, res: {} as Response } as { foo: string } & BaseCTX
export const testARgs = [testData, testCtx] as const

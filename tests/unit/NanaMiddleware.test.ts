import { describe, expect, it, vi } from 'vitest'
import { testCtx, testData, testNana } from '~/tests/util'

import { defaultErrorHandler } from '@/defaults'
import { NanaError } from '@/NanaError'
import { NanaMiddleware } from '@/NanaMiddleware'
import { NanaServer } from '@/NanaServer'
import { GET } from '@/types'

describe('NanaMiddleware', () => {
  it('should construct', async() => {
    const dummyGetContext = vi.fn()
    const dummyErrorHandler = vi.fn()
    const dummyPostHandler = vi.fn()
    const middleware = new NanaMiddleware(
      dummyGetContext,
      dummyErrorHandler,
      dummyPostHandler,
    )

    expect(middleware.getContext).toBe(dummyGetContext)
    expect(middleware.postHandler).toBe(dummyPostHandler)
    expect(middleware.errorHandler).toBe(dummyErrorHandler)
  })

  it('should construct with no arguments and run', async() => {
    const server = new NanaServer()
    server.use(new NanaMiddleware())
    server.get('/test', () => testData)

    await testNana(server, GET, '/test', 200, testData)
  })

  it('should handle', async() => {
    const dummyPostHandler = vi.fn()
    const server = new NanaServer<{ foo: string }>()
    server.use(new NanaMiddleware(
      () => testCtx,
      undefined,
      dummyPostHandler,
    ))
    server.get('/user', ({ foo }) => ({ user: foo }))

    await testNana(server, GET, '/user', 200, { user: testCtx.foo })
    expect(dummyPostHandler).toBeCalledTimes(1)
  })

  it('should handle error', async() => {
    const dummyErrorHandler = vi.fn(defaultErrorHandler)
    const server = new NanaServer()
    server.use(new NanaMiddleware(
      () => { throw new NanaError(500, 'Test Error') },
      dummyErrorHandler,
    ))
    server.get('/error', () => { throw new Error('Test Error') })

    await testNana(server, GET, '/error', 500, { error: 'Test Error' })
    expect(dummyErrorHandler).toBeCalledTimes(1)
  })
})

import { defaultAction, defaultErrorHandler, defaultTransformer } from '@/defaults'
import { NanaController } from '@/NanaController'
import { NanaError } from '@/NanaError'
import { NanaRouter } from '@/NanaRouter'
import { NanaServer } from '@/NanaServer'
import { GET } from '@/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { testData, testNana } from '~/tests/util'

vi.mock('@/defaults', { spy: true })

describe('NanaController', () => {
  beforeEach(() => {
    vi.mock('@/defaults', { spy: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should construct', async() => {
    const dummyHandler = vi.fn()
    const middleware = new NanaController(dummyHandler)

    expect(middleware.handler).toBe(dummyHandler)
  })

  it('should handle with default functions', async() => {
    const server = new NanaServer()
    const dummyHandler = vi.fn(() => testData)
    const controller = new NanaController(dummyHandler)
    server.get('/test', controller)

    await testNana(server, GET, '/test', 200, testData)
    expect(dummyHandler).toBeCalledTimes(1)
    expect(defaultAction).toBeCalledTimes(1)
    expect(defaultTransformer).toBeCalledTimes(1)
    expect(defaultErrorHandler).toBeCalledTimes(0)
  })

  it('should handle with no functions (typically this should not happen)', async() => {
    const server = new NanaServer()
    const dummyHandler = vi.fn(() => testData)
    const controller = new NanaController(dummyHandler)
    server.expressApp.get('/test', controller._handler)

    await testNana(server, GET, '/test', 200, testData)
    expect(dummyHandler).toBeCalledTimes(1)
    expect(defaultAction).toBeCalledTimes(1)
    expect(defaultTransformer).toBeCalledTimes(1)
    expect(defaultErrorHandler).toBeCalledTimes(0)
  })

  it('should handle with custom functions', async() => {
    const server = new NanaServer()
    const dummyAction = vi.fn(defaultAction)
    const dummyTransformer = vi.fn(data => ({ nested: data }))
    const router = new NanaRouter(
      dummyAction,
      dummyTransformer,
    )
    const dummyHandler = vi.fn(() => testData)
    const controller = new NanaController(dummyHandler)
    router.get('/test', controller)

    server.use('/', router)

    await testNana(server, GET, '/test', 200, { nested: testData })
    expect(dummyHandler).toBeCalledTimes(1)
    expect(dummyAction).toBeCalledTimes(1)
    expect(dummyTransformer).toBeCalledTimes(1)
  })

  it('should handle error', async() => {
    const server = new NanaServer()
    const dummyAction = vi.fn(defaultAction)
    const dummyTransformer = vi.fn(defaultTransformer)
    const dummyErrorHandler = vi.fn(defaultErrorHandler)
    const router = new NanaRouter(
      dummyAction,
      dummyTransformer,
      dummyErrorHandler,
    )
    const dummyHandler = vi.fn(() => { throw new NanaError(500, 'Test Error') })
    const controller = new NanaController(dummyHandler)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.get('/test', controller as any)

    server.use('/', router)

    await testNana(server, GET, '/test', 500, { error: 'Test Error' })
    expect(dummyHandler).toBeCalledTimes(1)
    expect(dummyAction).toBeCalledTimes(0)
    expect(dummyTransformer).toBeCalledTimes(0)
    expect(dummyErrorHandler).toBeCalledTimes(1)
  })

  it('should handle error with no functions (typically this should not happen)', async() => {
    const server = new NanaServer()
    const dummyHandler = vi.fn(() => { throw new NanaError(500, 'Test Error') })
    const controller = new NanaController(dummyHandler)
    server.expressApp.get('/test', controller._handler)

    await testNana(server, GET, '/test', 500, { error: 'Test Error' })
    expect(dummyHandler).toBeCalledTimes(1)
    expect(defaultAction).toBeCalledTimes(0)
    expect(defaultTransformer).toBeCalledTimes(0)
    expect(defaultErrorHandler).toBeCalledTimes(1)
  })
})

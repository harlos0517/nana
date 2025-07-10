import { describe, expect, it, vi } from 'vitest'

import { defaultTransformer } from '@/defaults'
import { NanaMiddleware } from '@/NanaMiddleware'
import { NanaRouter } from '@/NanaRouter'
import { METHOD } from '@/types'

describe('NanaRouter', () => {
  describe('constructor', async() => {
    it('should construct with no arguments', async() => {
      const router = new NanaRouter()

      expect(router.action).toBe(undefined)
      expect(router.transformer).toBe(defaultTransformer)
      expect(router.errorHandler).toBe(undefined)
    })

    it('should construct with specified functions', async() => {
      const dummyAction = vi.fn()
      const dummyTransformer = vi.fn(data => ({ nested: data }))
      const dummyErrorHandler = vi.fn()
      const router = new NanaRouter(dummyAction, dummyTransformer, dummyErrorHandler)

      expect(router.parent).toBe(undefined)
      expect(router.action).toBe(dummyAction)
      expect(router.transformer).toEqual(dummyTransformer)
      expect(router.errorHandler).toBe(dummyErrorHandler)
    })
  })

  describe('use', async() => {
    it('should return a new router when only route name is provided', async() => {
      const parent = new NanaRouter()
      parent.expressRouter.use = vi.fn()
      const child = parent.use('/test')

      expect(child.parent).toBe(parent)
      expect(parent.children['/test']).toBe(child)
      expect(parent.expressRouter.use).toBeCalledWith('/test', child.expressRouter)
    })

    it('should mount a NanaRouter', async() => {
      const parent = new NanaRouter()
      parent.expressRouter.use = vi.fn()
      const child = new NanaRouter()
      parent.use('/test', child)

      expect(child.parent).toBe(parent)
      expect(parent.children['/test']).toBe(child)
      expect(parent.expressRouter.use).toBeCalledWith('/test', child.expressRouter)
    })

    it('should use a middleware', async() => {
      const parent = new NanaRouter()
      parent.expressRouter.use = vi.fn()
      const middleware = new NanaMiddleware()
      parent.use(middleware)

      expect(parent.expressRouter.use).toBeCalledWith(middleware.handler)
    })

    it('should throw error if route is illegal (nested)', async() => {
      const parent = new NanaRouter()
      const child = new NanaRouter()

      expect(() => parent.use('illegal/route', child)).toThrow(Error)
    })

    it('should throw error if route is illegal (illegal character', async() => {
      const parent = new NanaRouter()
      const child = new NanaRouter()

      expect(() => parent.use('ill$%^&', child)).toThrow(Error)
    })

    it('should throw error on route collision', async() => {
      const parent = new NanaRouter()
      const child = new NanaRouter()
      parent.use('test', child)

      expect(() => parent.use('test', child)).toThrow(Error)
    })
  })

  describe('methods', async() => {
    const testMethod = (method: METHOD) => {
      const parent = new NanaRouter()
      parent.expressRouter[method] = vi.fn()
      const controller = parent[method]('/test', vi.fn())

      expect(parent.children['/test']).toBe(controller)
      expect(parent.expressRouter[method]).toBeCalledWith('/test', controller._handler)
    }

    it('get', async() => { testMethod(METHOD.GET) })
    it('post', async() => { testMethod(METHOD.POST) })
    it('put', async() => { testMethod(METHOD.PUT) })
    it('delete', async() => { testMethod(METHOD.DELETE) })
    it('patch', async() => { testMethod(METHOD.PATCH) })
    it('options', async() => { testMethod(METHOD.OPTIONS) })
    it('head', async() => { testMethod(METHOD.HEAD) })
  })
})

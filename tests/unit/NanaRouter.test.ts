import { describe, expect, it, vi } from 'vitest'
import { testARgs as testArgs } from '~/tests/util'

import { NanaRouter } from '@/NanaRouter'
import { defaultAction, defaultErrorHandler, defaultTransformer } from '@/defaults'

describe('NanaRouter', () => {
  describe('constructor', async() => {
    it('should construct with no arguments', async() => {
      const router = new NanaRouter()

      expect(router.route).toBe('/')
      expect(router.action).toBe(defaultAction)
      expect(router.transformer).toBe(defaultTransformer)
      expect(router.errorHandler).toBe(defaultErrorHandler)
    })

    it('should construct with route', async() => {
      const router = new NanaRouter('/test')

      expect(router.route).toBe('/test')
      expect(router.action).toBe(defaultAction)
      expect(router.transformer).toBe(defaultTransformer)
      expect(router.errorHandler).toBe(defaultErrorHandler)
    })

    it('should construct with parent router', async() => {
      const parent = new NanaRouter('/parent', undefined, vi.fn())
      parent.expressRouter.use = vi.fn()
      const router = new NanaRouter('/child', parent)

      expect(parent.expressRouter.use).toBeCalledWith('/child', router.expressRouter)
      expect(parent.children['/child']).toBe(router)

      expect(router.route).toBe('/child')
      expect(router.parent).toBe(parent)
      expect(await router.action(...testArgs)).toBe(parent.action(...testArgs))
      expect(await router.transformer(...testArgs)).toBe(testArgs[0])
      expect(router.errorHandler).toBe(parent.errorHandler)
    })

    it('should construct with specified functions', async() => {
      const dummyAction = vi.fn()
      const dummyTransformer = vi.fn(data => ({ nested: data }))
      const dummyErrorHandler = vi.fn()
      const router = new NanaRouter(
        '/test', undefined,
        dummyAction, dummyTransformer, dummyErrorHandler,
      )

      expect(router.route).toBe('/test')
      expect(router.parent).toBe(undefined)
      expect(router.action).toBe(dummyAction)
      expect(await router.transformer(...testArgs)).toEqual({ nested: testArgs[0] })
      expect(router.errorHandler).toBe(dummyErrorHandler)
    })

    it('should construct with parent router and specified functions', async() => {
      const parent = new NanaRouter('/parent', undefined, vi.fn())
      parent.expressRouter.use = vi.fn()
      const dummyAction = vi.fn()
      const dummyTransformer = vi.fn(data => ({ nested: data }))
      const dummyErrorHandler = vi.fn()
      const router = new NanaRouter(
        '/child', parent,
        dummyAction, dummyTransformer, dummyErrorHandler,
      )

      expect(parent.expressRouter.use).toBeCalledWith('/child', router.expressRouter)
      expect(parent.children['/child']).toBe(router)

      expect(router.route).toBe('/child')
      expect(router.parent).toBe(parent)
      expect(router.action).toBe(dummyAction)
      expect(await router.transformer(...testArgs)).toEqual({ nested: testArgs[0] })
      expect(router.errorHandler).toBe(dummyErrorHandler)
    })

    it('should throw error if route is illegal (nested)', async() => {
      expect(() => new NanaRouter('illegal/route')).toThrow(Error)
    })

    it('should throw error if route is illegal (illegal character', async() => {
      expect(() => new NanaRouter('ill$%^&')).toThrow(Error)
    })

    it('should throw error on route collision', async() => {
      const parent = new NanaRouter('/parent')
      new NanaRouter('/child', parent)
      expect(() => new NanaRouter('/child', parent)).toThrow(Error)
    })

    it('should throw error on route collision (after new)', async() => {
      const parent = new NanaRouter('/parent')
      new NanaRouter('/child', parent)
      const router = new NanaRouter('/child')
      expect(() => parent.use('/child', router)).toThrow(Error)
    })
  })
})

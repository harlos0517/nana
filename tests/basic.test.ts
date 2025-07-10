import { describe, it } from 'vitest'
import { testNana } from './util'

import { NanaError } from '@/NanaError'
import { NanaMiddleware } from '@/NanaMiddleware'
import { NanaRouter } from '@/NanaRouter'
import { NanaServer } from '@/NanaServer'
import { GET } from '@/types'

describe('Nana Framework Basic Tests', () => {
  it('should handle basic GET request', async() => {
    const server = new NanaServer()
    const router = new NanaRouter()
    router.get('/hello', () => ({ message: 'Hello World' }))
    server.use('/test', router)

    await testNana(server, GET, '/test/hello', 200, { message: 'Hello World' })
  })

  it('should handle middleware context passing', async() => {
    const server = new NanaServer()
    const router = server.use<{ userId: number }>('/api')
    router.use(new NanaMiddleware<{ userId: number }>(() => ({ userId: 123 })))
    router.get('/user', ({ userId }) => {
      return { user: userId || 'no-user' }
    })

    await testNana(server, GET, '/api/user', 200, { user: 123 })
  })

  it('should throw error', async() => {
    const server = new NanaServer()
    server.get('/error', () => { throw new NanaError(500, 'Test Error') })

    await testNana(server, GET, '/error', 500, { error: 'Test Error' })
  })
})

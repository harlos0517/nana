import { describe, it } from 'vitest'
import { testNana } from './util'

import { NanaError } from '@/NanaError'
import { NanaMiddleware } from '@/NanaMiddleware'
import { NanaServer } from '@/NanaServer'
import { GET } from '@/types'

describe('Nana Framework Basic Tests', () => {
  it('should handle basic GET request', async() => {
    const app = new NanaServer({ port: 3000 })
    app.get('/hello', () => ({ message: 'Hello World' }))

    testNana(app, GET, '/hello', 200, { message: 'Hello World' })
  })

  it('should handle middleware context passing', async() => {
    const app = new NanaServer({ port: 3000 })
    const router = app.use<{ userId: number }>('/api')
    router.use(new NanaMiddleware<{ userId: number }>(() => ({ userId: 123 })))
    router.get('/user', ({ userId }) => {
      return { user: userId || 'no-user' }
    })

    testNana(app, GET, '/api/user', 200, { user: 123 })
  })

  it('should throw error', async() => {
    const app = new NanaServer({ port: 3000 })
    app.get('/error', () => { throw new NanaError(500, 'Test Error') })

    testNana(app, GET, '/error', 500, { error: 'Test Error' })
  })
})

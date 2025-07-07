import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { NanaMiddleware } from '@/NanaMiddleware'
import { NanaServerApp } from '@/NanaServerApp'

describe('Nana Framework Basic Tests', () => {
  it('should handle basic GET request', async() => {
    const app = new NanaServerApp({ port: 3000 })

    app.get('/hello', () => ({ message: 'Hello World' }))
    const response = await request(app.app)
      .get('/hello')
      .expect(200)

    expect(response.body).toEqual({ message: 'Hello World' })
  })

  it('should handle middleware context passing', async() => {
    const app = new NanaServerApp({ port: 3000 })

    const router = app.use<{ userId: number }>('/api')
    router.use(new NanaMiddleware<{ userId: number }>(() => ({ userId: 123 })))

    router.get('/user', ({ userId }) => {
      return { user: userId || 'no-user' }
    })

    const response = await request(app.app)
      .get('/api/user')
      .expect(200)

    expect(response.body).toEqual({ user: 123 })
  })
})

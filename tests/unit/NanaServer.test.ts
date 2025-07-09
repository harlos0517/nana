import { describe, expect, it } from 'vitest'
import { dryRun } from '~/tests/util'

import { NanaServer } from '@/NanaServer'

describe('NanaServerApp', () => {
  it('should use default port', async() => {
    const app = new NanaServer()
    dryRun(app)
    expect(app.expressApp.listen).toBeCalledWith(7777, expect.any(Function))
  })

  it('should use specified port', async() => {
    const app = new NanaServer({ port: 8888 })
    dryRun(app)
    expect(app.expressApp.listen).toBeCalledWith(8888, expect.any(Function))
  })
})


import { NanaError } from '@/NanaError'
import { BaseCTX, NanaAction, NanaErrorHandler, NanaTransformer } from './types'

const DEV = process.env.NODE_ENV !== 'production'

export const defaultAction: NanaAction<BaseCTX> =
  ({ data, res }) => {
    res.status(200).send(data)
  }

export const defaultTransformer: NanaTransformer<BaseCTX> = data => data

export const defaultErrorHandler: NanaErrorHandler<BaseCTX> =
  (err, { res }, errorLogger = console.error) => {
    errorLogger(err)
    try {
      const status = err instanceof NanaError ? err.status : 500
      const htmlMsg = DEV
        ? err instanceof Error ? err.message : String(err)
        : err instanceof NanaError ? err.message : 'Unknown Error'
      res.status(status).send({ error: htmlMsg })
    } catch(err) {
      errorLogger(err)
    }
  }

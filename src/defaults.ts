
import { NanaError } from '@/NanaError'
import { NanaAction, NanaErrorHandler, NanaTransformer, Obj } from './types'

const DEV = process.env.NODE_ENV !== 'production'

export const defaultAction: NanaAction<Obj> =
  (data, { res }) => { res.status(200).send(data) }

export const defaultTransformer: NanaTransformer<Obj> = data => data

export const defaultErrorHandler: NanaErrorHandler<Obj> =
  (err, { res }, errorLogger = console.error) => {
    errorLogger(err)
    try {
      const status = err instanceof NanaError ? err.status : 500
      const htmlMsg = DEV
        ? (err instanceof Error ? err.message : String(err))
        : (err instanceof NanaError ? err.message : 'Unknown Error')
      res.status(status).send({ error: htmlMsg })
    } catch(err) {
      errorLogger(err)
    }
  }

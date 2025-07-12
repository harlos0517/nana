/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request, Response } from 'express'
import { CTXArgument, Empty, Obj } from './types'

export const routeChecker = (route: string): string => {
  const invalidRouteNameMessage =
    `Invalid route name "${route}". ` +
    'Allowed characters: alphanumeric, hyphen, dot, underscore, tilde.'
  route = route?.replace(/(^\/+|\/+$)/g, '') || '' // remove leading and trailing slashes
  if (RegExp(/[^a-zA-Z0-9-._~]/).test(route)) throw new Error(invalidRouteNameMessage)
  return '/' + route
}

export const createContextArgument = <CTX extends Obj = Empty>(
  ctx: CTX,
  req: Request,
  res: Response,
): CTXArgument<CTX> => {
  return {
    ...ctx,
    ...req.query as Obj<string | string[]>,
    ...req.params as Obj<string>,
    body: req.body as any,
    req,
    res,
  }
}

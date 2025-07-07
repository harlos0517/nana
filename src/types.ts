/* eslint-disable @stylistic/max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'

export type Promisable<Result> = Result | Promise<Result>
export type Obj<Result = any> = Record<string, Result>
export type Dict = Obj<string>
export type Empty = Obj<never>
export type BaseCTX = {
  req: Request
  res: Response
}

export enum METHOD {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch',
  OPTIONS = 'options',
  HEAD = 'head',
}
export type Method = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'
export const GET = METHOD.GET
export const POST = METHOD.POST
export const PUT = METHOD.PUT
export const DELETE = METHOD.DELETE
export const PATCH = METHOD.PATCH
export const OPTIONS = METHOD.OPTIONS
export const HEAD = METHOD.HEAD

export type NanaMiddlewareCreateContext<NewCTX extends Obj = Empty, _ParentCTX extends BaseCTX = BaseCTX> = (
  _ctx: _ParentCTX & { req: Request, res: Response }
) => Promisable<NewCTX>

export type NanaPostHandler<CTX extends BaseCTX = BaseCTX> = (
  _ctx: CTX & { req: Request, res: Response }
) => Promisable<void>

export type NanaControllerHandler<CTX extends BaseCTX = BaseCTX, Data = any> = (
  _ctx: CTX & { req: Request, res: Response }
) => Promisable<Data>

export type NanaAction<CTX extends BaseCTX = BaseCTX, Data = any> = (
  _ctx: CTX & { req: Request, res: Response, data: Data }
) => Promisable<void>

export type NanaErrorHandler<CTX extends BaseCTX = BaseCTX> = (
  _err: unknown,
  _ctx: CTX & { req: Request, res: Response },
  _errorLogger?: (_err: unknown) => void
) => Promisable<void>

export type ControllerArgs<CTX extends BaseCTX = BaseCTX> =
  [route: string, handler: NanaControllerHandler<CTX>]

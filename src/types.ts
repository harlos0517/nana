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

export type NanaMiddlewareCreateContext<NewCTX extends Obj = Empty, _ParentCTX extends Obj = Empty> = (
  _ctx: _ParentCTX & BaseCTX
) => Promisable<NewCTX>

export type NanaPostHandler<CTX extends Obj = Empty> = (
  _ctx: CTX & BaseCTX
) => Promisable<void>

export type NanaControllerHandler<CTX extends Obj = Empty, Data = any> = (
  _ctx: CTX & BaseCTX
) => Promisable<Data>

export type NanaAction<CTX extends Obj = Empty, Data = any> = (
  data: Data,
  _ctx: CTX & BaseCTX
) => Promisable<void>

export type NanaTransformer<CTX extends Obj = Empty, SourceData = any, TargetData = any> = (
  data: SourceData,
  _ctx: CTX & { req: Request, res: Response }
) => Promisable<TargetData>

export type NanaErrorHandler<CTX extends Obj = Empty> = (
  _err: unknown,
  _ctx: CTX & BaseCTX,
  _errorLogger?: (_err: unknown) => void
) => Promisable<void>

export type ControllerArgs<CTX extends Obj = Empty, Data = any> =
  [route: string, handler: NanaControllerHandler<CTX, Data>]

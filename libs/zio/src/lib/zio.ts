import {
  ReaderTaskEither,
  readerTaskEither,
  readerTaskEitherSeq
} from 'fp-ts/lib/ReaderTaskEither'
import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import * as TE from 'fp-ts/lib/TaskEither'
import { sequenceT } from 'fp-ts/lib/Apply'
import { identity } from 'fp-ts/lib/function'

export type ZIO<R, E, A> = ReaderTaskEither<R, E, A>

export type UIO<A> = ZIO<void, never, A>

export type URIO<R, A> = ZIO<R, never, A>

export type Task<A> = ZIO<void, Throwable, A>

export type RIO<R, A> = ZIO<R, Throwable, A>

export type IO<E, A> = ZIO<void, E, A>

export type Throwable = unknown

const succeed: <R = void, E = never, A = never>(a: A) => ZIO<R, E, A> =
  RTE.right

const fail: <R = void, E = never, A = never>(e: E) => ZIO<R, E, A> = RTE.left

function fromTry<R = void, A = never>(f: () => A): ZIO<R, Throwable, A> {
  return () =>
    TE.tryCatch(
      () =>
        new Promise((resolve, reject) => {
          try {
            resolve(f())
          } catch (e) {
            reject(e)
          }
        }),
      identity
    )
}

const zip = sequenceT(readerTaskEitherSeq)

const zipPar = sequenceT(readerTaskEither)

function catchAll<R, E, A>(
  onError: (e: Throwable) => ZIO<R, E, A>
): (ma: ZIO<R, E, A>) => ZIO<R, E, A> {
  return ma => r => {
    try {
      return ma(r)
    } catch (e) {
      return onError(e)(r)
    }
  }
}

function catchSome<R, E, A>(
  onError: (e: Throwable) => ZIO<R, E, A> | undefined
): (ma: ZIO<R, E, A>) => ZIO<R, E, A> {
  return ma => r => {
    try {
      return ma(r)
    } catch (e) {
      const alt = onError(e)
      if (alt) {
        return alt(r)
      } else {
        throw e
      }
    }
  }
}

const access: <R, A>(f: (r: R) => A) => ZIO<R, never, A> = f => r =>
  RTE.right(f(r))(r)

const accessM: <R, E, A>(
  f: (r: R) => ZIO<void, E, A>
) => ZIO<R, E, A> = f => r => f(r)()

const provide: <R, E, A>(
  r: R
) => (ma: ZIO<R, E, A>) => ZIO<void, E, A> = r => ma => () => ma(r)

export const ZIO = {
  ...RTE,
  succeed,
  fail,
  fromTry,
  zip,
  zipPar,
  catchAll,
  catchSome,
  access,
  accessM,
  provide
}

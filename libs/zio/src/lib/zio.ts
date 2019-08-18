import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import * as TE from 'fp-ts/lib/TaskEither'
import {
  ReaderTaskEither,
  readerTaskEither,
  readerTaskEitherSeq
} from 'fp-ts/lib/ReaderTaskEither'
import { Either } from 'fp-ts/lib/Either'
import { identity } from 'fp-ts/lib/function'
import { sequenceT } from 'fp-ts/lib/Apply'
import { tryCatch } from 'fp-ts/lib/TaskEither'

export type ZIO<R, E, A> = ReaderTaskEither<R, E, A>

export type UIO<A> = ZIO<void, never, A>

export type URIO<R, A> = ZIO<R, never, A>

export type Task<A> = ZIO<void, Throwable, A>

export type RIO<R, A> = ZIO<R, Throwable, A>

export type IO<E, A> = ZIO<void, E, A>

export type Throwable = unknown

const zio = readerTaskEither

const zioSeq = readerTaskEitherSeq

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

function fromTask<R = void, A = never>(
  f: () => Promise<A>
): ZIO<R, Throwable, A> {
  return RTE.fromTaskEither(tryCatch(f, identity))
}

const zip = sequenceT(zio)

const zipPar = sequenceT(zioSeq)

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

function foldM<R, E, A, B>(
  onError: (e: E) => ZIO<R, never, B>,
  onSuccess: (a: A) => ZIO<R, never, B>
): (ma: ZIO<R, E, A>) => ZIO<R, never, B> {
  return RTE.fold(onError, onSuccess)
}

function fold<R, E, A, B>(
  onError: (e: E) => B,
  onSuccess: (a: A) => B
): (ma: ZIO<R, E, A>) => ZIO<R, E, B> {
  return foldM(e => succeed(onError(e)), a => succeed(onSuccess(a)))
}

function getOrElseM<R, E, A>(
  onError: (e: E) => ZIO<R, never, A>
): (ma: ZIO<R, E, A>) => ZIO<R, never, A> {
  return foldM(onError, succeed)
}

const getOrElse: <R, E, A>(
  onError: (e: E) => A
) => (ma: ZIO<R, E, A>) => ZIO<R, E, A> = onError =>
  getOrElseM(e => succeed(onError(e)))

function run<R>(r: R): <E, A>(ma: ZIO<R, E, A>) => Promise<Either<E, A>> {
  return ma => ma(r)()
}

export const ZIO = {
  succeed,
  fail,
  succeedLazy: RTE.rightIO,
  failLazy: RTE.leftIO,
  succeedTask: RTE.rightTask,
  failTask: RTE.leftTask,
  fromTask,
  fromEither: RTE.fromEither,
  fromPredicate: RTE.fromPredicate,
  fromTaskEither: RTE.fromTaskEither,
  fromTry,
  zip,
  zipPar,
  map: RTE.map,
  flatMap: RTE.chain,
  mapLeft: RTE.mapLeft,
  orElse: RTE.orElse,
  foldM,
  fold,
  getOrElseM,
  getOrElse,
  run,
  catchAll,
  catchSome,
  access,
  accessM,
  provide
}

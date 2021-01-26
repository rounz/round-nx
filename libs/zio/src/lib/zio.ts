import * as O from 'fp-ts/lib/Option'
import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import * as TE from 'fp-ts/lib/TaskEither'
import {
  ReaderTaskEither,
  readerTaskEither,
  readerTaskEitherSeq
} from 'fp-ts/lib/ReaderTaskEither'
import { constVoid, identity } from 'fp-ts/lib/function'
import { Either } from 'fp-ts/lib/Either'
import { Option } from 'fp-ts/lib/Option'
import { ZIORef } from './ref'
import { array } from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/pipeable'
import { sequenceT } from 'fp-ts/lib/Apply'
import { tryCatch } from 'fp-ts/lib/TaskEither'

export type ZIO<R, E, A> = ReaderTaskEither<R, E, A>

export type UIO<A> = ZIO<AnyEnv, never, A>

export type URIO<R, A> = ZIO<R, never, A>

export type Task<A> = ZIO<AnyEnv, Throwable, A>

export type RIO<R, A> = ZIO<R, Throwable, A>

export type IO<E, A> = ZIO<AnyEnv, E, A>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyEnv = any

export type Throwable = unknown

const zio = readerTaskEither

const zioSeq = readerTaskEitherSeq

const succeed: <R = AnyEnv, E = never, A = never>(a: A) => ZIO<R, E, A> =
  RTE.right

const fail: <R = AnyEnv, E = never, A = never>(e: E) => ZIO<R, E, A> = RTE.left

function fromTry<R = AnyEnv, A = never>(f: () => A): ZIO<R, Throwable, A> {
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

function fromTask<R = AnyEnv, A = never>(
  f: (r: R) => Promise<A>
): ZIO<R, Throwable, A> {
  return r => RTE.fromTaskEither(tryCatch(() => f(r), identity))(r)
}

const sequence = array.sequence(zioSeq)

const zip = sequenceT(zioSeq)

const sequencePar = array.sequence(zio)

const zipPar = sequenceT(zio)

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

const access: <R>() => <A>(f: (r: R) => A) => ZIO<R, never, A> = () => f => r =>
  RTE.right(f(r))(r)

const accessM: <R>() => <E, A>(
  f: (r: R) => ZIO<R, E, A>
) => ZIO<R, E, A> = () => f => r => f(r)(r)

const provide: <R, E, A>(
  r: R
) => (ma: ZIO<R, E, A>) => ZIO<AnyEnv, E, A> = r => ma => () => ma(r)

const run: <R>(
  r: R
) => <E, A>(ma: ZIO<R, E, A>) => Promise<Either<E, A>> = r => ma =>
  RTE.run(ma, r)

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
) => (ma: ZIO<R, E, A>) => ZIO<R, never, A> = onError =>
  getOrElseM(e => succeed(onError(e)))

const constVoidZ: <R, E, A>(ma: ZIO<R, E, A>) => ZIO<R, E, void> = RTE.map(
  constVoid
)

const environment = <R>() => access<R>()(r => r)

const tapM: <R, E, A>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  f: (a: A) => ZIO<R, E, any>
) => (ma: ZIO<R, E, A>) => ZIO<R, E, A> = f => ma =>
  pipe(
    ma,
    RTE.chain(a =>
      pipe(
        f(a),
        RTE.map(() => a)
      )
    )
  )

const tap: <R, E, A>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  f: (a: A) => any
) => (ma: ZIO<R, E, A>) => ZIO<R, E, A> = f => ma =>
  pipe(
    ma,
    RTE.map(a => {
      f(a)
      return a
    })
  )

const cached: <R, E, A>(ma: ZIO<R, E, A>) => ZIO<R, E, A> = <R, E, A>(
  ma: ZIO<R, E, A>
) => {
  const cache = ZIORef(O.none as Option<A>)
  return pipe(
    cache.get,
    RTE.chain(
      O.fold(
        () =>
          pipe(
            ma,
            tapM((_): ZIO<R, E, void> => cache.set(O.some(_)))
          ),
        succeed
      )
    )
  )
}

export const ZIO = {
  succeed,
  fail,
  succeedLazy: RTE.rightIO,
  failLazy: RTE.leftIO,
  succeedTask: RTE.rightTask,
  failTask: RTE.leftTask,
  constVoid: constVoidZ,
  fromTask,
  fromOption: RTE.fromOption,
  fromEither: RTE.fromEither,
  fromPredicate: RTE.fromPredicate,
  fromTaskEither: RTE.fromTaskEither,
  fromTry,
  sequence,
  sequencePar,
  zip,
  zipPar,
  map: RTE.map,
  flatMap: RTE.chain,
  mapError: RTE.mapLeft,
  orElse: RTE.orElse,
  foldM,
  fold,
  getOrElseM,
  getOrElse,
  catchAll,
  catchSome,
  access,
  accessM,
  provide,
  environment,
  cached,
  tap,
  tapM,
  run
}

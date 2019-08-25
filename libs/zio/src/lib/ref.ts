import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import { BehaviorSubject, Observable } from 'rxjs'
import { ReaderTaskEither } from 'fp-ts/lib/ReaderTaskEither'
import { pipe } from 'fp-ts/lib/pipeable'

export interface ZIORef<A> {
  getObservable: ReaderTaskEither<any, never, Observable<A>>
  get: ReaderTaskEither<any, never, A>
  set: (a: A) => ReaderTaskEither<any, never, void>
  update: (f: (a: A) => A) => ReaderTaskEither<any, never, void>
}

export function ZIORef<A>(initial: A): ZIORef<A> {
  let value = initial

  const subject = new BehaviorSubject(value)
  const getObservable = RTE.rightIO(() => subject.asObservable())

  const get: ReaderTaskEither<any, never, A> = RTE.rightIO(() => value)

  const set: (a: A) => ReaderTaskEither<any, never, void> =
    a => RTE.rightIO(() => {
      value = a
      subject.next(a)
    })

  const update: (f: (a: A) => A) => ReaderTaskEither<any, never, void> =
    f => pipe(
      RTE.rightIO(() => f(value)),
      RTE.chain(set)
    )

  return { get, set, update, getObservable }
}

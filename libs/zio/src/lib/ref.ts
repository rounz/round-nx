import { Applicative, Applicative1, Applicative3 } from 'fp-ts/lib/Applicative'
import { HKT, Kind, Kind3, URIS, URIS3 } from 'fp-ts/lib/HKT'
import { readerTaskEither } from 'fp-ts/lib/ReaderTaskEither'

interface Ref3<F extends URIS3, R, E, A> {
  get: Kind3<F, R, E, A>
  set: (a: A) => Kind3<F, R, E, void>
  update: (f: (a: A) => A) => Kind3<F, R, E, void>
}

interface Ref1<F extends URIS, A> {
  get: Kind<F, A>
  set: (a: A) => Kind<F, void>
  update: (f: (a: A) => A) => Kind<F, void>
}

interface Ref<F, A> {
  get: HKT<F, A>
  set: (a: A) => HKT<F, void>
  update: (f: (a: A) => A) => HKT<F, void>
}

export function make<F extends URIS3>(
  F: Applicative3<F>
): <R, E, A>(value: A) => Ref3<F, R, E, A>
export function make<F extends URIS>(
  F: Applicative1<F>
): <A>(value: A) => Ref1<F, A>
export function make<F>(F: Applicative<F>): <A>(value: A) => Ref<F, A>
export function make<F>(F: Applicative<F>): <A>(value: A) => Ref<F, A> {
  return <A>(initial: A) => {
    let value = initial

    const unit = F.of(void 0)
    const fromIO = <B>(f: () => B) => F.map(unit, f)

    const get = fromIO(() => value)

    const set = (a: A) =>
      fromIO(() => {
        value = a
      })

    const update = (f: (a: A) => A) =>
      fromIO(() => {
        value = f(value)
      })

    return {
      get,
      set,
      update
    }
  }
}

export const makeZIORef = <R>() => <A>(value: A) =>
  make(readerTaskEither)<R, never, A>(value)

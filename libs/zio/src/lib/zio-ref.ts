import { Observable, ReplaySubject } from 'rxjs'
import { UIO, ZIO } from './zio'

export interface ZIORef<A> {
  get: UIO<A>
  set: (a: A) => UIO<A>
  modify: (f: (a: A) => A) => UIO<A>
  getObservable: Observable<A>
}

function make<A>(value: A): ZIORef<A> {
  let val = value

  const subject: ReplaySubject<A> = new ReplaySubject<A>(1)
  const update = (_: A): A => {
    val = _
    subject.next(val)
    return val
  }

  const get: UIO<A> = ZIO.succeedLazy(() => val)

  const set: (a: A) => UIO<A> = a => ZIO.succeedLazy(() => update(a))

  const modify: (f: (a: A) => A) => UIO<A> = f =>
    ZIO.succeedLazy(() => update(f(val)))

  return {
    get,
    set,
    modify,
    getObservable: subject.asObservable()
  }
}

export const ZIORef = {
  make,
  newZIORef: <A>(a: A): UIO<ZIORef<A>> => ZIO.succeedLazy(() => ZIORef.make(a))
}

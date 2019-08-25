import * as R from 'rxjs/operators'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { ZIO, ZIORef } from '@round/zio'
import { pipe } from 'fp-ts/lib/pipeable'

export type SelectUseState<S> = <A>(
  f: (s: S) => A
) => [A, Dispatch<SetStateAction<A>>]

const useStateRef = <R, S>(
  stateRef: ZIO<R, never, ZIORef<S>>
): ZIO<R, never, SelectUseState<S>> =>
  pipe(
    stateRef,
    ZIO.flatMap(ref => ZIO.sequencePar(ref.get, ref.getObservable)),
    ZIO.map(([initial, stateChange]) => f => {
      const [state, setState] = useState(f(initial))

      useEffect(() => {
        const sub = pipe(
          stateChange,
          R.map(f),
          R.distinctUntilChanged()
        ).subscribe(setState)

        return () => sub.unsubscribe()
      }, [])

      return [state, setState]
    })
  )

interface ForComponent<R, S> {
  environment: R
  selectState: SelectUseState<S>
}

const forComponent = <R, S>(
  stateRef: ZIO<R, never, ZIORef<S>>
): (<A>(f: (fc: ForComponent<R, S>) => A) => ZIO<R, never, A>) => f =>
  pipe(
    ZIO.sequencePar(ZIO.environment<R>(), useStateRef(stateRef)),
    ZIO.map(([environment, selectState]) =>
      f({
        environment,
        selectState
      })
    )
  )

export const ZIOReact = {
  forComponent
}

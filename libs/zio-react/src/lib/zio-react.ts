import * as R from 'rxjs/operators'
import { ZIO, ZIORef } from '@round/zio'
import { useEffect, useState } from 'react'
import { pipe } from 'fp-ts/lib/pipeable'

export type SelectState<S> = <A>(select: (s: S) => A) => A

// bind environment state to component state for rendering
const bindState = <R, S>(
  stateRef: ZIO<R, never, ZIORef<S>>
): ZIO<R, never, SelectState<S>> =>
  pipe(
    stateRef,
    ZIO.flatMap(ref => ZIO.zip(ref.get, ref.getObservable)),
    ZIO.map(([initial, stateChange]) => select => {
      const [state, setState] = useState(select(initial))

      useEffect(() => {
        const sub = pipe(
          stateChange,
          R.map(select),
          R.distinctUntilChanged()
        ).subscribe(setState)

        return () => sub.unsubscribe()
      }, [])

      return state
    })
  )

interface ForComponent<R, S> {
  environment: R
  selectState: SelectState<S>
}

// accessing helper for creating component
const forComponent = <R, S>(
  stateRef: ZIO<R, never, ZIORef<S>>
): (<A>(f: (fc: ForComponent<R, S>) => A) => ZIO<R, never, A>) => f =>
  pipe(
    ZIO.zip(ZIO.environment<R>(), bindState(stateRef)),
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

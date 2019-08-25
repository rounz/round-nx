import { ZIO, ZIORef } from '@round/zio'
import { LoveLetterzState } from './state'
import { ZIOReact } from '@round/zio-react'
import { pipe } from 'fp-ts/lib/pipeable'

export interface LoveLetterz {
  stateRef: ZIORef<LoveLetterzState>
}

const stateRef = pipe(ZIO.access<LoveLetterz>()(_ => _.stateRef))

export type LoveLetterzIO<E, A> = ZIO<LoveLetterz, E, A>

export const LoveLetterz = {
  stateRef,
  getState: pipe(
    stateRef,
    ZIO.flatMap(ref => ref.get)
  ),
  setState: (f: (s: LoveLetterzState) => LoveLetterzState) =>
    pipe(
      stateRef,
      ZIO.flatMap(ref => ref.update(f))
    ),
  forComponent: ZIOReact.forComponent(stateRef)
}

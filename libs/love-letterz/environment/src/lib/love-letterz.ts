import { ZIO, ZIORef } from '@round/zio'
import { LoveLetterzState } from './state'
import { ZIOReact } from '@round/zio-react'
import { pipe } from 'fp-ts/lib/pipeable'

export interface LoveLetterz {
  stateRef: ZIORef<LoveLetterzState>
}

export type LoveLetterzIO<E, A> = ZIO<LoveLetterz, E, A>

const stateRef = ZIO.access<LoveLetterz>()(_ => _.stateRef)

const getState = pipe(
  stateRef,
  ZIO.flatMap(ref => ref.get)
)

const setState = (f: (s: LoveLetterzState) => LoveLetterzState) =>
  pipe(
    stateRef,
    ZIO.flatMap(ref => ref.update(f))
  )

const forComponent = ZIOReact.forComponent(stateRef)

export const LoveLetterz = {
  stateRef,
  getState,
  setState,
  forComponent
}

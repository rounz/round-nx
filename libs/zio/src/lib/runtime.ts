import { Platform } from './platform'
import { ZIO } from './zio'
import { constVoid } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'

export interface Runtime<R> {
  environment: R
  platform: Platform
  unsafeRun: <E, A>(zio: ZIO<R, E, A>) => Promise<void>
}

function create<R>(r: R, platform: Platform): Runtime<R> {
  return {
    environment: r,
    platform,
    unsafeRun: zio =>
      pipe(
        zio,
        ZIO.fold(e => {
          throw e
        }, platform.bootstrap)
      )(r)().then(constVoid)
  }
}

export const Runtime = {
  create
}

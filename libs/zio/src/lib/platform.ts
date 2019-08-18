import { constVoid } from 'fp-ts/lib/function'

export interface Platform {
  bootstrap: (a: unknown) => void
}

export const PlatformVoid: Platform = {
  bootstrap: constVoid
}

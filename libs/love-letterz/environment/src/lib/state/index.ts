import { AuthState } from './auth-state'

export type LoveLetterzState = AuthState

export const LoveLetterzState = {
  init: (): LoveLetterzState => ({
    ...AuthState.init()
  })
}

export * from './auth-state'

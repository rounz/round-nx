import { Lens } from 'monocle-ts'

const key = 'auth'

export interface AuthState {
  [key]: {
    isAuthenticated: boolean
  }
}

export const AuthState = {
  init: (): AuthState => ({
    [key]: {
      isAuthenticated: false
    }
  }),
  lens: {
    isAuthenticated: Lens.fromPath<AuthState>()([key, 'isAuthenticated'])
  }
}

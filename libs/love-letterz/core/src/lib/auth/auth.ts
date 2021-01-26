import { AuthState, LoveLetterz } from '@round/love-letterz/environment'
import { pipe } from 'fp-ts/lib/pipeable'

export const authenticate = pipe(
  AuthState.lens.isAuthenticated.set(true),
  LoveLetterz.setState
)

export const signOut = pipe(
  AuthState.lens.isAuthenticated.set(false),
  LoveLetterz.setState
)

export interface AuthState {
  auth: {
    isAuthenticated: boolean
  }
}

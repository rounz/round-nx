import './app.scss'

import {
  BrowserRouter,
  BrowserRouterProps,
  Link,
  Redirect,
  Route,
  RouteComponentProps,
  RouteProps,
  withRouter
} from 'react-router-dom'
import React, { useState } from 'react'
import { LoveLetterz, AuthState } from '@round/love-letterz/environment'
import { ZIO } from '@round/zio'
import { pipe } from 'fp-ts/lib/pipeable'
import { Auth } from '@round/love-letterz/core'

const AuthButton = LoveLetterz.forComponent(({ environment, selectState }) =>
  withRouter(({ history }) => {
    const [isAuthenticated, setState] = selectState(
      AuthState.lens.isAuthenticated.get
    )

    return isAuthenticated ? (
      <p>
        Welcome!{' '}
        <button
          onClick={() =>
            pipe(
              Auth.signOut,
              ZIO.tap(() => history.push('/')),
              ZIO.run(environment)
            )
          }
        >
          Sign out
        </button>
      </p>
    ) : (
      <p>You are not logged in.</p>
    )
  })
)

const PrivateRoute = LoveLetterz.forComponent(
  ({ selectState }): React.FC<RouteProps> => ({
    component: Component,
    ...rest
  }) => {
    const [isAuthenticated, setState] = selectState(
      AuthState.lens.isAuthenticated.get
    )

    return Component ? (
      <Route
        {...rest}
        render={(props: RouteComponentProps<{}>) =>
          isAuthenticated ? (
            <Component {...props} />
          ) : (
            <Redirect
              to={{
                pathname: '/login',
                state: { from: props.location }
              }}
            />
          )
        }
      />
    ) : null
  }
)

function Public() {
  return <h3>Public</h3>
}

function Protected() {
  return <h3>Protected</h3>
}

const Login = LoveLetterz.forComponent(
  ({ environment }): React.FC<RouteComponentProps> => props => {
    const [state, setState] = useState({ redirectToReferrer: false })

    const login = () =>
      pipe(
        Auth.authenticate,
        ZIO.tap(() => {
          setState({ redirectToReferrer: true })
        }),
        ZIO.run(environment)
      )

    const { from } = props.location.state || { from: { pathname: '/' } }
    const { redirectToReferrer } = state

    if (redirectToReferrer) return <Redirect to={from} />

    return (
      <div>
        <p>You must log in to view the page at {from.pathname}</p>
        <button onClick={login}>Log in</button>
      </div>
    )
  }
)

export const LoveLetterzApp = pipe(
  ZIO.sequencePar(AuthButton, Login, PrivateRoute),
  ZIO.map(
    ([AuthButton, Login, PrivateRoute]): React.FC<BrowserRouterProps> => () => {
      return (
        <BrowserRouter>
          <div>
            <AuthButton />
            <ul>
              <li>
                <Link to="/public">Public Page</Link>
              </li>
              <li>
                <Link to="/protected">Protected Page</Link>
              </li>
            </ul>
            <Route path="/public" component={Public} />
            <Route path="/login" component={Login} />
            <PrivateRoute path="/protected" component={Protected} />
          </div>
        </BrowserRouter>
      )
    }
  )
)

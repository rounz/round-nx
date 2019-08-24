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
import { Task, ZIO } from '@round/zio'

const fakeAuth = {
  isAuthenticated: false,
  authenticate(cb: () => unknown) {
    this.isAuthenticated = true
    setTimeout(cb, 100) // fake async
  },
  signout(cb: () => unknown) {
    this.isAuthenticated = false
    setTimeout(cb, 100)
  }
}

const AuthButton = withRouter(({ history }) =>
  fakeAuth.isAuthenticated ? (
    <p>
      Welcome!{' '}
      <button
        onClick={() => {
          fakeAuth.signout(() => history.push('/'))
        }}
      >
        Sign out
      </button>
    </p>
  ) : (
    <p>You are not logged in.</p>
  )
)

const PrivateRoute: React.FC<RouteProps> = ({
  component: Component,
  ...rest
}) => {
  return Component ? (
    <Route
      {...rest}
      render={(props: RouteComponentProps<{}>) =>
        fakeAuth.isAuthenticated ? (
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

function Public() {
  return <h3>Public</h3>
}

function Protected() {
  return <h3>Protected</h3>
}

const Login: React.FC<RouteComponentProps> = props => {
  const [state, setState] = useState({ redirectToReferrer: false })
  const login = () => {
    fakeAuth.authenticate(() => {
      setState({ redirectToReferrer: true })
    })
  }

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

export const App: React.FC<BrowserRouterProps> = () => {
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

const AppZ: Task<React.FC<BrowserRouterProps>> = ZIO.succeed(App)

export default AppZ

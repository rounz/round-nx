import { Platform, Runtime } from '@round/zio'
import AppZ from './app/app'
import React from 'react'
import ReactDOM from 'react-dom'

const PlatformReact: Platform = {
  bootstrap: (App: unknown) => {
    try {
      const UnsafeApp = App as React.FC
      ReactDOM.render(<UnsafeApp />, document.getElementById('root'))
    } catch (e) {
      console.error('Cannot bootstrap React App')
      throw e
    }
  }
}

const runtime = Runtime.create(void 0, PlatformReact)

runtime.unsafeRun(AppZ)

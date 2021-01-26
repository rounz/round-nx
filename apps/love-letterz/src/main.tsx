import { LoveLetterz, LoveLetterzState } from '@round/love-letterz/environment'
import { ZIO, ZIORef } from '@round/zio'
import { LoveLetterzApp } from '@round/love-letterz/ui-rn'
import React from 'react'
import ReactDOM from 'react-dom'
import { pipe } from 'fp-ts/lib/pipeable'

const environment: LoveLetterz = {
  stateRef: ZIORef(LoveLetterzState.init())
}

pipe(
  LoveLetterzApp,
  ZIO.fold(
    e => {
      throw e
    },
    App => {
      ReactDOM.render(<App />, document.getElementById('root'))
    }
  ),
  ZIO.run(environment)
)

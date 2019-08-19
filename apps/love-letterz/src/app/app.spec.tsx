import { PlatformVoid, Runtime, ZIO } from '@round/zio'
import { cleanup, render } from '@testing-library/react'
import AppZ from './app'
import React from 'react'
import { pipe } from 'fp-ts/lib/pipeable'

describe('App', () => {
  const runtime = Runtime.create(void 0, PlatformVoid)

  afterEach(cleanup)

  it('should render successfully', async () => {
    await pipe(
      AppZ,
      ZIO.map(App => {
        const { baseElement } = render(<App />)

        expect(baseElement).toBeTruthy()
      }),
      runtime.unsafeRun
    )
  })

  it('should have a greeting as the title', async () => {
    await pipe(
      AppZ,
      ZIO.map(App => {
        const { getByText } = render(<App />)

        expect(getByText('Welcome to love-letterz!')).toBeTruthy()
      }),
      runtime.unsafeRun
    )
  })
})

import { cleanup, render } from '@testing-library/react'
import App from './app'
import React from 'react'

describe('App', () => {
  afterEach(cleanup)

  it('should render successfully', () => {
    const { baseElement } = render(<App />)

    expect(baseElement).toBeTruthy()
  })

  it('should have a greeting as the title', () => {
    const { getByText } = render(<App />)

    expect(getByText('Welcome to love-letterz!')).toBeTruthy()
  })
})

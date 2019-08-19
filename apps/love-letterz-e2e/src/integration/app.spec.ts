import { getGreeting } from '../support/app.po'

describe('love-letterz', () => {
  beforeEach(() => cy.visit('/'))

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to love-letterz!')
  })
})

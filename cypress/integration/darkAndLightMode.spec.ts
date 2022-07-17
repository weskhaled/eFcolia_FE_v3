
context('Login', () => {
  beforeEach(() => {
    cy.visit('/auth')
  })

  it('toggle', () => {
    cy.url()
      .should('eq', 'http://localhost:3333/auth')


    cy.get('button[role="switch"]')
      .click()

    cy.wait(200).should(() => {
      const color = localStorage.getItem('vueuse-color-scheme')
      expect(color).to.eq('light')
    })
  })
})

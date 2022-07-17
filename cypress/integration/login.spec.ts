
context('Login', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('login', () => {
    cy.url()
      .should('eq', 'http://localhost:3333/auth')

    cy.contains('Login')
      .should('exist')

    cy.get('#normal_login_username')
      .clear()
      .type('amine94')

    cy.get('#normal_login_password')
      .clear()
      .type('98565618Am')

    cy.wait(200)
    
    cy.get('[type="submit"]')
    .click()
    
    cy.url()
    .should('eq', 'http://localhost:3333/dashboard')

    cy.wait(500).should(() => {
      console.log('test local:', localStorage.getItem('token'))
      expect(localStorage.getItem('token')).to.not.eq('')
    })
  })
})

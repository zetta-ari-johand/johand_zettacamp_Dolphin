/* 
1. Install Angular CLI globally to your local machine by running `npm install -g @angular/cli`
2. Install the dependencies needed by the application by running `npm install` inside the directory of the repository
3. Run the application using `ng serve` and the application should be able to be open in http://localhost:4200/ 
4. npm install cypress --save-dev
5. npx cypress open

configure di web cypress buat bikin folder dan file cypress
*/

describe('template spec', () => {
  it('passes', () => {
    // to landing page
    cy.visit('http://localhost:4200')

    //login
    cy.get('[data-cy=input-name]').type('astaga bingung kali ini mi')
    cy.get('[data-cy=input-password]').type('yabetulsekali')
    cy.wait(500)
    cy.get('[data-cy=btn-login]').click()
    cy.wait(500)
    // Add assertions for successful login, e.g., checking if a profile is displayed.
    cy.get('[data-cy=text-navbar-profile-name]').should('contain', 'Hi,')
    cy.wait(500)

    // Add an item to the cart
    cy.get('[data-cy=btn-add-menu-item-to-cart]').click({ multiple: true })
    cy.wait(1000)

    // remove all item
    cy.get('[data-cy=btn-remove-item-from-cart]')
      .should('exist')
      .click({ multiple: true })

    cy.get('[data-cy=btn-add-menu-item-to-cart]').click({ multiple: true })
    cy.wait(1000)

    // Checkout
    cy.get('[data-cy=btn-checkout]').click()
    cy.wait(1000)

    //logout
    cy.get('[data-cy=btn-logout]').click()
    cy.get('[data-cy=text-title-login]').should('contain', 'Login')
  })
})

// describe('Template spec', () => {
//   beforeEach(() => {
//     // Visit the landing page before each test
//     cy.visit('http://localhost:4200')

//     // Log in
//     cy.get('[data-cy=input-name]').type('astaga_susah_kali_ini_ji')
//     cy.get('[data-cy=input-password]').type('your_password')
//     cy.get('[data-cy=btn-login]').click()

//     // Wait for successful login
//     cy.get('[data-cy=text-navbar-profile-name]').should('contain', 'Hi,')
//   })

//   afterEach(() => {
//     cy.wait(2000)
//     // Log out after each test
//     cy.get('[data-cy=btn-logout]').click()
//     cy.get('[data-cy=text-title-login]').should('contain', 'Login')
//   })

//   it('should add items to the cart', () => {
//     // Add items to the cart
//     cy.get('[data-cy=btn-add-menu-item-to-cart]').click({ multiple: true })
//   })

//   // it('should perform checkout', () => {
//   //   // Ensure that the "Checkout" button is visible and enabled
//   //   cy.get('[data-cy=btn-checkout]').should('be.visible').should('be.enabled')

//   //   // Perform checkout
//   //   cy.get('[data-cy=btn-checkout]').click()

//   //   // Add assertions for the checkout process here
//   // })

//   it('should remove items from the cart', () => {
//     // Ensure that the "Remove" buttons are visible and enabled
//     cy.get('[data-cy=btn-remove-item-from-cart]')
//       .should('be.visible')
//       .should('be.enabled')

//     // Remove all items from the cart
//     cy.get('[data-cy=btn-remove-item-from-cart]').click({ multiple: true })

//     // Add assertions for an empty cart here
//   })
// })

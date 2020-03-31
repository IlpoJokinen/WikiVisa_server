
// Regular View
describe('Question Screen (Regular Screen)', () => {
    beforeEach(() => {
      cy.visit('/')
      cy.get('#gamertagInput')
          .type('testUser')
      
    })

    

    })

 // Phone (Iphone6) View
 describe('Question Screen (Iphone 6)', () => {
    beforeEach(() => {
      cy.viewport('iphone-6')
      cy.visit('/')
      
    })

    

  })
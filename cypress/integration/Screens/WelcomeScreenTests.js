
// Regular View
describe('Welcome Screen (Regular Screen)', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('Check Welcome text', () => {
        cy.get('h1').should(
            'contain',
            'Welcome'
          )
      })

      it('Check Input Labels', () => {
        cy.get('#gamertaglabel').should(
            'contain',
            'Enter your gamertag')
          cy.get('#roomcodelabel').should(
            'contain',
            'Enter room code')
      })

      it('Check Input Placeholders', () => {
        cy.get('#gamertag').should(
          'have.attr', 'placeholder', 'Enter your gamertag')
        cy.get('#roomcode').should(
          'have.attr', 'placeholder', 'Enter room code')
      })

      it('Check Input Text', () => {
        cy.get('#gamertag')
          .should('be.empty') 
        cy.get('#roomcode')
          .should('be.empty') 
      })

      it('Verify alert on empty GamerTag (Join Game Click)', function(){  
            const stub = cy.stub()  
            cy.on ('window:alert', stub)
            cy
            .get('#joingamebutton').click()
            .then(() => {
              expect(stub.getCall(0))
                .to.be.calledWith("Provide another roomcode, the one you gave doesn't exit")      
            })  
        
      })
        
      it('Check Button Texts', () => {
        cy.get('#joingamebutton').should(
          'contain',
          'Join Game')
          cy.get('#creategamebutton').should(
            'contain',
            'Create Game')
      })

    })

    // Phone (Iphone6) View
    describe('Welcome Screen (Iphone 6)', () => {
      beforeEach(() => {
        cy.viewport('iphone-6')
        cy.visit('/')
      })
  
      it('Check Welcome text', () => {
        cy.get('h1').should(
            'contain',
            'Welcome'
          )
      })

      it('Check Input Labels', () => {
        cy.get('#gamertaglabel').should(
            'contain',
            'Enter your gamertag')
          cy.get('#roomcodelabel').should(
            'contain',
            'Enter room code')
      })

      it('Check Input Placeholders', () => {
        cy.get('#gamertag').should(
          'have.attr', 'placeholder', 'Enter your gamertag')
        cy.get('#roomcode').should(
          'have.attr', 'placeholder', 'Enter room code')
      })

      it('Check Input Text', () => {
        cy.get('#gamertag')
          .type('text') 
        cy.get('#roomcode')
          .type('text') 
      })

      it('Check Button Texts', () => {
        cy.get('#joingamebutton').should(
          'contain',
          'Join Game')
          cy.get('#creategamebutton').should(
            'contain',
            'Create Game')
      })

    })
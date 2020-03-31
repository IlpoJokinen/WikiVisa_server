//import { Play, Tools } from '../../../../WikiVisa_Client/node_modules/react-bootstrap-icons'


// Regular View
describe('Welcome Screen (Regular Screen)', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('Check Welcome text', () => {
        cy.get('h1').should(
            'contain',
            'Give Gamertag'
          )
        cy.get('#randomGamerTagButton').click()
        cy.get('h1').should(
            'contain',
            'Join or Create a game'
          )
      })

      it('Check Input Placeholders', () => {
        cy.get('#gamertagInput').should(
          'have.attr', 'placeholder', 'Provide gamertag')
      })

      it('Check Input Text', () => {
        cy.get('#gamertagInput')
        .should('be.empty') 
      
     
      })
  
      it('Check Button Text', () => {
          cy.get('#nextButton').should(
            'contain',
            'Next')
          cy.get('#randomGamerTagButton').should(
            'contain',
            'Randomize name')
          cy.get('#randomGamerTagButton').click()
          cy.get('#joinGameButton').should(
            'contain',
            'Join Game')
            cy.get('#createGameButton').should(
              'contain',
              'Create Game')

          
      })

      it('Check if Button disabled if nothing provided ', () => {
        cy.get('#nextButton')
          .should('be.disabled')

      })
      it('Check if Button enabled if something provided ', () => {
        cy.get('#gamertagInput')
          .type('testUser')
        cy.get('#nextButton')
          .should('be.enabled')

      })


      
      describe('Welcome Screen - Join Game (Regular Screen)', () => {
        beforeEach(() => {
          cy.get('#randomGamerTagButton').click()
        })

        it('Join Game ', () => {
      
  
        })

        it('Check Welcome text', () => {
          cy.get('h1').should(
              'contain',
              'Enter Room Code or Find Game'
            )

        })


      })

      describe('Welcome Screen - Create Game (Regular Screen)', () => {
        beforeEach(() => {
          cy.get('#randomGamerTagButton').click()
        })

        it('Create Game ', () => {
          
  
        })


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
            'Give Gamertag'
          )
      })

      it('Check Input Placeholders', () => {
        cy.get('#gamertagInput').should(
          'have.attr', 'placeholder', 'Provide gamertag')
      })

      it('Check Input Text', () => {
        cy.get('#gamertagInput')
        .should('be.empty') 
     
      })
      
      it('Check Button Text', () => {
          cy.get('#nextButton').should(
            'contain',
            'Next')
          cy.get('#randomGamerTagButton').should(
            'contain',
            'Randomize name')
      })

      it('Check if Button disabled if nothing provided ', () => {
        cy.get('#nextButton')
          .should('be.disabled')

      })

      it('Check if Button enabled if something provided ', () => {
        cy.get('#gamertagInput')
          .type('testUser')
        cy.get('#nextButton')
          .should('be.enabled')

      })


    })

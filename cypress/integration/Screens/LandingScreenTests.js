const utilities = require('../../../Utilities')

// Regular View
describe('Landing Screen (Regular Screen)', () => {

	describe('Middle Content', () => {


		it('Heading Texts', () => {
			
			cy.get('h4')
			.contains(/^Active players$/)
		
			cy.get('h1')
			.contains(/^Welcome to WikiQuiz!$/)
		
		});

		it('Middle Content Colors', () => {
			
		});

	})

	describe('Right Play Menu', () => {
		it('Right Play Menu Heading Texts', () => {
			cy
			.get('h2')
			.contains(/^How would you like to play\?$/)
			
		
		});

		it('Right Play Menu Button Texts', () => {

			cy.get('#QuickGameButton')
			.invoke('text')
			.should('eq', 'Quick Game')

			cy.get('#CreateGameButton')
			.invoke('text')
			.should('eq', 'Create Game')

			cy.get('#FindGameButton')
			.invoke('text')
			.should('eq', 'Find Game')
		
		});
		
	})

	describe('Left Menu', () => {

		it('Left Menu Link Texts', () => {
		
			cy.get('#vertical-tab-0')
			.contains(/^Play$/)
			

			cy.get('#vertical-tab-1')
			.contains(/^Statistics$/)
			
	
			cy.get('#vertical-tab-2')
			.contains(/^Profile$/)
	
			cy.get('#vertical-tab-3')
			.contains(/^Sign In \/ Sign Up$/)
			

		});

		it('Left Menu Link Colors', () => {
		
			cy.get('#vertical-tab-0')
			.should('have.css', 'color')
				.and('equal', 'rgb(255, 255, 255)')

			cy.get('#vertical-tab-1')
			.should('have.css', 'color')
				.and('equal', 'rgb(255, 255, 255)')
			
			cy.get('#vertical-tab-2')
			.should('have.css', 'color')
				.and('equal', 'rgb(255, 255, 255)')
	
			cy.get('#vertical-tab-3')
			.should('have.css', 'color')
				.and('equal', 'rgb(255, 255, 255)')
			
		});
	
		it('Left Menu Colors', () => {
			cy.get('#leftBlock')
				.should('have.css', 'backgroundColor')
				.and('equal', 'rgb(102, 116, 173)')	

		});
	
	})

	it('Load Landing Page', () => {
		cy.visit('/')
	});
	

	})

// Phone (Iphone6) View
describe('Landing Screen (Iphone 6)', () => {
	beforeEach(() => {
		cy.viewport('iphone-6')
		cy.visit('/')
	})
})
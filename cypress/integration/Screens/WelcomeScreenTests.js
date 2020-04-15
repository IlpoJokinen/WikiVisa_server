// Regular View
describe('Start Screen (Regular Screen)', () => {
	beforeEach(() => {
		cy.visit('/')
	})
})

// Phone (Iphone6) View
describe('Start Screen (Iphone 6)', () => {
	beforeEach(() => {
		cy.viewport('iphone-6')
		cy.visit('/')
	})
})
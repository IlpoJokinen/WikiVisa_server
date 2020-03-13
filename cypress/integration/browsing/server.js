

  describe('Request', () => {
    
    //Test if get response from Client(React)
    it('Site root(Client)', () => {
      cy.request('/')
        .should((response) => {
          expect(response.status).to.eq(200)
        })
    })

    // Test if get response from server
    it('Site root(Server)', () => {
      cy.request('http://localhost:3001')
        .should((response) => {
          expect(response.status).to.eq(200)
        })
    })
  })
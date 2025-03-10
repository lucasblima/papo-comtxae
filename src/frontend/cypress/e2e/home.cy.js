describe('Home Page', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('http://localhost:3000');
  });
  
  it('should display the header', () => {
    cy.get('header').should('be.visible');
    cy.contains('Papo Social').should('be.visible');
  });
  
  it('should navigate to residents page', () => {
    cy.contains('Moradores').click();
    cy.url().should('include', '/residents');
    cy.contains('Lista de Moradores').should('be.visible');
  });
  
  it('should toggle the theme', () => {
    // Assuming there's a theme toggle button
    cy.get('[data-testid="theme-toggle"]').click();
    // Check that body has dark class or other theme indicator
    cy.get('body').should('have.class', 'dark');
  });

  it('should show mobile menu on smaller screens', () => {
    // Set viewport to mobile size
    cy.viewport('iphone-x');
    
    // Check if mobile menu button exists and works
    cy.get('[data-testid="mobile-menu-button"]').should('be.visible').click();
    
    // Verify mobile menu appears
    cy.get('[data-testid="mobile-menu"]').should('be.visible');
  });
}); 
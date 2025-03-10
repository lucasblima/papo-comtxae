const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    // Configure different environments
    env: {
      development: {
        apiUrl: 'http://localhost:8000',
      },
      production: {
        apiUrl: 'https://api.paposocial.com',
      },
    },
  },
}); 
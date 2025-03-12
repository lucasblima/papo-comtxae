# Papo Social Tests

This directory contains tests for the Papo Social application, focusing on verifying the user experience and identifying any flaws in the user journey.

## Test Structure

The tests are organized into these categories:

- **Components**: Unit tests for individual React components
- **Integration**: End-to-end flows testing multiple components together
- **Pages**: Tests for Next.js page components
- **__mocks__**: Mocks for browser APIs, external services, etc.

## Running Tests

To run the tests, use the following commands from the `src/frontend` directory:

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Key Test Files

### Component Tests

- `VoiceVisualization.test.tsx`: Tests the audio visualization component
- `EnhancedVoiceButton.test.tsx`: Tests the voice button component
- `VoiceOnboarding.test.tsx`: Tests the onboarding component in isolation

### Integration Tests

- `OnboardingFlow.test.tsx`: Tests the complete user journey from landing page through onboarding

## Mock Implementation

The tests use several mocks to simulate browser APIs:

- `speechRecognitionMock.ts`: Mocks the Web Speech API for speech recognition
- `audioContextMock.ts`: Mocks the Web Audio API for audio visualization

## Test Coverage

Current test coverage focuses on critical user flows:

1. **Voice Onboarding Flow**
   - User lands on homepage
   - User starts onboarding
   - User speaks their name
   - User enters phone number
   - User confirms details
   - User completes onboarding and is authenticated

2. **Error Handling**
   - Voice recognition failures
   - Network errors during API calls
   - Input validation errors

## Debugging Tests

If tests are failing, you can:

1. Run with verbose output: `npm test -- --verbose`
2. Use console.log in tests (these will appear in the terminal)
3. Focus on a specific test: `npm test -- -t "test name"`

## Adding New Tests

When adding new tests:

1. Follow the existing structure and naming conventions
2. Ensure mocks are properly set up
3. Test both success and error scenarios
4. Check for UI feedback that would be visible to users 
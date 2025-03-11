# Papo Social Frontend

Papo Social is a voice-first social platform built with Next.js, TypeScript, and React. This document outlines the architecture, testing strategy, and type system used in the project.

## Testing Strategy

### Test Structure

The testing structure follows a clear organization pattern:

```
src/frontend/
  ├── __tests__/               # Main test directory
  │   ├── components/          # Component tests
  │   ├── hooks/               # Hook tests
  │   ├── integration/         # Integration tests
  │   ├── pages/               # Page component tests
  │   └── __mocks__/           # Mock implementations
  ├── jest.config.js           # Jest configuration
  └── jest.setup.js            # Jest setup and global mocks
```

### Test Types

1. **Unit Tests**: Located in `__tests__/components` and `__tests__/hooks`, these test individual components and hooks in isolation.

2. **Integration Tests**: Located in `__tests__/integration`, these test how components interact with each other and with services.

3. **Page Tests**: Located in `__tests__/pages`, these test Next.js page components and their lifecycle.

### Mocking Strategy

- **API Requests**: API calls are mocked using Jest's mock functions to avoid actual network requests.
- **Browser APIs**: Browser-specific APIs like Web Speech API are mocked in the `jest.setup.js` file.
- **Services**: Service modules are mocked in `__tests__/__mocks__` directory to provide consistent test data.

### Coverage Requirements

The project aims for the following test coverage:

- **85%** statement coverage for components
- **80%** branch coverage for utilities and services
- **75%** overall coverage

Run `npm test -- --coverage` to generate coverage reports.

## Type System Architecture

### Core Type Definitions

The type system is centralized in specific type definition files:

```
src/frontend/
  └── types/
      ├── achievements.ts      # Achievement-related types
      ├── api.ts               # API response types
      ├── speech-recognition.d.ts # Web Speech API type definitions
      └── user.ts              # User-related types
```

### Achievement Type System

The achievement system uses a robust hierarchical type structure:

1. **Base Achievement Interface**: Defines the core properties of an achievement.
2. **User Achievement Interface**: Extends the base achievement with user-specific properties.
3. **Achievement State Enum**: Represents the different states an achievement can be in (locked, unlocked, in-progress).
4. **Achievement Trigger Event Type**: Defines the events that can trigger achievements.

### API Response Types

The API response types provide consistent typing for all API interactions:

1. **ApiResponse**: Generic interface for all API responses, including success status and optional error information.
2. **ApiError**: Interface for standardized error objects with type categorization.
3. **ApiErrorType**: Enum for different categories of errors (network, server, validation, etc.).

## Error Handling Strategy

### API Error Handling

The project uses a comprehensive error handling system for API calls:

1. **Centralized Parsing**: All API errors are parsed through the `parseApiError` utility.
2. **Type Categorization**: Errors are categorized into specific types (network, auth, validation, etc.).
3. **Retry Mechanism**: Temporary errors (network issues, timeouts) can be automatically retried.
4. **User-Friendly Messages**: Human-readable error messages are provided for UI display.

### Voice Recognition Error Handling

The Web Speech API implementation includes specific error handling for:

1. **Permission Denials**: Handled gracefully with user guidance.
2. **Unsupported Browsers**: Detection and fallback options.
3. **Recognition Failures**: Recovery mechanisms and user feedback.

## Component Architecture

The component architecture follows a clear hierarchy:

1. **UI Components**: Basic UI elements with no business logic.
2. **Feature Components**: Combinations of UI components with specific feature functionality.
3. **Page Components**: Next.js pages that compose feature components.
4. **Layout Components**: Structure the overall application layout.

## Services Architecture

The services layer handles external interactions and business logic:

1. **API Services**: Handle API requests with proper error handling.
2. **Achievement Service**: Manages user achievements and XP.
3. **User Service**: Handles user authentication and profile management.

## Getting Started

To run the development server:

```bash
npm run dev
```

To run tests:

```bash
npm test
```

To run tests with coverage:

```bash
npm test -- --coverage
```

## Contributing

Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details. 
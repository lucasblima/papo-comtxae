/**
 * Assertion utility functions for Papo Social Platform
 */

/**
 * Asserts that a condition is true, throws an error otherwise
 */
export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Asserts that a value is not null or undefined
 */
export function assertDefined<T>(value: T | null | undefined, message: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Type guard to safely check if an object has a specific property
 */
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Safely access potentially undefined nested properties
 */
export function safeAccess<T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | undefined {
  return obj ? obj[key] : undefined;
}

/**
 * Wraps an async function with error handling to prevent uncaught promise rejections
 */
export function tryCatchAsync<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: unknown) => void
): Promise<T | undefined> {
  return fn().catch((error) => {
    if (errorHandler) {
      errorHandler(error);
    } else {
      console.error('Caught async error:', error);
    }
    return undefined;
  });
}

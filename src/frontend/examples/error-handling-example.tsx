import { assert, assertDefined, tryCatchAsync } from '../utils/assert';
import { ErrorBoundary } from '../utils/errorBoundary';
import axios from 'axios';

// Example component using assertions
function UserProfile({ userId }: { userId: string | undefined }) {
  // Assert that userId is provided
  try {
    assertDefined(userId, "User ID is required");
  } catch (error) {
    return <div className="text-error">Invalid user ID</div>;
  }
  
  // Rest of the component...
  return <div>User profile for {userId}</div>;
}

// Example async function with error handling
async function fetchUserData(userId: string) {
  assert(userId.length > 0, "User ID cannot be empty");
  
  return tryCatchAsync(async () => {
    const response = await axios.get(`/api/users/${userId}`);
    assertDefined(response.data, "API returned no data");
    return response.data;
  }, (error) => {
    console.error("Failed to fetch user data:", error);
    // Could also report to an error tracking service here
  });
}

// Wrapping components with error boundary
export function SafeUserSection() {
  return (
    <ErrorBoundary fallback={<p>Failed to load user section</p>}>
      <UserProfile userId="123" />
    </ErrorBoundary>
  );
} 
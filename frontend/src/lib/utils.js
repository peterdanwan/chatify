// frontend/src/lib/utils.js

export const safeErrorMessage = function (
  error,
  fallbackText = 'Something went wrong. Please try again.'
) {
  // Extract error message with fallback chain:
  // 1. Server error message (error.response.data.message)
  // 2. Generic error message (error.message)
  // 3. Default fallback message
  // Uses ?. (optional chaining) to safely access nested properties
  // Uses ?? (nullish coalescing) to provide fallbacks for null/undefined
  return error?.response?.data?.message ?? error?.message ?? fallbackText;
};

export function filterByName(users, nameFilter) {
  return users.filter((user) => {
    return user.displayName.toLowerCase().includes(nameFilter.toLowerCase());
  });
}

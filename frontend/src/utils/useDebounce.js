import { useState, useEffect } from 'react';

/**
 * A custom hook to debounce a value.
 * This prevents rapid-firing functions (like API calls) while the user is typing.
 * @param {any} value The value to debounce (e.g., searchQuery)
 * @param {number} delay The delay in milliseconds (e.g., 500)
 * @returns {any} The debounced value
 */
function useDebounce(value, delay) {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if the value changes (e.g., user types again)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-run if value or delay changes

  return debouncedValue;
}

export default useDebounce;
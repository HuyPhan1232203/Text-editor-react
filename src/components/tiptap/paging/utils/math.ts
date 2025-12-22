/**
 * @file /src/utils/math.ts
 * @name Math
 * @description Utility functions for mathematical operations.
 */

/**
 * Checks if a value is within a specified range inclusive of the bounds.
 *
 * @param value - The value to check.
 * @param min - The minimum value of the range.
 * @param max - The maximum value of the range.
 * @returns True if the value is within the range, false otherwise.
 */
export const inRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

/**
 * Calculates the hypotenuse of a right triangle given the lengths of the other two sides.
 *
 * @param a - The length of side A.
 * @param b - The length of side B.
 * @returns The length of the hypotenuse.
 */
export const pythagoreanTheorem = (a: number, b: number): number => {
  return Math.sqrt(a ** 2 + b ** 2)
}

/**
 * Generic binary search function.
 *
 * @param arr - The sorted array to search.
 * @param target - The target value to search for.
 * @param compare - A comparison function that returns:
 *                  - A negative number if `target` < element at current index
 *                  - Zero if `target` === element at current index
 *                  - A positive number if `target` > element at current index
 * @returns {number} - The index of the target element, or null if not found.
 */
export const binarySearch = <T>(arr: T[], target: T, compare: (a: T, b: T) => number): number => {
  let low = 0
  let high = arr.length - 1

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const comparison = compare(target, arr[mid])

    if (comparison === 0) {
      return mid // Found the target
    }

    if (comparison < 0) {
      high = mid - 1 // Search in the left half
    } else {
      low = mid + 1 // Search in the right half
    }
  }

  return high
}

/**
 * Find the index of the closest element in an array to a target value.
 *
 * @param arr - The array to search.
 * @param target - The target value to find the closest element to.
 * @returns The index of the closest element in the array.
 */
export const findClosestIndex = (arr: number[], target: number): number => {
  let lo = 0
  let hi = arr.length - 1
  let closestIndex = -1
  let closestDistance = Infinity

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    const currentDistance = Math.abs(arr[mid] - target)

    // Update closestIndex if mid is closer to target
    if (currentDistance < closestDistance) {
      closestDistance = currentDistance
      closestIndex = mid

      // In case of a tie, prefer the larger value
    } else if (currentDistance === closestDistance) {
      closestIndex = Math.max(closestIndex, mid)
    }

    if (arr[mid] === target) {
      return mid // If we find an exact match
    } else if (arr[mid] < target) {
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  return closestIndex
}

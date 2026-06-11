/**
 * Creates a new object by excluding the specified keys from the source object.
 *
 * @template T - The type of the source object.
 * @template K - The union of keys to exclude from the source object.
 *
 * @param {T} obj - The source object to exclude properties from.
 * @param {K[]} keys - An array of keys to remove from the resulting object.
 *
 * @returns {Omit<T, K>} Omit<T, K> - A new object without the specified keys.
 *
 * @example
 * const user = { id: 1, name: "Alice", email: "alice@example.com" };
 * const result = exclude(user, ["email"]);
 * result → { id: 1, name: "Alice" }
 */
const exclude = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const finalObj = { ...obj };

  for (const key of keys) {
    delete finalObj[key];
  }

  return finalObj;
};

export { exclude };

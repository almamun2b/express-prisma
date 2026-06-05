/**
 * Creates a new object containing only the specified keys from the source object.
 *
 * @template T - The type of the source object.
 * @template K - The union of keys to pick from the source object.
 *
 * @param {T} obj - The source object to pick properties from.
 * @param {K[]} keys - An array of keys to include in the resulting object.
 *
 * @returns {Partial<T>} A new object containing only the requested keys.
 *
 * @example
 * const user = { id: 1, name: "Alice", email: "alice@example.com" };
 * const result = pick(user, ["id", "name"]);
 * // result → { id: 1, name: "Alice" }
 */
const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Partial<T> => {
  const finalObj: Partial<T> = {};

  for (const key of keys) {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key];
    }
  }

  return finalObj;
};

export { pick };

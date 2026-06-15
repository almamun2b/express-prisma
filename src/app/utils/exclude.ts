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

/**
 * Transforms an object type by:
 * - Removing `undefined` from property value types.
 * - Converting properties that can be `undefined` into optional properties.
 * - Preserving required properties that cannot be `undefined`.
 */
type ExcludeUndefined<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>;
} & {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

/**
 * Removes properties with `undefined` values from an object.
 *
 * - Properties that can be `undefined` become optional with `undefined` excluded.
 * - Properties that cannot be `undefined` remain required.
 *
 * @template T - The source object type.
 * @param obj - The object to sanitize.
 * @returns A new object without `undefined` values.
 *
 * @example
 * type User = {
 *   id: number;
 *   name?: string;
 *   age: number | undefined;
 * };
 *
 * const user: User = { id: 1, name: undefined, age: undefined };
 * const result = excludeUndefined(user);
 *
 * // Result type:
 * // { id: number; name?: string; age?: number }
 * // Result value:
 * // { id: 1 }
 */
const excludeUndefined = <T extends Record<string, unknown>>(obj: T): ExcludeUndefined<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as ExcludeUndefined<T>;
};
export { exclude, excludeUndefined };

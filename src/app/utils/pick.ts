/**
 * Uses TypeScript’s built‑in `Pick<T, K>` utility type.
 * This is the most idiomatic and concise approach.
 * The return type will show as `Pick<User, "id" | "name">`.
 *
 * @template T - The type of the source object.
 * @template K - The union of keys to pick from the source object.
 * @param obj - The source object.
 * @param keys - Keys to include in the result.
 * @returns Pick<T, K> - A new object containing only the requested keys.
 */

const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const finalObj = {} as Pick<T, K>;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key];
    }
  }
  return finalObj;
};

/**
 * Option 2 — Inline Mapped Type
 *
 * Returns an inline mapped type `{ [P in K]: T[P] }`.
 * This expands shallowly into the exact shape, e.g. `{ id: number; name: string }`.
 * Nested objects remain as their declared type (e.g. `profile: Profile`).
 *
 * @template T - The type of the source object.
 * @template K - The union of keys to pick from the source object.
 * @param obj - The source object.
 * @param keys - Keys to include in the result.
 * @returns { [P in K]: T[P] } - A new object containing exactly the requested keys.
 */
const pickInline = <T, K extends keyof T>(
  obj: T,
  keys: K[],
): { [P in K]: T[P] } => {
  const finalObj = {} as { [P in K]: T[P] };
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key];
    }
  }
  return finalObj;
};

/**
 * Option 3 — Recursive Expand
 *
 * Forces full expansion of nested types using a recursive mapped type.
 * Useful when you want IDEs to show the complete nested structure
 * instead of abstract references (e.g. `Profile`).
 *
 * @template T - The type of the source object.
 * @template K - The union of keys to pick from the source object.
 * @param obj - The source object.
 * @param keys - Keys to include in the result.
 * @returns ExpandRecursively<Pick<T, K>> - A new object with fully expanded nested types.
 */

const pickDeep = <T, K extends keyof T>(
  obj: T,
  keys: K[],
): ExpandRecursively<Pick<T, K>> => {
  const finalObj = {} as ExpandRecursively<Pick<T, K>>;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key] as any;
    }
  }
  return finalObj;
};

type ExpandRecursively<T> = T extends object
  ? { [K in keyof T]: ExpandRecursively<T[K]> }
  : T;

export { pick, pickDeep, pickInline };

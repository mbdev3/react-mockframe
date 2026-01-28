/**
 * @fileoverview Type Helper Utilities for MockFrame
 *
 * This module provides advanced TypeScript utility types that power MockFrame's
 * type-safe API. These utilities enable discriminated union types that provide
 * compile-time safety for device-specific props without any runtime overhead.
 *
 * @example How these types work together in MockFrame:
 * ```ts
 * // The DeviceFramesetProps type uses these helpers to ensure:
 * // - `color` prop is only required for devices that have color options
 * // - `landscape` prop is only available for devices that support rotation
 * // - Props display cleanly in IDE tooltips
 *
 * // Valid: iPhone 17 requires a color
 * <MockFrame device="iPhone 17" color="lavender" />
 *
 * // Valid: iPhone X has no colors, so color prop is omitted
 * <MockFrame device="iPhone X" />
 *
 * // TypeScript Error: iPhone X doesn't accept color
 * <MockFrame device="iPhone X" color="black" />
 * ```
 *
 * @module helper
 */

/* =============================================================================
   KEY EXTRACTION TYPES
   These types extract specific keys from an object based on their value types.
   ============================================================================= */

/**
 * Extracts keys from type `T` where the value type exactly matches type `F`.
 *
 * Uses bidirectional extends check to ensure exact type matching:
 * - `[F] extends [T[key]]` checks if F is assignable to the value
 * - `[T[key]] extends [F]` checks if the value is assignable to F
 * Both must be true for an exact match.
 *
 * The tuple wrapper `[X]` prevents TypeScript from distributing over unions,
 * ensuring we match the complete type rather than individual union members.
 *
 * @template T - The object type to extract keys from
 * @template F - The value type to match exactly
 * @returns Union of keys whose values exactly match type F
 *
 * @example
 * ```ts
 * type Device = { name: string; colors: never; width: number }
 *
 * type NeverKeys = KeysOfType<Device, never>
 * // Result: 'colors'
 *
 * type StringKeys = KeysOfType<Device, string>
 * // Result: 'name'
 * ```
 */
export type KeysOfType<T, F> = {
  [key in keyof T]: [F] extends [T[key]] ? [T[key]] extends [F] ? key : never : never
}[keyof T]

/**
 * Extracts keys from type `T` where type `F` is assignable to the value type.
 *
 * Unlike `KeysOfType`, this only checks one direction: whether F can be
 * assigned to the value. This is useful for finding keys that accept
 * a specific type as part of a union.
 *
 * @template T - The object type to extract keys from
 * @template F - The type that should be assignable to the value
 * @returns Union of keys whose values accept type F
 *
 * @example
 * ```ts
 * type Props = {
 *   required: string;
 *   optional: string | undefined;
 *   alsoOptional: number | undefined;
 * }
 *
 * type UndefinedKeys = KeysOfSubType<Props, undefined>
 * // Result: 'optional' | 'alsoOptional'
 * ```
 */
export type KeysOfSubType<T, F> = {
  [key in keyof T]: [F] extends [T[key]] ? key : never
}[keyof T]

/* =============================================================================
   TYPE TRANSFORMATION UTILITIES
   These types transform object types by removing or modifying fields.
   ============================================================================= */

/**
 * Creates a new type by omitting fields from `T` whose value type exactly matches `F`.
 *
 * Primary use case: Remove fields typed as `never` from discriminated unions.
 * When building conditional prop types, some device configurations result in
 * `never` typed fields that should be excluded from the final type.
 *
 * @template T - The object type to transform
 * @template F - The value type to filter out
 * @returns New type with matching fields removed
 *
 * @example
 * ```ts
 * // Internal type before cleanup
 * type RawProps = {
 *   device: 'iPhone X';
 *   color: never;      // iPhone X has no color options
 *   landscape: boolean;
 * }
 *
 * type CleanProps = OmitFieldByType<RawProps, never>
 * // Result: { device: 'iPhone X'; landscape: boolean }
 * // The `color` field is removed since it's typed as `never`
 * ```
 */
export type OmitFieldByType<T, F> = Omit<T, KeysOfType<T, F>>

/**
 * Makes fields optional if their type includes `undefined`.
 *
 * TypeScript distinguishes between optional fields (`key?: T`) and fields that
 * accept undefined (`key: T | undefined`). This utility converts the latter
 * to the former, allowing callers to omit the prop entirely rather than
 * passing an explicit `undefined`.
 *
 * Implementation:
 * 1. `Omit<T, KeysOfSubType<T, undefined>>` - Remove all undefined-accepting keys
 * 2. `Partial<Pick<T, KeysOfSubType<T, undefined>>>` - Add them back as optional
 * 3. Intersection combines both parts
 *
 * @template T - The object type to transform
 * @returns New type with undefined-accepting fields made optional
 *
 * @example
 * ```ts
 * type BeforeTransform = {
 *   device: 'iPad Pro';
 *   color: 'silver' | 'space-gray';
 *   landscape: boolean | undefined;  // Accepts undefined but is required
 * }
 *
 * type AfterTransform = OptionField<BeforeTransform>
 * // Result: {
 * //   device: 'iPad Pro';
 * //   color: 'silver' | 'space-gray';
 * //   landscape?: boolean | undefined;  // Now truly optional
 * // }
 * ```
 */
export type OptionField<T> = Omit<T, KeysOfSubType<T, undefined>> &
  Partial<Pick<T, KeysOfSubType<T, undefined>>>

/* =============================================================================
   DISPLAY UTILITIES
   These types improve how types appear in IDE tooltips and error messages.
   ============================================================================= */

/**
 * Flattens a type for cleaner IDE display and better autocomplete.
 *
 * Complex types built from intersections (`A & B`) and mapped types can
 * display as unwieldy expressions in IDE tooltips. This utility forces
 * TypeScript to eagerly compute the final object shape, resulting in
 * cleaner, more readable type hints.
 *
 * The `& unknown` is a TypeScript trick that triggers type simplification
 * without affecting the resulting type (since `T & unknown = T`).
 *
 * @template A - The type to flatten
 * @returns Simplified type with identical structure but cleaner display
 *
 * @example
 * ```ts
 * // Without Compute - IDE shows:
 * // Omit<{ device: string; color: never }, 'color'> & { landscape?: boolean }
 *
 * // With Compute - IDE shows:
 * // { device: string; landscape?: boolean }
 *
 * type Complex = { a: string } & { b: number } & { c: boolean }
 * type Simple = Compute<Complex>
 * // Hover shows: { a: string; b: number; c: boolean }
 * ```
 */
export type Compute<A> = { [K in keyof A]: A[K] } & unknown

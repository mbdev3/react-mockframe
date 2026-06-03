import { expectTypeOf } from 'vitest'
import { MockFrame } from '../MockFrame'
import type { DeviceColor } from '../DeviceOptions'

/* ---- DeviceColor extraction ---- */
expectTypeOf<DeviceColor<'iPhone 8'>>().toEqualTypeOf<'black' | 'silver' | 'gold'>()
expectTypeOf<DeviceColor<'iPhone X'>>().toEqualTypeOf<never>()
expectTypeOf<DeviceColor<'iPhone 17'>>().toEqualTypeOf<
  'black' | 'white' | 'mist-blue' | 'sage' | 'lavender' | 'cosmic-orange' | 'deep-blue'
>()

/* ---- Valid usages (must compile) ----
 * Written as JSX because object-literal assignment is too lenient against the
 * props union (excess-property checks pass if the key exists on ANY member).
 * JSX attribute checking is what users actually hit. */
export const v1 = <MockFrame device="iPhone X" />
export const v2 = <MockFrame device="iPhone X" landscape />
export const v3 = <MockFrame device="iPhone 17" color="lavender" />
export const v4 = <MockFrame device="MacBook Pro 2020" />
export const v5 = (
  <MockFrame device="iPhone 8" color="gold" className="x" style={{ opacity: 1 }} />
)

/* ---- Invalid usages: each MUST error, or the @ts-expect-error fails the build ---- */
// @ts-expect-error iPhone X has no color variants
export const x1 = <MockFrame device="iPhone X" color="black" />
// @ts-expect-error 'pink' is not a valid iPhone 17 color
export const x2 = <MockFrame device="iPhone 17" color="pink" />
// @ts-expect-error color is required for iPhone 17
export const x3 = <MockFrame device="iPhone 17" />
// @ts-expect-error MacBook Pro 2020 does not support landscape
export const x4 = <MockFrame device="MacBook Pro 2020" landscape />
// @ts-expect-error MacBook Pro 2020 has no color variants
export const x5 = <MockFrame device="MacBook Pro 2020" color="silver" />

import type { Compute, OptionField, OmitFieldByType } from './helper'

/**
 * Internal type representing a device configuration
 */
type DeviceType<Device extends string, Colors extends readonly string[]> = {
    /** CSS class name for the device frame */
    device: Device,
    /** Available color variants */
    colors: Colors,
    /** Whether the device supports landscape orientation */
    hasLandscape: boolean,
    /** Default content width in pixels */
    width?: number,
    /** Default content height in pixels */
    height?: number,
}

/**
 * Helper function to define a device with proper type inference
 */
export const defineDevice = <
    Device extends string,
    Colors extends readonly string[],
    Def extends DeviceType<Device, Colors>
>(definition: Def) => definition

export const DeviceOptions = {
    // Modern iPhones
    ['iPhone X']: defineDevice({
        device: 'iphone-x',
        colors: [] as const,
        hasLandscape: true,
        width: 375,
        height: 812,
    }),
    ['iPhone 8']: defineDevice({
        device: 'iphone8',
        colors: ['black', 'silver', 'gold'] as const,
        hasLandscape: true,
        width: 375,
        height: 667,
    }),
    ['iPhone 8 Plus']: defineDevice({
        device: 'iphone8plus',
        colors: ['black', 'silver', 'gold'] as const,
        hasLandscape: true,
        width: 414,
        height: 736,
    }),
    ['iPhone 17']: defineDevice({
        device: 'iphone17',
        colors: ['black', 'white', 'mist-blue', 'sage', 'lavender', 'cosmic-orange', 'deep-blue'] as const,
        hasLandscape: true,
        width: 402,
        height: 874,
    }),
    ['iPhone 18 Pro']: defineDevice({
        device: 'iphone18pro',
        // 'gold' and 'natural-titanium' are extras sampled from other Apple bezels (iPhone Air, iPhone 16 Pro)
        colors: ['black', 'silver', 'glacier', 'burgundy', 'gold', 'natural-titanium'] as const,
        hasLandscape: true,
        width: 402,
        height: 874,
    }),
    // Modern Android
    ['Pixel 10']: defineDevice({
        device: 'pixel10',
        // 'porcelain', 'mint' and 'rose' are older Pixel finishes, kept for compatibility
        colors: ['obsidian', 'frost', 'indigo', 'lemongrass', 'porcelain', 'mint', 'rose'] as const,
        hasLandscape: true,
        width: 412,
        height: 924,
    }),
    ['Galaxy S25']: defineDevice({
        device: 'galaxy-s25',
        // 'phantom-black' (Galaxy S21-S23) and 'silver' (alias of 'silver-shadow') are kept for compatibility
        colors: [
            'blue-black', 'icy-blue', 'navy', 'mint', 'silver-shadow', 'coral-red', 'pink-gold',
            'phantom-black', 'silver',
        ] as const,
        hasLandscape: true,
        width: 360,
        height: 780,
    }),
    // Tablets
    ['iPad Mini']: defineDevice({
        device: 'ipad',
        colors: ['black', 'silver'] as const,
        hasLandscape: true,
        width: 576,
        height: 768,
    }),
    ['iPad Pro']: defineDevice({
        device: 'ipad-pro',
        // 'space-gray' is kept as an alias of 'space-black' (the M4/M5 name)
        colors: ['space-black', 'space-gray', 'silver'] as const,
        hasLandscape: true,
        width: 512,
        height: 683,
    }),
    // Laptops
    ['MacBook Pro 2020']: defineDevice({
        device: 'macbook',
        colors: [] as const,
        hasLandscape: false,
        width: 960,
        height: 600,
    }),
    ['MacBook Pro']: defineDevice({
        device: 'macbook-pro',
        // 'space-gray' is kept as an alias of 'space-black' (the M3-M5 name)
        colors: ['space-black', 'space-gray', 'silver'] as const,
        hasLandscape: false,
        width: 960,
        height: 624,
    }),
}

/**
 * Union type of all available device names
 * @example 'iPhone X' | 'iPhone 8' | 'iPhone 17' | 'Pixel 10' | ...
 */
export type DeviceName = keyof typeof DeviceOptions

/**
 * Array of all available device names
 */
export const DeviceNames = Object.keys(DeviceOptions) as DeviceName[]

/**
 * Get the device configuration for a specific device
 */
export type DeviceConfig<D extends DeviceName> = typeof DeviceOptions[D]

/**
 * Get the available colors for a specific device
 * @example DeviceColor<'iPhone 8'> = 'black' | 'silver' | 'gold'
 */
export type DeviceColor<D extends DeviceName> = typeof DeviceOptions[D]['colors'][number]

/**
 * Check if a device supports landscape orientation
 */
export type DeviceHasLandscape<D extends DeviceName> = typeof DeviceOptions[D]['hasLandscape']

/**
 * Internal type for generating discriminated union props
 */
type DevicesType<R extends Record<string, DeviceType<string, readonly string[]>>> = {
    [key in keyof R]: Compute<OptionField<OmitFieldByType<{
        /** The device model to display */
        device: key,
        /** Color variant (required for devices with color options) */
        color: R[key]['colors'][number],
        /** Display in landscape orientation (only for devices that support it) */
        landscape: R[key]['hasLandscape'] extends true ? (boolean | undefined) : never
        /** Override content width in pixels */
        width?: number,
        /** Override content height in pixels */
        height?: number,
        /** Scale factor for the device frame */
        zoom?: number,
        /** Enable smooth transitions for zoom changes */
        animated?: boolean,
        /** Hide the notch or dynamic island (for devices that have one) */
        hideNotch?: boolean,
    }, never>>>
}[keyof R]

/**
 * Props for the MockFrame component
 *
 * This is a discriminated union type that provides type-safe props based on the selected device.
 * The `color` prop is only required for devices that have color variants.
 * The `landscape` prop is only available for devices that support landscape orientation.
 *
 * @example
 * // iPhone X - no color required, landscape supported
 * <MockFrame device="iPhone X" landscape />
 *
 * @example
 * // iPhone 8 - color required, landscape supported
 * <MockFrame device="iPhone 8" color="gold" />
 *
 * @example
 * // MacBook Pro - color required, no landscape support
 * <MockFrame device="MacBook Pro" color="space-gray" />
 */
export type MockFrameProps = DevicesType<typeof DeviceOptions> &
    Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>

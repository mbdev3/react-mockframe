/**
 * @fileoverview MockFrame Components
 *
 * This module exports two main components:
 * - `MockFrame` - Renders predefined device frames (iPhone, Android, iPad, MacBook)
 * - `CustomMockFrame` - Creates custom device frames with configurable bezels
 *
 * @example Basic usage
 * ```tsx
 * import { MockFrame } from 'react-mockframe'
 * import 'react-mockframe/styles/mockframe.css'
 *
 * <MockFrame device="iPhone 17" color="lavender">
 *   <YourApp />
 * </MockFrame>
 * ```
 *
 * @module MockFrame
 */

import * as React from 'react'

import type {
  MockFrameProps,
  DeviceName,
  DeviceConfig,
  DeviceColor,
  DeviceHasLandscape,
} from './DeviceOptions'
import { DeviceOptions, DeviceNames } from './DeviceOptions'

/* =============================================================================
   RE-EXPORTS
   ============================================================================= */

export { DeviceOptions, DeviceNames }
export type { MockFrameProps, DeviceName, DeviceConfig, DeviceColor, DeviceHasLandscape }

/* =============================================================================
   CONSTANTS
   ============================================================================= */

/**
 * Default styling values for CustomMockFrame.
 * These match common device aesthetics (dark bezel, rounded corners).
 */
const DEFAULTS = {
  /** Default bezel thickness in pixels */
  BEZEL_WIDTH: 12,
  /** Default outer corner radius in pixels */
  BORDER_RADIUS: 44,
  /** Default bezel color (dark gray) */
  BEZEL_COLOR: '#1a1a1a',
  /** Default screen background color */
  SCREEN_COLOR: '#ffffff',
  /** CSS transition for zoom animations */
  TRANSITION: 'transform 0.3s ease-in-out',
  /** CSS transition for zoom + color animations */
  TRANSITION_WITH_COLOR: 'transform 0.3s ease-in-out, background-color 0.3s ease',
} as const

/* =============================================================================
   UTILITY FUNCTIONS
   ============================================================================= */

/**
 * Creates a shallow copy of an object with specified keys removed.
 * Used to filter out component-specific props before spreading to DOM elements.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function omit<T extends Record<string, any>, K extends string>(
  item: T,
  keys: K[]
): Omit<T, K> {
  const clone = { ...item }
  for (const key of keys) {
    delete clone[key]
  }
  return clone
}

/**
 * Concatenates class names, filtering out falsy values.
 * Similar to the `clsx` or `classnames` libraries.
 *
 * @example
 * cx('base', isActive && 'active', undefined, 'end')
 * // Returns: 'base active end' (if isActive is true)
 */
function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

/* =============================================================================
   DEVICE ANATOMY COMPONENTS
   These render the decorative elements specific to each device type.
   ============================================================================= */

/**
 * Overflow shadow elements for edge-to-edge displays.
 * Creates depth shadows at each corner of the screen area.
 */
const OverflowShadows = () => (
  <div className="overflow">
    <div className="shadow shadow--tl" />
    <div className="shadow shadow--tr" />
    <div className="shadow shadow--bl" />
    <div className="shadow shadow--br" />
  </div>
)

/**
 * Dynamic Island + Action button shared by the iPhone 17 and iPhone 18 Pro.
 * The side and volume buttons reuse the common `.sleep` / `.volume` elements.
 */
const DynamicIslandAnatomy = ({ hideNotch }: { hideNotch?: boolean }) => (
  <>
    {!hideNotch && (
      <div className="dynamic-island">
        <div className="camera" />
      </div>
    )}
    <div className="action" />
  </>
)

/**
 * Device-specific anatomy elements rendered BEFORE the common elements.
 * Maps device names to their unique structural components (notches, antennas, etc.).
 */
const DeviceAnatomy: Partial<Record<DeviceName, (hideNotch?: boolean) => React.ReactNode>> = {
  'iPhone X': (hideNotch) => (
    <>
      {!hideNotch && (
        <div className="notch">
          <div className="camera" />
          <div className="speaker" />
        </div>
      )}
    </>
  ),

  'iPhone 17': (hideNotch) => <DynamicIslandAnatomy hideNotch={hideNotch} />,

  'iPhone 18 Pro': (hideNotch) => <DynamicIslandAnatomy hideNotch={hideNotch} />,

  'iPad Pro': () => (
    <>
      <div className="volume-up" />
      <div className="volume-down" />
    </>
  ),

  'MacBook Pro': (hideNotch) => (
    <>
      {!hideNotch && (
        <div className="notch">
          <div className="camera" />
        </div>
      )}
    </>
  ),
}

/**
 * Device-specific anatomy elements rendered AFTER the common elements.
 * Used for elements that need to layer on top of standard device parts.
 */
const DevicePostAnatomy: Partial<Record<DeviceName, () => React.ReactNode>> = {
  'iPhone X': () => <OverflowShadows />,
}

/* =============================================================================
   CUSTOM MOCK FRAME COMPONENT
   ============================================================================= */

/**
 * Props for the CustomMockFrame component.
 */
export interface CustomMockFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content to render inside the device screen */
  children?: React.ReactNode

  /** Width of the screen area in pixels (required) */
  width: number

  /** Height of the screen area in pixels (required) */
  height: number

  /**
   * Bezel thickness around the screen.
   * Can be a uniform number or per-side object.
   * @default 12
   *
   * @example Uniform bezel
   * bezelWidth={16}
   *
   * @example Per-side bezel (like older iPhones with chin)
   * bezelWidth={{ top: 20, right: 8, bottom: 40, left: 8 }}
   */
  bezelWidth?: number | { top?: number; right?: number; bottom?: number; left?: number }

  /**
   * Border radius of the outer device frame.
   * @default 44
   */
  borderRadius?: number

  /**
   * Border radius of the screen area.
   * If not specified, calculated as `borderRadius - bezelWidth`.
   */
  screenBorderRadius?: number

  /**
   * Background color of the device bezel.
   * @default '#1a1a1a'
   */
  bezelColor?: string

  /**
   * Background color of the screen area.
   * @default '#ffffff'
   */
  screenColor?: string

  /**
   * Scale factor for the entire device frame.
   * Values less than 1 shrink, greater than 1 enlarge.
   * @example zoom={0.75} // 75% size
   */
  zoom?: number

  /**
   * Enable smooth CSS transitions for zoom and color changes.
   * Useful when zoom is controlled by user interaction.
   */
  animated?: boolean

  /**
   * Display the device in landscape orientation.
   * Swaps width and height dimensions.
   */
  landscape?: boolean

  /** Additional CSS class for the outer frame element */
  frameClassName?: string

  /** Additional CSS class for the screen area element */
  screenClassName?: string
}

/**
 * Creates a custom device frame with configurable bezel, colors, and dimensions.
 *
 * Use this component when you need a device frame that doesn't match any
 * predefined device, or when you want full control over the frame appearance.
 *
 * @example Basic usage
 * ```tsx
 * <CustomMockFrame width={375} height={812} bezelColor="#333">
 *   <YourContent />
 * </CustomMockFrame>
 * ```
 *
 * @example With asymmetric bezels (like older phones with chin)
 * ```tsx
 * <CustomMockFrame
 *   width={375}
 *   height={667}
 *   bezelWidth={{ top: 60, right: 12, bottom: 60, left: 12 }}
 *   borderRadius={40}
 * >
 *   <YourContent />
 * </CustomMockFrame>
 * ```
 */
export const CustomMockFrame = React.memo(React.forwardRef<HTMLDivElement, CustomMockFrameProps>(
  function CustomMockFrame({
    children,
    width,
    height,
    bezelWidth = DEFAULTS.BEZEL_WIDTH,
    borderRadius = DEFAULTS.BORDER_RADIUS,
    screenBorderRadius,
    bezelColor = DEFAULTS.BEZEL_COLOR,
    screenColor = DEFAULTS.SCREEN_COLOR,
    zoom,
    animated,
    landscape,
    frameClassName,
    screenClassName,
    className,
    style: styleProp,
    ...restProps
  }, ref) {
    // Normalize bezel width to { top, right, bottom, left } format
    const bezel = React.useMemo(() => {
      if (typeof bezelWidth === 'number') {
        return { top: bezelWidth, right: bezelWidth, bottom: bezelWidth, left: bezelWidth }
      }
      const defaultWidth = DEFAULTS.BEZEL_WIDTH
      return {
        top: bezelWidth.top ?? defaultWidth,
        right: bezelWidth.right ?? defaultWidth,
        bottom: bezelWidth.bottom ?? defaultWidth,
        left: bezelWidth.left ?? defaultWidth,
      }
    }, [bezelWidth])

    // Calculate screen corner radius (inset from frame radius by bezel width)
    const effectiveScreenRadius = React.useMemo(
      () =>
        screenBorderRadius ??
        Math.max(0, borderRadius - Math.max(bezel.top, bezel.right, bezel.bottom, bezel.left)),
      [screenBorderRadius, borderRadius, bezel]
    )

    // Compute outer frame styles
    const frameStyle = React.useMemo((): React.CSSProperties => {
      const frameWidth = width + bezel.left + bezel.right
      const frameHeight = height + bezel.top + bezel.bottom

      return {
        display: 'inline-block',
        position: 'relative',
        boxSizing: 'content-box',
        width: landscape ? frameHeight : frameWidth,
        height: landscape ? frameWidth : frameHeight,
        backgroundColor: bezelColor,
        borderRadius,
        transform: zoom !== undefined ? `scale(${zoom})` : undefined,
        transformOrigin: 'top left',
        transition: animated ? DEFAULTS.TRANSITION_WITH_COLOR : undefined,
        ...styleProp,
      }
    }, [width, height, bezel, borderRadius, bezelColor, zoom, animated, landscape, styleProp])

    // Compute screen area styles (positioned inside the bezel)
    const screenStyle = React.useMemo(
      (): React.CSSProperties => ({
        position: 'absolute',
        top: landscape ? bezel.left : bezel.top,
        left: landscape ? bezel.bottom : bezel.left,
        width: landscape ? height : width,
        height: landscape ? width : height,
        borderRadius: effectiveScreenRadius,
        overflow: 'hidden',
        backgroundColor: screenColor,
      }),
      [width, height, bezel, effectiveScreenRadius, landscape, screenColor]
    )

    return (
      <div ref={ref} className={cx(frameClassName, className)} style={frameStyle} {...restProps}>
        <div className={screenClassName} style={screenStyle}>
          {children}
        </div>
      </div>
    )
  }
))

/* =============================================================================
   MOCK FRAME COMPONENT
   ============================================================================= */

/**
 * Renders a realistic device frame around your content.
 *
 * This is the primary component for displaying content inside predefined
 * device mockups. The component is fully type-safe - TypeScript will only
 * allow valid color options for each device.
 *
 * @example iPhone with color
 * ```tsx
 * <MockFrame device="iPhone 17" color="lavender">
 *   <YourApp />
 * </MockFrame>
 * ```
 *
 * @example iPhone X (no color options)
 * ```tsx
 * <MockFrame device="iPhone X" landscape>
 *   <YourApp />
 * </MockFrame>
 * ```
 *
 * @example With zoom and animation
 * ```tsx
 * <MockFrame
 *   device="iPad Pro"
 *   color="space-gray"
 *   zoom={0.5}
 *   animated
 * >
 *   <YourApp />
 * </MockFrame>
 * ```
 *
 * @see {@link DeviceOptions} for available devices and their configurations
 */
const MockFrameBase = React.forwardRef<HTMLDivElement, MockFrameProps>(function MockFrame(props, ref) {
  const {
    children, device, width, height, zoom, animated, hideNotch,
    className: userClassName, style: userStyle, ...restProps
  } = props

  // Extract device-specific props that shouldn't be passed to DOM
  const divProps = omit(restProps, ['landscape', 'color'])

  // Type-safe extraction of optional props
  const color = 'color' in props ? props.color : undefined
  const landscape = 'landscape' in props ? props.landscape : undefined

  // `device` can come from untyped data at runtime, so the lookup may miss
  const config: { device: string, hasLandscape: boolean } | undefined = DeviceOptions[device]
  const isLandscape = Boolean(landscape && config?.hasLandscape)

  // Compute inline styles for dimensions and transforms
  const style = React.useMemo((): React.CSSProperties => ({
    width: isLandscape ? height : width,
    height: isLandscape ? width : height,
    transform: zoom !== undefined ? `scale(${zoom})` : undefined,
    transition: animated ? DEFAULTS.TRANSITION : undefined,
  }), [width, height, isLandscape, zoom, animated])

  if (!config) {
    console.error(`MockFrame: unknown device "${String(device)}". Expected one of: ${DeviceNames.join(', ')}`)
    return null
  }

  // Build CSS class string for device styling
  const className = cx(
    'mockframe', config.device, color, isLandscape && 'landscape', userClassName
  )

  return (
    <div ref={ref} className={className} {...divProps} style={{ ...style, ...userStyle }}>
      {/* Inner bezel layer */}
      <div className="inner" />

      {/* Device-specific elements (notch, dynamic island, etc.) */}
      {DeviceAnatomy[device]?.(hideNotch)}

      {/* Common device elements (styled differently per device via CSS) */}
      <div className="top-bar" />
      <div className="sleep" />
      <div className="bottom-bar" />
      <div className="volume" />
      <div className="camera" />
      <div className="sensor" />
      <div className="speaker" />
      <div className="sensors" />
      <div className="more-sensors" />

      {/* Post-screen device elements */}
      {DevicePostAnatomy[device]?.()}

      {/* Screen shadow overlay */}
      <div className="inner-shadow" />

      {/* Screen content area */}
      <div className="screen">{children}</div>

      {/* Home button (for devices that have one) */}
      <div className="home" />
    </div>
  )
})

export const MockFrame = React.memo(MockFrameBase)

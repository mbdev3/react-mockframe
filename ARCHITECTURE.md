# Architecture

MockFrame is a pnpm workspace monorepo with two packages.

## `src/package` — the published library (`react-mockframe`)

- `src/index.ts` — re-exports the public API from `MockFrame.tsx`.
- `src/MockFrame.tsx` — `MockFrame` (predefined devices) and `CustomMockFrame`
  (configurable bezel/radius/colors). Per-device "anatomy" (notch, dynamic
  island, antennas, shadows) is rendered via the `DeviceAnatomy` /
  `DevicePostAnatomy` lookup maps.
- `src/DeviceOptions.ts` — the single source of truth: one `defineDevice(...)`
  entry per device (CSS class, colors, landscape support, default size). The
  `MockFrameProps` discriminated union is generated from this object.
- `src/helper.ts` — TypeScript utilities (`KeysOfType`, `OmitFieldByType`,
  `OptionField`, `Compute`) that turn `DeviceOptions` into type-safe props:
  `color` is required only for devices that have colors; `landscape` exists
  only for devices that support it.
- `css/mockframe.css` — nested source CSS (adapted from Marvel devices.css).
- `scripts/` — `build-css.js` (lightningcss → expanded + minified, with the
  nesting down-compiled for older browsers), `build-css-modules.js` (splits the
  CSS into per-family bundles), `gen-readme.js` (copies the root README into the
  package before publish).

**Build:** `tsup` emits CJS + ESM + `.d.ts`; lightningcss emits the stylesheets.

## `src/website` — the demo site (`react-mockframe-example`)

Vite + React + Tailwind v4 single-page app. Imports the library from source via
a Vite alias; imports the built CSS from `../package/dist/styles`.

## Testing

Vitest (jsdom) for render tests; `expectTypeOf` + `@ts-expect-error` JSX type
tests guard the discriminated-union API. Run with
`pnpm --filter react-mockframe test` (runtime + typecheck in one pass).

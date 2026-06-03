import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MockFrame, CustomMockFrame } from '../MockFrame'

describe('MockFrame className/style merging', () => {
  it('keeps device classes when a custom className is provided', () => {
    const { container } = render(
      <MockFrame device="iPhone 17" color="black" className="custom" />
    )
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('mockframe', 'iphone17', 'black', 'custom')
  })

  it('applies user inline style alongside computed dimensions', () => {
    const { container } = render(
      <MockFrame device="iPhone 17" color="black" width={400} style={{ opacity: 0.5 }} />
    )
    const el = container.firstChild as HTMLElement
    expect(el).toHaveStyle({ opacity: '0.5' })
    expect(el.style.width).toBe('400px')
  })
})

describe('MockFrame structure', () => {
  it('renders exactly one bottom-bar element', () => {
    const { container } = render(<MockFrame device="iPhone 8" color="black" />)
    expect(container.querySelectorAll('.bottom-bar')).toHaveLength(1)
  })
})

describe('CustomMockFrame className merging', () => {
  it('merges frameClassName and a passed className', () => {
    const { container } = render(
      <CustomMockFrame width={100} height={100} frameClassName="frame" className="extra" />
    )
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('frame', 'extra')
  })
})

import { createRef } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MockFrame, CustomMockFrame } from '../MockFrame'
import type { MockFrameProps } from '../MockFrame'

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

describe('refs', () => {
  it('forwards a ref to the MockFrame root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<MockFrame ref={ref} device="iPhone 18 Pro" color="glacier" />)
    expect(ref.current).toHaveClass('mockframe', 'iphone18pro', 'glacier')
  })

  it('forwards a ref to the CustomMockFrame root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<CustomMockFrame ref={ref} width={100} height={100} frameClassName="frame" />)
    expect(ref.current).toHaveClass('frame')
  })
})

describe('MockFrame runtime guards', () => {
  it('renders nothing and logs for an unknown device instead of throwing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const props = { device: 'iPhone 99' } as unknown as MockFrameProps
    const { container } = render(<MockFrame {...props} />)
    expect(container.firstChild).toBeNull()
    expect(error).toHaveBeenCalledWith(expect.stringContaining('unknown device "iPhone 99"'))
    error.mockRestore()
  })

  it('does not add the landscape class to devices without landscape support', () => {
    const props = { device: 'MacBook Pro', color: 'silver', landscape: true } as unknown as MockFrameProps
    const { container } = render(<MockFrame {...props} />)
    expect(container.firstChild).not.toHaveClass('landscape')
  })

  it('adds the landscape class and swaps dimensions when supported', () => {
    const { container } = render(
      <MockFrame device="iPhone 17" color="black" landscape width={402} height={874} />
    )
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('landscape')
    expect(el.style.width).toBe('874px')
    expect(el.style.height).toBe('402px')
  })
})

describe('MockFrame anatomy', () => {
  it('renders the Dynamic Island unless hideNotch is set', () => {
    const { container, rerender } = render(<MockFrame device="iPhone 18 Pro" color="black" />)
    expect(container.querySelector('.dynamic-island .camera')).not.toBeNull()
    rerender(<MockFrame device="iPhone 18 Pro" color="black" hideNotch />)
    expect(container.querySelector('.dynamic-island')).toBeNull()
  })
})

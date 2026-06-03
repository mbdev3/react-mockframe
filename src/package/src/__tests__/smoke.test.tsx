import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MockFrame } from '../MockFrame'

describe('test harness', () => {
  it('renders a MockFrame root element', () => {
    const { container } = render(<MockFrame device="iPhone X" />)
    expect(container.querySelector('.mockframe')).not.toBeNull()
  })
})
